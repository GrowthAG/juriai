import Anthropic from "@anthropic-ai/sdk";
import AnthropicVertex from "@anthropic-ai/vertex-sdk";
import { getActorContext } from "@/lib/actor-context";
import { prisma } from "@/lib/prisma";
import {
  SUPPORTED_MODELS,
  resolveAutomaticPolicyModel,
  resolveModelCandidates,
  resolveVertexRegionCandidates,
} from "@/lib/llm-config";
import {
  SUPPORTED_LLM_PROVIDERS,
  validateWorkspaceLlmConfig,
  type SupportedLlmProvider,
  type WorkspaceLlmRegistryConfig,
} from "@/lib/llm-registry";

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

type JsonSchema = {
  type: "object";
  additionalProperties: boolean;
  properties: Record<string, unknown>;
  required: readonly string[];
};

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
          schema: JsonSchema;
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

export type DraftGenerationInput = {
  title: string;
  draftTypeLabel: string;
  domainLabel: string;
  caseTypeLabel: string;
  workspaceName: string;
  clientName: string;
  summary: string | null;
  instructions: string | null;
  evidence: Array<{
    label: string;
    description: string | null;
    analysis: string | null;
  }>;
  timeline: Array<{
    description: string;
    certainty: "COMPROVADO" | "ALEGADO";
  }>;
  gaps: Array<{
    type: "PERGUNTA_PENDENTE" | "PROVA_NECESSARIA" | "RISCO";
    description: string;
    resolved: boolean;
  }>;
  parties: Array<{
    name: string;
    role: string;
    kind: string;
    notes: string | null;
  }>;
};

