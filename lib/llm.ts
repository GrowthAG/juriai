import Anthropic from "@anthropic-ai/sdk";
import AnthropicVertex from "@anthropic-ai/vertex-sdk";
import { getActorContext } from "@/lib/actor-context";
import { prisma } from "@/lib/prisma";
import {
  SUPPORTED_MODELS,
  resolveModelCandidates,
  resolveVertexRegionCandidates,
} from "@/lib/llm-config";

/* Cliente Claude para o motor jurídico do JuriAI.
 *
 * O runtime suporta apenas Claude direto e Claude no Vertex. A existência de
 * ADC local, sozinha, não torna o workspace pronto para executar análises. */

export type LlmRuntimeStatus =
  | "ready"
  | "missing_config"
  | "invalid_credentials"
  | "unsupported_model"
  | "quota_exceeded"
  | "unavailable";

export type LlmRuntimeState = {
  status: LlmRuntimeStatus;
};

export type LlmFailureStatus = Exclude<LlmRuntimeStatus, "ready">;

type LlmProviderKind = "anthropic-vertex" | "anthropic-direct";

type LlmClient = {
  messages: {
    create: (params: {
      model: string;
      max_tokens: number;
      thinking: { type: "adaptive" };
      system: string;
      output_config: {
        format: {
          type: "json_schema";
          schema: typeof SCHEMA;
        };
      };
      messages: Array<{
        role: "user";
        content: string;
      }>;
    }) => Promise<{
      content: Array<{ type: string; text?: string }>;
      model: string;
      stop_reason?: string | null;
    }>;
  };
};

type LlmProviderConfig = {
  kind: LlmProviderKind;
  label: string;
  model: string;
  client: LlmClient;
};

type WorkspaceLlmConfig = {
  workspaceId: string;
  llmProvider: string | null;
  llmRegion: string | null;
  llmProjectId: string | null;
  llmModel: string | null;
};

type WorkspaceLlmConfigLookup =
  | { ok: true; config: WorkspaceLlmConfig | null }
  | { ok: false };

type LlmRuntimeResolution =
  | {
      state: { status: "ready" };
      provider: LlmProviderConfig;
      workspaceConfig: WorkspaceLlmConfig | null;
    }
  | {
      state: { status: LlmFailureStatus };
      provider: null;
      workspaceConfig: WorkspaceLlmConfig | null;
    };

class LlmRuntimeError extends Error {
  readonly status: LlmFailureStatus;

  constructor(status: LlmFailureStatus, message: string) {
    super(message);
    this.name = "LlmRuntimeError";
    this.status = status;
  }
}

export type AnalyzeInput = {
  title: string;
  domainLabel: string;
  typeLabel: string;
  summary: string | null;
  evidenceLabels: string[];
  debugId?: string; // Temporarily added for debugging
};

export type AnalyzeResult = {
  resumoAnalise: string;
  timeline: Array<{ description: string; certainty: "COMPROVADO" | "ALEGADO" }>;
  gaps: Array<{
    type: "PERGUNTA_PENDENTE" | "PROVA_NECESSARIA" | "RISCO";
    description: string;
  }>;
  confidence: "ALTA" | "MEDIA" | "BAIXA";
  groundedOn: string[];
  unresolvedGaps: string[];
};

function buildVertexClient(region: string, projectId?: string | null) {
  return new AnthropicVertex({
    region,
    projectId:
      projectId?.trim() ||
      process.env.ANTHROPIC_VERTEX_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      undefined,
  }) as unknown as LlmClient;
}

function getVertexProjectId(input?: { projectId?: string | null }) {
  return (
    input?.projectId?.trim() ||
    process.env.ANTHROPIC_VERTEX_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    undefined
  );
}

function buildVertexClientForConfig(input?: {
  region?: string | null;
  projectId?: string | null;
}) {
  const region = input?.region?.trim();
  const projectId = getVertexProjectId(input);
  if (!region || !projectId) {
    throw new LlmRuntimeError(
      "missing_config",
      "A configuração do Vertex está incompleta.",
    );
  }

  return buildVertexClient(region, projectId);
}

function buildDirectClient(): LlmClient {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não configurada.");
  }

  return new Anthropic({ apiKey }) as unknown as LlmClient;
}

function resolveModel(overrideModel: string | null | undefined) {
  return overrideModel?.trim() || process.env.JURIAI_LLM_MODEL?.trim() || null;
}

