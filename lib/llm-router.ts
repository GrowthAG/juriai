import {
  analyzeCaseWithClaude,
  classifyLlmError,
  getLlmRuntimeState,
  type AnalyzeInput,
  type AnalyzeResult,
  type LlmFailureStatus,
  type LlmRuntimeState,
} from "@/lib/llm";

/* LLM Router v1 — ponto único de "qual IA roda essa tarefa".
 *
 * O usuário final nunca escolhe modelo: o router decide, por tarefa. O
 * override técnico por workspace (Workspace.llmProvider/llmModel, validado
 * em lib/llm-registry.ts) continua existindo exatamente como hoje — ele só
 * deixa de ser algo que o app/actions/analyze.ts precisa conhecer.
 *
 * V1 cobre uma única tarefa ("case-analysis") e delega toda a decisão de
 * modelo/provider/fallback para o runtime já existente em lib/llm.ts (que já
 * resolve workspace → env → allowlist, e já faz fallback Vertex → direto).
 * Não há ainda escolha entre múltiplos modelos "concorrentes" para a mesma
 * tarefa — isso só faz sentido quando houver mais de um modelo ativo de
 * verdade (ver docs/60-platform/01_ai_model_routing.md). Novas tarefas devem
 * entrar como um novo LlmTaskId + uma nova função de rota aqui, nunca como
 * lógica solta nas actions. */

export type LlmTaskId = "case-analysis";

export type LlmRouteResult<TResult> =
  | { ok: true; result: TResult; model: string }
  | { ok: false; status: LlmFailureStatus };

export async function getLlmRouteState(
  _task: LlmTaskId,
): Promise<LlmRuntimeState> {
  // V1: uma tarefa só, um runtime só — delega direto para o estado atual.
  // Quando houver mais de uma tarefa/modelo, a diferenciação por task entra
  // aqui, sem mudar o contrato já consumido pelas actions.
  void _task;
  return getLlmRuntimeState();
}

export async function routeCaseAnalysis(
  input: AnalyzeInput,
): Promise<LlmRouteResult<AnalyzeResult>> {
  try {
    const { result, model } = await analyzeCaseWithClaude(input);
    return { ok: true, result, model };
  } catch (error) {
    return { ok: false, status: classifyLlmError(error) };
  }
}