export type DraftGenerationResult = {
  title: string;
  content: string;
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

function resolveProviderName(
  value: string | null | undefined,
): SupportedLlmProvider | null {
  const normalized = value?.trim();
  if (!normalized) return null;
  return (SUPPORTED_LLM_PROVIDERS as readonly string[]).includes(normalized)
    ? (normalized as SupportedLlmProvider)
    : null;
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

  let workspaceLlm: WorkspaceLlmRegistryConfig;
  try {
    workspaceLlm = validateWorkspaceLlmConfig({
      llmProvider: workspaceConfig?.llmProvider ?? null,
      llmModel: workspaceConfig?.llmModel ?? null,
    });
  } catch {
    // Valor explícito do workspace inválido: erro distinto (mesmo registry
    // usado na gravação admin), sem cair silenciosamente para env/default —
    // workspace preenchido sempre vence, mesmo quando o valor é inválido.
    return {
      state: { status: "unsupported_model" },
      provider: null,
      workspaceConfig,
    };
  }

  // env só entra como default quando o workspace não define nada explícito.
  // Se nem workspace nem env definirem modelo, a política automática decide
  // (hoje resolve para MODEL, sem economic/balanced/max_quality ainda).
  const configuredProvider =
    workspaceLlm.llmProvider ??
    resolveProviderName(process.env.JURIAI_LLM_PROVIDER?.trim());
  const model =
    workspaceLlm.llmModel ?? resolveModel(null) ?? resolveAutomaticPolicyModel();

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

  const provider = configuredProvider;

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

async function runDraftGeneration(
  provider: LlmProviderConfig,
  input: DraftGenerationInput,
): Promise<{ result: DraftGenerationResult; model: string }> {
  const userContent = `Gere uma minuta para revisão do advogado.

Regras:
- Produza uma minuta para revisão do advogado.
- Não declare que o documento está pronto para envio.
- Aponte lacunas quando faltarem dados.
- Use apenas os fatos fornecidos no caso, provas, timeline e resumo.
- Não invente fatos, artigos, jurisprudência, prazos, valores ou pedidos não suportados.
- Se houver lacunas, mantenha placeholders explícitos como [inserir ...].
- O texto final deve ser útil como rascunho interno, não como peça final.

Contexto estruturado do caso:
${JSON.stringify(input, null, 2)}`;

  const response = await provider.client.messages.create({
    model: provider.model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: DRAFT_SYSTEM,
    output_config: { format: { type: "json_schema", schema: DRAFT_SCHEMA } },
    messages: [{ role: "user", content: userContent }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("A geração do rascunho foi recusada pelo modelo.");
  }

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!textBlock) throw new Error("Resposta da IA sem conteúdo de texto.");

  let result: DraftGenerationResult;
  try {
    result = JSON.parse(textBlock.text) as DraftGenerationResult;
  } catch {
    throw new Error("Não foi possível interpretar o rascunho como JSON.");
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
  const runtime = await resolveLlmRuntime();
  const provider = runtime.provider;
  const workspaceConfig = runtime.workspaceConfig;

  if (!provider) {
    throw new LlmRuntimeError(
      runtime.state.status,
      "O runtime de IA não está pronto para executar a análise.",
    );
  }

  try {
    if (provider.kind === "anthropic-vertex" && workspaceConfig) {
      return await runVertexAnalysisWithFallbacks(workspaceConfig, input);
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
      throw new LlmRuntimeError(
        "unsupported_model",
        "O modelo configurado não está disponível nesta região.",
      );
    }

    throw error;
  }
}

export async function generateDraftWithClaude(
  input: DraftGenerationInput,
): Promise<{ result: DraftGenerationResult; model: string }> {
  const runtime = await resolveLlmRuntime();
  const provider = runtime.provider;
  const workspaceConfig = runtime.workspaceConfig;

  if (!provider) {
    throw new LlmRuntimeError(
      runtime.state.status,
      "O runtime de IA não está pronto para gerar o rascunho.",
    );
  }

  try {
    if (provider.kind === "anthropic-vertex" && workspaceConfig) {
      return await runVertexDraftGenerationWithFallbacks(workspaceConfig, input);
    }

    return await runDraftGeneration(provider, input);
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

      return await runDraftGeneration(fallback, input);
    }

    if (provider.kind === "anthropic-vertex" && isVertexServiceabilityError(error)) {
      throw new LlmRuntimeError(
        "unsupported_model",
        "O modelo configurado não está disponível nesta região.",
      );
    }

    throw error;
  }
}

async function runVertexDraftGenerationWithFallbacks(
  workspaceConfig: WorkspaceLlmConfig,
  input: DraftGenerationInput,
) {
  const projectId = getVertexProjectId({
    projectId: workspaceConfig.llmProjectId,
  });
  const regions = resolveVertexRegionCandidates(workspaceConfig.llmRegion);
  const models = resolveModelCandidates(workspaceConfig.llmModel);

  let lastError: unknown = null;

  for (const model of models) {
    for (const region of regions) {
      const provider: LlmProviderConfig = {
        kind: "anthropic-vertex",
        label: `Claude no Vertex (${region})`,
        model,
        client: buildVertexClient(region, projectId),
      };

      try {
        const result = await runDraftGeneration(provider, input);
        await persistSuccessfulVertexConfig(
          workspaceConfig.workspaceId,
          region,
          model,
        );
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
  throw new Error("Falha ao gerar o rascunho no Vertex.");
}

const DRAFT_SYSTEM = `Você é um redator jurídico do JuriAI, apoio técnico a advogados brasileiros.
Sua função é produzir uma minuta para revisão do advogado, não um documento final.

REGRAS ANTI-ALUCINAÇÃO (inquebráveis):
1. NUNCA invente fatos, jurisprudência, números de artigo, súmulas, prazos, valores ou pedidos.
2. Use apenas os fatos fornecidos no caso, provas, timeline e resumo.
3. Não declare que o documento está pronto para envio, protocolo ou assinatura.
4. Se algo faltar, exponha isso claramente como lacuna ou placeholder, por exemplo [inserir fundamento jurídico aplicável].
5. A minuta deve ser útil para revisão humana, com estrutura limpa e sóbria.
6. Se houver lacunas relevantes, elas devem aparecer também em unresolvedGaps.
7. groundedOn deve listar apenas as bases factuais usadas.
8. confidence deve refletir a qualidade do contexto, sem exagero.

Responda em português do Brasil. Seja específico e sóbrio, sem superlativo, sem inventar.
Nunca use travessão nem traço (o caractere "—") como pontuação: prefira vírgula, dois-pontos ou ponto.`;

const DRAFT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    content: { type: "string" },
    confidence: { type: "string", enum: ["ALTA", "MEDIA", "BAIXA"] },
    groundedOn: { type: "array", items: { type: "string" } },
    unresolvedGaps: { type: "array", items: { type: "string" } },
  },
  required: ["title", "content", "confidence", "groundedOn", "unresolvedGaps"],
} as const;

/* ---------------------------------------------------------------------------
 * Copiloto conversacional: conduz a conversa do caso. Não decide analisar
 * nem redigir (isso fica no CaseCopilotPanel). Anti-alucinação: só usa o
 * contexto do caso e o histórico enviados.
 * ------------------------------------------------------------------------- */

const COPILOT_SYSTEM = `Você é o assistente de conversa do JuriAI, apoio técnico a advogados cíveis B2B brasileiros, dentro da conversa de um caso específico já aberto.

Seu papel aqui é só conduzir a conversa: entender o que o advogado descreveu e perguntar o que falta para avançar. Você NÃO decide analisar o caso nem redigir peça nesta resposta, isso já é decidido por outra parte do sistema, fora do que você escreve.

REGRAS ANTI-ALUCINAÇÃO (inquebráveis):
1. Nunca invente fatos, provas, prazos ou valores que não estejam no contexto do caso ou na conversa abaixo.
2. Não presuma pagamento, entrega, aceite, inadimplemento ou rescisão sem prova documental já registrada no caso.
3. Não afirme que uma peça foi redigida, enviada ou está pronta: isso é sempre feito por outra etapa do sistema, nunca por esta resposta.
4. Se o contexto do caso já lista lacunas pendentes, priorize perguntar por elas antes de qualquer outra coisa.
5. Seja específico e breve: de 1 a 3 frases, tom profissional e direto, sem repetir saudação (ela já aconteceu antes desta resposta).

Responda em português do Brasil. Nunca use travessão nem o caractere "—": prefira vírgula, dois-pontos ou ponto.
Responda apenas com a próxima mensagem do assistente nesta conversa, sem repetir o que o advogado já disse.`;

const COPILOT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" },
  },
  required: ["reply"],
} as const;

export type CopilotReplyInput = {
  caseTitle: string;
  domainLabel: string;
  typeLabel: string;
  statusLabel: string;
  evidenceCount: number;
  timelineCount: number;
  gapCount: number;
  gapPrompts: string[];
  history: Array<{ role: "user" | "assistant"; text: string }>;
  latestMessage: string;
  attachedDocument?: { label: string; analysis: string };
};

async function runCopilotReply(
  provider: LlmProviderConfig,
  input: CopilotReplyInput,
): Promise<{ result: { reply: string }; model: string }> {
  const transcript = input.history
    .map((m) => `${m.role === "user" ? "Advogado" : "Assistente"}: ${m.text}`)
    .join("\n");

  const gaps =
    input.gapPrompts.length > 0
      ? input.gapPrompts.map((g) => `- ${g}`).join("\n")
      : "(nenhuma lacuna registrada ainda)";

  const attachedBlock = input.attachedDocument
    ? `

Documento que o advogado acabou de anexar nesta mensagem ("${input.attachedDocument.label}"), já lido:
${input.attachedDocument.analysis}

Comente o que esse documento traz de relevante para o caso e o próximo passo, usando apenas o que está transcrito acima. Não invente cláusula, valor ou data que não esteja no texto.`
    : "";

  const userContent = `Contexto do caso:
Título: ${input.caseTitle}
Área: ${input.domainLabel}
Tipo: ${input.typeLabel}
Status: ${input.statusLabel}
Provas anexadas: ${input.evidenceCount}
Fatos na linha do tempo: ${input.timelineCount}
Lacunas pendentes (${input.gapCount}):
${gaps}

Conversa até agora:
${transcript || "(início da conversa)"}

Nova mensagem do advogado:
${input.latestMessage}${attachedBlock}

Responda como a próxima mensagem do assistente nesta conversa.`;

  const response = await provider.client.messages.create({
    model: provider.model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: COPILOT_SYSTEM,
    output_config: { format: { type: "json_schema", schema: COPILOT_SCHEMA } },
    messages: [{ role: "user", content: userContent }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("A resposta foi recusada pelo modelo.");
  }

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!textBlock) throw new Error("Resposta da IA sem conteúdo de texto.");

  let result: { reply: string };
  try {
    result = JSON.parse(textBlock.text) as { reply: string };
  } catch {
    throw new Error("Não foi possível interpretar a resposta da IA.");
  }

  return { result, model: response.model };
}

export async function craftCopilotReply(
  input: CopilotReplyInput,
): Promise<{ result: { reply: string }; model: string }> {
  const runtime = await resolveLlmRuntime();
  const provider = runtime.provider;

  if (!provider) {
    throw new LlmRuntimeError(
      runtime.state.status,
      "O runtime de IA não está pronto para responder.",
    );
  }

  try {
    return await runCopilotReply(provider, input);
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
      return await runCopilotReply(fallback, input);
    }
    throw error;
  }
}
