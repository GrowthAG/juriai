/* Fonte declarativa do modelo/região que o runtime de IA do JuriAI aceita
   hoje. Extração 1:1 de lib/llm.ts (Passo 1 do plano em
   docs/60-platform/01_ai_model_routing.md, seção 8) — sem mudança de
   comportamento. Qualquer novo modelo/provider entra aqui, não solto em
   lib/llm.ts. */

export const MODEL = "claude-opus-4-7";
export const SUPPORTED_MODELS = new Set([MODEL, "claude-sonnet-4-5"]);

/* Router v2 (reduzido): única política ativa hoje é "automatic". Ela só
   entra quando workspace e env não definem nenhum modelo — nesse caso, em
   vez de falhar (missing_config), o runtime resolve para MODEL, o mesmo
   valor já usado como default em todo o resto do arquivo. economic/balanced/
   max_quality ainda não estão habilitadas (ver
   docs/60-platform/01_ai_model_routing.md para o desenho completo). */
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

export function resolveModelCandidates(model: string | null | undefined) {
  const preferred = model?.trim() || process.env.JURIAI_LLM_MODEL || MODEL;
  const candidates = [preferred, "claude-opus-4-7", "claude-sonnet-4-5"];
  return candidates.filter(
    (value, index, all): value is string =>
      Boolean(value) && all.indexOf(value) === index,
  );
}
