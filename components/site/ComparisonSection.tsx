type Row = { dimension: string; chatbot: string; juriai: string };

const ROWS: Row[] = [
  {
    dimension: "Entrada de trabalho",
    chatbot: "Prompt aberto",
    juriai: "Fluxo guiado por etapa",
  },
  {
    dimension: "Rastreabilidade",
    chatbot: "Nenhuma",
    juriai: "Fonte, trecho e confiança",
  },
  {
    dimension: "Revisão humana",
    chatbot: "Opcional",
    juriai: "Obrigatória antes de gerar",
  },
  {
    dimension: "Fluxo jurídico",
    chatbot: "Inexistente",
    juriai: "Casos, prazos, provas e lacunas",
  },
  {
    dimension: "Organização por caso",
    chatbot: "Conversas soltas",
    juriai: "Tudo indexado ao caso",
  },
  {
    dimension: "Auditoria",
    chatbot: "Sem registro",
    juriai: "Trilha com origem e responsável",
  },
  {
    dimension: "Controle da resposta",
    chatbot: "Sem fluxo de validação",
    juriai: "Contido por fonte e revisão",
  },
  {
    dimension: "Próxima ação",
    chatbot: "A cargo do usuário",
    juriai: "Sugerida e rastreada",
  },
];

export function ComparisonSection() {
  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Comparação
          </p>
          <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Chatbot jurídico genérico não é um sistema operacional.
          </h2>
        </div>

        <div className="mt-12 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="w-[28%] px-6 py-4 font-medium text-[var(--muted)]">
                  &nbsp;
                </th>
                <th className="px-6 py-4 font-semibold text-[var(--muted)]">
                  Chatbot jurídico genérico
                </th>
                <th className="border-b-2 border-l border-[var(--primary)] border-l-[var(--border)] px-6 py-4 font-semibold text-[var(--foreground)]">
                  JuriAI · Legal Operating System
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.dimension}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 text-left align-top font-medium text-[var(--foreground)]"
                  >
                    {row.dimension}
                  </th>
                  <td className="px-6 py-4 align-top text-[var(--muted)]">
                    {row.chatbot}
                  </td>
                  <td className="border-l border-[var(--border)] px-6 py-4 align-top font-medium text-[var(--foreground)]">
                    {row.juriai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
