"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { analyzeCase } from "@/app/actions/analyze";
import type { LlmFailureStatus, LlmRuntimeStatus } from "@/lib/llm";

export const AI_STATUS_MESSAGES: Record<LlmFailureStatus, string> = {
  missing_config: "A IA ainda não foi configurada para este workspace.",
  invalid_credentials: "A configuração de acesso à IA precisa ser atualizada.",
  unsupported_model: "A configuração de IA não é compatível com esta análise.",
  quota_exceeded: "O limite de uso da IA foi atingido neste momento.",
  unavailable: "A análise por IA está temporariamente indisponível.",
};

export function getAnalysisButtonState(
  status: LlmRuntimeStatus,
  isPending: boolean,
) {
  return {
    disabled: status !== "ready" || isPending,
    message: status === "ready" ? null : AI_STATUS_MESSAGES[status],
  };
}

export function AnalisarCasoButton({
  caseId,
  initialStatus,
}: {
  caseId: string;
  initialStatus: LlmRuntimeStatus;
}) {
  const [status, setStatus] = useState<LlmRuntimeStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();
  const buttonState = getAnalysisButtonState(status, isPending);

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="md"
        disabled={buttonState.disabled}
        onClick={() => {
          startTransition(async () => {
            try {
              const result = await analyzeCase(caseId);
              setStatus(result.ok ? "ready" : result.status);
            } catch {
              setStatus("unavailable");
            }
          });
        }}
      >
        {isPending ? "Gerando análise..." : "Gerar análise para revisão"}
      </Button>
      {buttonState.message && (
        <span className="max-w-xs text-right text-xs text-[var(--danger,#b91c1c)]">
          {buttonState.message}
        </span>
      )}
    </div>
  );
}
