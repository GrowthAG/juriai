/* Fonte declarativa do modelo/região que o runtime de IA do JuriAI aceita
   hoje. Claude (Vertex/direct) e Gemini (Vertex). Qualquer novo modelo/provider
   entra aqui, não solto em lib/llm.ts. */

export const MODEL = "claude-opus-4-7";
export const CLAUDE_MODELS = new Set([MODEL, "claude-sonnet-4-5"]);
export const GEMINI_MODELS = new Set(["gemini-2.5-pro", "gemini-2.5-flash"]);
export const SUPPORTED_MODELS = new Set([...CLAUDE_MODELS, ...GEMINI_MODELS]);

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-pro";

/* Router v2 (reduzido): única política ativa hoje é "automatic". Ela só
   entra quando workspace e env não definem nenhum modelo — nesse caso, em
   vez de falhar (missing_config), o runtime resolve para MODEL (Claude), o
   mesmo valor já usado como default histórico. */
export type LlmExecutionPolicy = "automatic";

export const DEFAULT_LLM_POLICY: LlmExecutionPolicy = "automatic";

export function resolveAutomaticPolicyModel(): string {
  return MODEL;
}

export function resolveVertexRegionCandidates(
  region: string | null | undefined,
) {
  const preferred = region?.trim();
  const candidates = [
    preferred,
    "us-east5",
    "europe-west4",
    "asia-southeast1",
    "us-central1",
  ];
  return candidates.filter(
    (value, index, all): value is string =>
      Boolean(value) && all.indexOf(value) === index,
  );
}

/** Regiões candidatas para Gemini no Vertex (projeto Startups validado). */
export function resolveGeminiRegionCandidates(
  region: string | null | undefined,
) {
  const preferred = region?.trim();
  const candidates = [preferred, "us-central1", "global", "europe-west1"];
  return candidates.filter(
    (value, index, all): value is string =>
      Boolean(value) && all.indexOf(value) === index,
  );
}

export function resolveModelCandidates(model: string | null | undefined) {
  const preferred = model?.trim() || process.env.JURIAI_LLM_MODEL || MODEL;
  // Não misturar famílias: se o preferido é Gemini, só candidatos Gemini.
  if (GEMINI_MODELS.has(preferred) || preferred.startsWith("gemini-")) {
    return resolveGeminiModelCandidates(preferred);
  }
  const candidates = [preferred, "claude-opus-4-7", "claude-sonnet-4-5"];
  return candidates.filter(
    (value, index, all): value is string =>
      Boolean(value) && all.indexOf(value) === index,
  );
}

export function resolveGeminiModelCandidates(model: string | null | undefined) {
  const preferred =
    model?.trim() || process.env.JURIAI_LLM_MODEL || DEFAULT_GEMINI_MODEL;
  const candidates = [preferred, "gemini-2.5-pro", "gemini-2.5-flash"];
  return candidates.filter(
    (value, index, all): value is string =>
      Boolean(value) && all.indexOf(value) === index,
  );
}
