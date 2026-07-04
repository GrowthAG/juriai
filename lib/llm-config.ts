/* Fonte declarativa do modelo/região que o runtime de IA do JuriAI aceita
   hoje. Extração 1:1 de lib/llm.ts (Passo 1 do plano em
   docs/60-platform/01_ai_model_routing.md, seção 8) — sem mudança de
   comportamento. Qualquer novo modelo/provider entra aqui, não solto em
   lib/llm.ts. */

export const MODEL = "claude-opus-4-7";
export const SUPPORTED_MODELS = new Set([MODEL, "claude-sonnet-4-5"]);

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

export function resolveModelCandidates(model: string | null | undefined) {
  const preferred = model?.trim() || process.env.JURIAI_LLM_MODEL || MODEL;
  const candidates = [preferred, "claude-opus-4-7", "claude-sonnet-4-5"];
  return candidates.filter(
    (value, index, all): value is string =>
      Boolean(value) && all.indexOf(value) === index,
  );
}
