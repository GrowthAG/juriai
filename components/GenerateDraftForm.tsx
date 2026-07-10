"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CaseType, DraftType } from "@prisma/client";
import { generateCaseDraft } from "@/app/actions/drafts";
import { AI_STATUS_MESSAGES } from "@/components/AnalisarCasoButton";
import { Button } from "@/components/ui";
import type { LlmRuntimeStatus } from "@/lib/llm";
import type { FormEvent } from "react";

const DRAFT_TYPE_LABELS: Record<DraftType, string> = {
  NOTIFICACAO_EXTRAJUDICIAL: "Notificação extrajudicial",
  RESPOSTA_EXTRAJUDICIAL: "Resposta extrajudicial",
  PETICAO_INICIAL: "Petição inicial",
  CONTESTACAO: "Contestação",
  RECONVENCAO: "Reconvenção",
  ACORDO: "Acordo",
  PARECER: "Parecer",
  OUTRO: "Outro",
};

const DRAFT_TYPE_OPTIONS: DraftType[] = [
  "NOTIFICACAO_EXTRAJUDICIAL",
  "RESPOSTA_EXTRAJUDICIAL",
  "PETICAO_INICIAL",
  "CONTESTACAO",
  "RECONVENCAO",
  "ACORDO",
  "PARECER",
  "OUTRO",
];

function defaultDraftTypeForCase(caseType: CaseType): DraftType {
  switch (caseType) {
    case "EXTRAJUDICIAL":
      return "RESPOSTA_EXTRAJUDICIAL";
    case "JUDICIAL_ATIVO":
      return "PETICAO_INICIAL";
    case "JUDICIAL_PASSIVO":
      return "CONTESTACAO";
    case "CONSULTIVO":
    default:
      return "PARECER";
  }
}

export function GenerateDraftForm({
  caseId,
  caseType,
  initialStatus,
}: {
  caseId: string;
  caseType: CaseType;
  initialStatus: LlmRuntimeStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LlmRuntimeStatus>(initialStatus);
  const [selectedType, setSelectedType] = useState<DraftType>(
    defaultDraftTypeForCase(caseType),
  );
  const [instructions, setInstructions] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const buttonDisabled = status !== "ready" || isPending;
  const statusMessage =
    status === "ready" ? null : AI_STATUS_MESSAGES[status];

  const hint = useMemo(() => {
    switch (selectedType) {
      case "NOTIFICACAO_EXTRAJUDICIAL":
        return "Útil para notificar a contraparte com base no contexto já reunido.";
      case "RESPOSTA_EXTRAJUDICIAL":
        return "Bom para responder notificação recebida ou consolidar uma posição.";
      case "PETICAO_INICIAL":
        return "Use quando o caso já pede uma peça de ajuizamento.";
      case "CONTESTACAO":
        return "Use para defesa em ação já proposta.";
      case "RECONVENCAO":
        return "Use quando a defesa também trouxer pedido próprio.";
      case "ACORDO":
        return "Use para consolidar proposta ou minuta de acordo.";
      case "PARECER":
        return "Use quando o objetivo for análise técnica em vez de petição.";
      case "OUTRO":
      default:
        return "Use para rascunhos que não caem em uma categoria específica.";
    }
  }, [selectedType]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      setMessage(null);
      try {
        const result = await generateCaseDraft(caseId, formData);
        if (result.ok) {
          setMessage("Rascunho salvo para revisão do advogado.");
          router.refresh();
          return;
        }

        if (result.status === "insufficient_context") {
          setMessage(result.message);
          return;
        }

        setStatus(result.status);
        setMessage(
          result.message ?? AI_STATUS_MESSAGES[result.status],
        );
      } catch {
        setStatus("unavailable");
        setMessage(
          "Não foi possível gerar o rascunho agora. Tente novamente em instantes.",
        );
      }
    });
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,260px)_1fr]">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            Tipo de peça
          </span>
          <select
            name="type"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as DraftType)}
            className="h-11 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--primary)]"
          >
            {DRAFT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {DRAFT_TYPE_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            Instruções para a minuta
          </span>
          <textarea
            name="instructions"
            rows={4}
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Ex: foque nos fatos comprovados, destaque lacunas e mantenha tom objetivo."
            className="w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </label>
      </div>

      <p className="text-xs text-[var(--muted)]">{hint}</p>

      <div className="flex items-center justify-between gap-3">
        <div className="min-h-[1.25rem] text-xs text-[var(--muted)]">
          {message ? (
            <span className={status === "ready" ? "text-[var(--foreground)]" : "text-[var(--danger,#b91c1c)]"}>
              {message}
            </span>
          ) : statusMessage ? (
            <span className="text-[var(--danger,#b91c1c)]">{statusMessage}</span>
          ) : (
            <span>O rascunho será salvo no caso e ficará disponível para revisão.</span>
          )}
        </div>

        <Button type="submit" size="md" disabled={buttonDisabled}>
          {isPending ? "Gerando rascunho..." : "Gerar peça ou documento"}
        </Button>
      </div>
    </form>
  );
}
