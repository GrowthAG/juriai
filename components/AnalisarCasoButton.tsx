"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { analyzeCase } from "@/app/actions/analyze";

// Nunca deixamos detalhe de provider/infra (Vertex, Claude, chave, modelo,
// região) vazar para a UI, mesmo que a action escape com mensagem técnica.
const SAFE_ANALYSIS_ERROR =
  "Análise indisponível neste workspace. Verifique a configuração de IA ou tente novamente mais tarde.";
const TECHNICAL_ERROR_TERMS =
  /vertex|claude|anthropic|api[_ ]?key|modelo|região|regiao|region|provider|serviceable/i;

function safeErrorMessage(e: unknown): string {
  const raw = e instanceof Error ? e.message : "";
  if (!raw || TECHNICAL_ERROR_TERMS.test(raw)) return SAFE_ANALYSIS_ERROR;
  return raw;
}

export function AnalisarCasoButton({
  caseId,
  configured,
}: {
  caseId: string;
  configured: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!configured) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Button size="md" disabled>
          Gerar análise para revisão
        </Button>
        <span className="max-w-xs text-right text-xs text-[var(--muted)]">
          Análise indisponível neste workspace. Verifique a configuração de IA
          ou tente novamente mais tarde.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="md"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await analyzeCase(caseId);
            } catch (e) {
              setError(safeErrorMessage(e));
            }
          });
        }}
      >
        {isPending ? "Gerando análise..." : "Gerar análise para revisão"}
      </Button>
      {error && (
        <span className="max-w-xs text-right text-xs text-[var(--danger,#b91c1c)]">
          {error}
        </span>
      )}
    </div>
  );
}
