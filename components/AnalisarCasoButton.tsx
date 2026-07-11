"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { analyzeCase } from "@/app/actions/analyze";
import type { LlmFailureStatus, LlmRuntimeStatus } from "@/lib/llm";

export const AI_STATUS_MESSAGES: Record<LlmFailureStatus, string> = {
  missing_config:
    "A IA ainda não foi configurada para este escritório. Peça a um administrador para configurar o provider em Escritórios → Avançado → Integração de IA.",
  invalid_credentials:
    "A credencial de acesso à IA expirou ou foi revogada. Peça a um administrador para atualizá-la.",
  unsupported_model:
    "O modelo de IA configurado para este escritório não é suportado ou não está disponível nesta região. Peça a um administrador para revisar em Escritórios → Avançado → Integração de IA.",
  quota_exceeded:
    "O limite de uso da IA foi atingido. Tente novamente mais tarde ou peça a um administrador para verificar o plano.",
  unavailable:
    "A análise por IA está temporariamente indisponível. Tente novamente em alguns minutos.",
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
  layout = "inline",
}: {
  caseId: string;
  initialStatus: LlmRuntimeStatus;
  /** stack = botão full-width na lateral do dossiê */
  layout?: "inline" | "stack";
}) {
  const [status, setStatus] = useState<LlmRuntimeStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();
  const buttonState = getAnalysisButtonState(status, isPending);
  const isStack = layout === "stack";

  return (
    <div
      className={
        isStack
          ? "flex w-full flex-col items-stretch gap-1.5"
          : "flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end"
      }
    >
      <Button
        size="md"
        disabled={buttonState.disabled}
        className={
          isStack
            ? "w-full whitespace-nowrap"
            : "w-full whitespace-nowrap sm:w-auto"
        }
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
        {isPending ? "Analisando..." : "Gerar análise"}
      </Button>
      {buttonState.message && (
        <span
          className={
            isStack
              ? "text-left text-xs leading-snug text-[var(--danger,#b91c1c)]"
              : "max-w-xs text-right text-xs text-[var(--danger,#b91c1c)]"
          }
        >
          {buttonState.message}
        </span>
      )}
    </div>
  );
}