function resolveProviderName(value: string | null | undefined) {
  const normalized = value?.trim();
  if (normalized === "anthropic-direct") return "anthropic-direct" as const;
  if (normalized === "anthropic-vertex") return "anthropic-vertex" as const;
  return null;
}

function hasAnthropicApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function readErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") return null;
  const record = error as Record<string, unknown>;
  const value = record.status ?? record.statusCode;
  return typeof value === "number" ? value : null;
}

function readErrorText(error: unknown) {
  if (error instanceof Error) {
    const record = error as Error & {
      code?: unknown;
      error?: { code?: unknown; status?: unknown; message?: unknown };
    };
    return [
      error.message,
      record.code,
      record.error?.code,
      record.error?.status,
      record.error?.message,
    ]
      .filter((value) => typeof value === "string")
      .join(" ")
      .toLowerCase();
  }
  return typeof error === "string" ? error.toLowerCase() : "";
}

function isVertexServiceabilityError(error: unknown) {
  const message = readErrorText(error);
  return (
    message.includes("publisher model") ||
    message.includes("publisher") ||
    message.includes("not serviceable in region") ||
    message.includes("is not serviceable") ||
    message.includes("failed_precondition") ||
    message.includes("serviceable in region")
  );
}

export function classifyLlmError(error: unknown): LlmFailureStatus {
  if (error instanceof LlmRuntimeError) return error.status;

  const status = readErrorStatus(error);
  const text = readErrorText(error);

  if (
    status === 401 ||
    status === 403 ||
    text.includes("unauthenticated") ||
    text.includes("unauthorized") ||
    text.includes("permission_denied") ||
    text.includes("permission denied") ||
    text.includes("failed to acquire google oauth") ||
    text.includes("invalid api key") ||
    text.includes("invalid x-api-key") ||
    text.includes("credential")
  ) {
    return "invalid_credentials";
  }

  if (
    status === 429 ||
    text.includes("resource_exhausted") ||
    text.includes("quota") ||
    text.includes("rate limit")
  ) {
    return "quota_exceeded";
  }

  if (
    status === 404 ||
    isVertexServiceabilityError(error) ||
    text.includes("unsupported model") ||
    text.includes("model not found")
  ) {
    return "unsupported_model";
  }

  return "unavailable";
}

async function resolveWorkspaceLlmConfig(): Promise<WorkspaceLlmConfigLookup> {
  try {
    const context = await getActorContext();
    const workspace = await prisma.workspace.findUnique({
      where: { id: context.workspaceId },
      select: {
        id: true,
        llmProvider: true,
        llmRegion: true,
        llmProjectId: true,
        llmModel: true,
      },
    });
    if (!workspace) return { ok: true, config: null };
    return {
      ok: true,
      config: {
        workspaceId: workspace.id,
        llmProvider: workspace.llmProvider,
        llmRegion: workspace.llmRegion,
        llmProjectId: workspace.llmProjectId,
        llmModel: workspace.llmModel,
      },
    };
  } catch (error) {
    console.error("[JuriAI LLM] falha ao carregar configuração do workspace", {
      error,
    });
    return { ok: false };
  }
}

async function resolveLlmRuntime(): Promise<LlmRuntimeResolution> {
  const workspaceLookup = await resolveWorkspaceLlmConfig();
  if (!workspaceLookup.ok) {
    return {
      state: { status: "unavailable" },
      provider: null,
      workspaceConfig: null,
    };
  }

  const workspaceConfig = workspaceLookup.config;
  const configuredProvider =
    workspaceConfig?.llmProvider?.trim() ||
    process.env.JURIAI_LLM_PROVIDER?.trim() ||
    null;
  const model = resolveModel(workspaceConfig?.llmModel);

  if (!configuredProvider || !model) {
    return {
      state: { status: "missing_config" },
      provider: null,
      workspaceConfig,
    };
  }

  if (!SUPPORTED_MODELS.has(model)) {
    return {
      state: { status: "unsupported_model" },
      provider: null,
      workspaceConfig,
    };
  }

  const provider = resolveProviderName(configuredProvider);
  if (!provider) {
    return {
      state: { status: "missing_config" },
      provider: null,
      workspaceConfig,
    };
  }

  if (provider === "anthropic-direct") {
    if (!hasAnthropicApiKey()) {
      return {
        state: { status: "missing_config" },
        provider: null,
        workspaceConfig,
      };
    }

    return {
      state: { status: "ready" },
      provider: {
        kind: "anthropic-direct",
        label: "Claude direto",
        model,
        client: buildDirectClient(),
      },
      workspaceConfig,
    };
  }

  const region =
    workspaceConfig?.llmRegion?.trim() ||
    process.env.CLOUD_ML_REGION?.trim() ||
    process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
    null;
  const projectId =
    workspaceConfig?.llmProjectId?.trim() ||
    process.env.ANTHROPIC_VERTEX_PROJECT_ID?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.GCLOUD_PROJECT?.trim() ||
    null;

  if (!region || !projectId) {
    return {
      state: { status: "missing_config" },
      provider: null,
      workspaceConfig,
    };
  }

  return {
    state: { status: "ready" },
    provider: {
      kind: "anthropic-vertex",
      label: "Claude no Vertex",
      model,
      client: buildVertexClientForConfig({ region, projectId }),
    },
    workspaceConfig,
  };
}

