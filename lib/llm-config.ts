export const CLAUDE_MODELS = new Set([
  "claude-opus-4-7",
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "claude-sonnet-4-5",
  "claude-3-5-sonnet@20240620",
  "claude-3-5-sonnet-v2@20241022",
  "claude-3-haiku@20240307",
]);

export const GEMINI_MODELS = new Set([
  "gemini-3.6-flash",
  "gemini-3.1-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
]);

export const SUPPORTED_MODELS = new Set([...CLAUDE_MODELS, ...GEMINI_MODELS]);

export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
export const MODEL = "gemini-3.6-flash";

export type LlmExecutionPolicy = "automatic";
export const DEFAULT_LLM_POLICY: LlmExecutionPolicy = "automatic";

export function resolveAutomaticPolicyModel(): string {
  return "gemini-3.6-flash";
}

export function resolveVertexRegionCandidates(
  region: string | null | undefined,
): string[] {
  const preferred = region?.trim();
  const fallbacks = ["us-central1", "us-east5", "us-east4"];
  if (preferred && !fallbacks.includes(preferred)) {
    return [preferred, ...fallbacks];
  }
  return fallbacks;
}

export function resolveGeminiRegionCandidates(
  region: string | null | undefined,
): string[] {
  const preferred = region?.trim();
  const fallbacks = ["us-central1", "global"];
  if (preferred && !fallbacks.includes(preferred)) {
    return [preferred, ...fallbacks];
  }
  return fallbacks;
}

export function resolveModelCandidates(model: string | null | undefined): string[] {
  if (model && CLAUDE_MODELS.has(model)) {
    return [model];
  }
  return [MODEL];
}

export function resolveGeminiModelCandidates(model: string | null | undefined): string[] {
  if (model && GEMINI_MODELS.has(model)) {
    return [model];
  }
  return [DEFAULT_GEMINI_MODEL];
}
