"use client";

import { deleteCase } from "@/app/actions/cases";

/* Botão de exclusão com confirmação. Texto compacto para caber em linha de
   tabela e em cabeçalho de detalhe, sem sombra/raio, em conformidade com o
   gate anti-vibecode. */
export function DeleteCaseButton({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <form
      action={deleteCase.bind(null, id)}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Excluir este caso? Provas, rascunhos, conversa, linha do tempo, lacunas, ingestões, processos vinculados e auditoria relacionados também serão removidos. Esta ação não pode ser desfeita.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className={[
          "text-sm text-[var(--muted)] transition-colors hover:text-[var(--danger,#b91c1c)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Excluir
      </button>
    </form>
  );
}