export async function getLlmRuntimeState(): Promise<LlmRuntimeState> {
  const runtime = await resolveLlmRuntime();
  return runtime.state;
}

export async function isLlmConfigured(): Promise<boolean> {
  const { status } = await getLlmRuntimeState();
  return status === "ready";
}

async function persistSuccessfulVertexConfig(
  workspaceId: string | undefined,
  region: string,
  model: string,
) {
  if (!workspaceId) return;

  try {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { llmRegion: region, llmModel: model, llmProvider: "anthropic-vertex" },
    });
  } catch {
    // Se a persistência falhar, seguimos com a configuração funcional desta execução.
  }
}

async function runAnalysis(
  provider: LlmProviderConfig,
  input: AnalyzeInput,
): Promise<{ result: AnalyzeResult; model: string }> {
  const provas =
    input.evidenceLabels.length > 0
      ? input.evidenceLabels.map((l) => `- ${l}`).join("\n")
      : "(nenhuma prova anexada: todos os fatos devem ser ALEGADO)";

  const userContent = `Analise este caso.

Título: ${input.title}
Área: ${input.domainLabel}
Tipo: ${input.typeLabel}

Provas disponíveis no caso:
${provas}

Narrativa do advogado:
${input.summary?.trim() || "(sem resumo informado)"}`;

  const response = await provider.client.messages.create({
    model: provider.model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
    messages: [{ role: "user", content: userContent }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("A análise foi recusada pelo modelo. Revise a narrativa do caso.");
  }

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!textBlock) throw new Error("Resposta da IA sem conteúdo de texto.");

  let result: AnalyzeResult;
  try {
    result = JSON.parse(textBlock.text) as AnalyzeResult;
  } catch {
    throw new Error("Não foi possível interpretar a resposta da IA como JSON.");
  }

  return { result, model: response.model };
}

async function runVertexAnalysisWithFallbacks(
  workspaceConfig: WorkspaceLlmConfig,
  input: AnalyzeInput,
) {
  const projectId = getVertexProjectId({
    projectId: workspaceConfig.llmProjectId,
  });
  const regions = resolveVertexRegionCandidates(workspaceConfig.llmRegion);
  const models = resolveModelCandidates(workspaceConfig.llmModel);

  let lastError: unknown = null;

  for (const model of models) {
    for (const region of regions) {
      // BEGIN: TEMPORARY LOGGING FOR DEBUGGING VERTEX ATTEMPTS
      console.log("[JuriAI LLM DEBUG]", {
        at: "runVertexAnalysisWithFallbacks.attempt",
        debugId: input.debugId ?? "N/A", // Use debugId from input
        attemptedProvider: "anthropic-vertex",
        projectId: projectId ?? null,
        location: region,
        model: model,
        timestamp: new Date().toISOString(),
      });
      // END: TEMPORARY LOGGING FOR DEBUGGING VERTEX ATTEMPTS

      const provider: LlmProviderConfig = {
        kind: "anthropic-vertex",
        label: `Claude no Vertex (${region})`,
        model,
        client: buildVertexClient(region, projectId),
      };

      try {
        const result = await runAnalysis(provider, input);
        await persistSuccessfulVertexConfig(workspaceConfig.workspaceId, region, model);
        return result;
      } catch (error) {
        lastError = error;
        if (!isVertexServiceabilityError(error)) {
          throw error;
        }
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("Falha ao executar a análise no Vertex.");
}

const SYSTEM = `Você é um analista jurídico do JuriAI, apoio técnico a advogados cíveis B2B brasileiros.
Sua função é mapear o caso a partir da narrativa, SEM redigir peça e SEM dar conselho conclusivo.

REGRAS ANTI-ALUCINAÇÃO (inquebráveis):
1. NUNCA invente fatos, jurisprudência, números de artigo, súmulas, prazos ou valores.
2. NÃO presuma pagamento, entrega, aceite, inadimplemento ou rescisão sem prova documental.
3. Cada fato da linha do tempo recebe "certainty":
   - "COMPROVADO" SOMENTE se houver uma prova correspondente na lista de provas fornecida.
   - "ALEGADO" (padrão) para tudo que vem só da narrativa, sem prova anexa.
   Na dúvida, use "ALEGADO".
4. Identifique lacunas ("gaps"):
   - "PERGUNTA_PENDENTE": fato que só o cliente/advogado pode esclarecer.
   - "PROVA_NECESSARIA": documento que precisa ser localizado.
   - "RISCO": consequência jurídica se a lacuna não for sanada.
5. "groundedOn": liste em que você se baseou (trechos da narrativa, provas citadas).
6. "unresolvedGaps": liste curto as lacunas que impedem conclusão segura.
7. "confidence": ALTA só com provas fortes; MEDIA com narrativa + alguma prova; BAIXA quando é quase tudo alegado.

Responda em português do Brasil. Seja específico e sóbrio, sem superlativo, sem inventar.
Nunca use travessão nem traço (o caractere "—") como pontuação: prefira vírgula, dois-pontos ou ponto.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    resumoAnalise: { type: "string" },
    timeline: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          description: { type: "string" },
          certainty: { type: "string", enum: ["COMPROVADO", "ALEGADO"] },
        },
        required: ["description", "certainty"],
      },
    },
    gaps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: ["PERGUNTA_PENDENTE", "PROVA_NECESSARIA", "RISCO"],
          },
          description: { type: "string" },
        },
        required: ["type", "description"],
      },
    },
    confidence: { type: "string", enum: ["ALTA", "MEDIA", "BAIXA"] },
    groundedOn: { type: "array", items: { type: "string" } },
    unresolvedGaps: { type: "array", items: { type: "string" } },
  },
  required: [
    "resumoAnalise",
    "timeline",
    "gaps",
    "confidence",
    "groundedOn",
    "unresolvedGaps",
  ],
} as const;

export async function analyzeCaseWithClaude(
  input: AnalyzeInput,
): Promise<{ result: AnalyzeResult; model: string }> {
  const debugId = input.debugId ?? Math.random().toString(36).substring(2, 8);
  const runtime = await resolveLlmRuntime();
  const provider = runtime.provider;
  const workspaceConfig = runtime.workspaceConfig;

  console.log("[JuriAI LLM DEBUG]", {
    at: "analyzeCaseWithClaude",
    debugId,
    providerKind: provider?.kind ?? null,
    workspaceConfigSource: workspaceConfig ? "database" : "environment",
    model: provider?.model ?? null,
    workspaceId: workspaceConfig?.workspaceId ?? null,
    hasAnthropicKey: hasAnthropicApiKey(),
    timestamp: new Date().toISOString(),
  });

  if (!provider) {
    throw new LlmRuntimeError(
      runtime.state.status,
      "O runtime de IA não está pronto para executar a análise.",
    );
  }

  try {
    if (provider.kind === "anthropic-vertex" && workspaceConfig) {
      return await runVertexAnalysisWithFallbacks(workspaceConfig, {
        ...input,
        debugId,
      });
    }

    return await runAnalysis(provider, input);
  } catch (error) {
    if (
      provider.kind === "anthropic-vertex" &&
      hasAnthropicApiKey() &&
      isVertexServiceabilityError(error)
    ) {
      const fallback: LlmProviderConfig = {
        kind: "anthropic-direct",
        label: "Claude direto",
        model: provider.model,
        client: buildDirectClient(),
      };

      return await runAnalysis(fallback, input);
    }

    if (provider.kind === "anthropic-vertex" && isVertexServiceabilityError(error)) {
      const safeError = {
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : String(error),
        status: (error as Record<string, unknown>).status ?? null,
        code: (error as Record<string, unknown>).code ?? null,
      };
      console.error("[JuriAI LLM ERROR DEBUG]", {
        at: "analyzeCaseWithClaude.catch",
        debugId,
        providerKind: provider.kind,
        model: provider.model,
        error: safeError,
        timestamp: new Date().toISOString(),
      });
      throw new LlmRuntimeError(
        "unsupported_model",
        "O modelo configurado não está disponível nesta região.",
      );
    }

    throw error;
  }
}
