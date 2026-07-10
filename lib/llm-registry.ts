import {
  CLAUDE_MODELS,
  GEMINI_MODELS,
  SUPPORTED_MODELS,
} from "@/lib/llm-config";

export const SUPPORTED_LLM_PROVIDERS = [
  "anthropic-vertex",
  "anthropic-direct",
  "google-vertex-gemini",
] as const;

export type SupportedLlmProvider = (typeof SUPPORTED_LLM_PROVIDERS)[number];

export type WorkspaceLlmRegistryConfig = {
  llmProvider: SupportedLlmProvider | null;
  llmModel: string | null;
};

export { SUPPORTED_MODELS as SUPPORTED_LLM_MODELS };

function modelsForProvider(provider: SupportedLlmProvider): Set<string> {
  if (provider === "google-vertex-gemini") return GEMINI_MODELS;
  return CLAUDE_MODELS;
}

const SUPPORTED_LLM_COMBINATIONS = new Set(
  SUPPORTED_LLM_PROVIDERS.flatMap((provider) =>
    [...modelsForProvider(provider)].map((model) => `${provider}:${model}`),
  ),
);

function normalizeInheritedLlmValue(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized || normalized === "inherit") return null;
  return normalized;
}

export function normalizeWorkspaceLlmProvider(
  value: string | null | undefined,
): SupportedLlmProvider | null {
  const normalized = normalizeInheritedLlmValue(value);
  if (normalized === null) return null;
  if ((SUPPORTED_LLM_PROVIDERS as readonly string[]).includes(normalized)) {
    return normalized as SupportedLlmProvider;
  }
  throw new Error("Provider de IA inválido.");
}

export function normalizeWorkspaceLlmModel(
  value: string | null | undefined,
): string | null {
  const normalized = normalizeInheritedLlmValue(value);
  if (normalized === null) return null;
  if (SUPPORTED_MODELS.has(normalized)) return normalized;
  throw new Error("Modelo de IA inválido.");
}

export function validateWorkspaceLlmConfig(input: {
  llmProvider?: string | null;
  llmModel?: string | null;
  current?: {
    llmProvider: string | null;
    llmModel: string | null;
  } | null;
}): WorkspaceLlmRegistryConfig {
  const current = input.current
    ? {
        llmProvider: normalizeWorkspaceLlmProvider(input.current.llmProvider),
        llmModel: normalizeWorkspaceLlmModel(input.current.llmModel),
      }
    : { llmProvider: null, llmModel: null };

  const llmProvider =
    input.llmProvider === undefined
      ? current.llmProvider
      : normalizeWorkspaceLlmProvider(input.llmProvider);
  const llmModel =
    input.llmModel === undefined
      ? current.llmModel
      : normalizeWorkspaceLlmModel(input.llmModel);

  if (
    llmProvider !== null &&
    llmModel !== null &&
    !SUPPORTED_LLM_COMBINATIONS.has(`${llmProvider}:${llmModel}`)
  ) {
    throw new Error("Combinação provider/model de IA inválida.");
  }

  return { llmProvider, llmModel };
}
