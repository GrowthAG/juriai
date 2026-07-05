import { expect, test } from "@playwright/test";
import {
  AI_STATUS_MESSAGES,
  getAnalysisButtonState,
} from "../components/AnalisarCasoButton";
import {
  classifyLlmError,
  type LlmFailureStatus,
} from "../lib/llm";

const FAILURE_STATUSES: LlmFailureStatus[] = [
  "missing_config",
  "invalid_credentials",
  "unsupported_model",
  "quota_exceeded",
  "unavailable",
];

test.describe("estado do botão de análise", () => {
  test("ready mantém a ação habilitada", () => {
    const state = getAnalysisButtonState("ready", false);

    expect(state).toEqual({ disabled: false, message: null });
  });

  for (const status of FAILURE_STATUSES) {
    test(`${status} desabilita a ação e mostra mensagem segura`, () => {
      const state = getAnalysisButtonState(status, false);

      expect(state).toEqual({
        disabled: true,
        message: AI_STATUS_MESSAGES[status],
      });
    });
  }

  test("pending desabilita a ação pronta", () => {
    expect(getAnalysisButtonState("ready", true).disabled).toBe(true);
  });
});

test.describe("classificação de falhas de IA", () => {
  test("classifica autenticação e permissão", () => {
    expect(classifyLlmError(httpError(401, "Unauthenticated"))).toBe(
      "invalid_credentials",
    );
    expect(classifyLlmError(httpError(403, "Permission denied"))).toBe(
      "invalid_credentials",
    );
  });

  test("classifica quota", () => {
    expect(classifyLlmError(httpError(429, "Resource exhausted"))).toBe(
      "quota_exceeded",
    );
  });

  test("classifica modelo incompatível", () => {
    expect(classifyLlmError(httpError(404, "Model not found"))).toBe(
      "unsupported_model",
    );
    expect(
      classifyLlmError(new Error("Publisher model is not serviceable in region")),
    ).toBe("unsupported_model");
  });

  test("classifica falha não reconhecida como indisponível", () => {
    expect(classifyLlmError(new Error("fetch failed"))).toBe("unavailable");
  });
});

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}
