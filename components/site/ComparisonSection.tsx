import { SiteReveal } from "./SiteReveal";

type Row = { dimension: string; chatbot: string; juriai: string };

const ROWS: Row[] = [
  {
    dimension: "Entrada",
    chatbot: "Prompt aberto",
    juriai: "Caso + provas no dossiê",
  },
  {
    dimension: "Rastreabilidade",
    chatbot: "Nenhuma",
    juriai: "Fonte, lacuna e revisão",
  },
  {
    dimension: "Alucinação",
    chatbot: "Cita o que não existe",
    juriai: "[FATO ALEGADO] + gaps abertos",
  },
  {
    dimension: "Revisão humana",
    chatbot: "Opcional",
    juriai: "Caminho crítico do produto",
  },
  {
    dimension: "Âncora de preço",
    chatbot: "Mensalidade de software",
    juriai: "Folha de analista (~R$ 4.200)",
  },
  {
    dimension: "Peça",
    chatbot: "Texto genérico",
    juriai: "Rascunho no dossiê + PDF",
  },
];

export function ComparisonSection() {
  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SiteReveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Diferença
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Chat genérico não é operação de caso.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
              O mesmo modelo de linguagem, sem dossiê e sem revisão, não basta
              para trabalho que o advogado assina.
            </p>
          </div>
        </SiteReveal>

        <SiteReveal delayMs={60}>
          <div className="mt-12 overflow-x-auto rounded-sm border border-[var(--border)]">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                  <th className="px-5 py-3.5 font-medium text-[var(--muted)] sm:px-6">
                    Dimensão
                  </th>
                  <th className="px-5 py-3.5 font-medium text-[var(--muted)] sm:px-6">
                    Chat / IA barata
                  </th>
                  <th className="px-5 py-3.5 font-medium text-[var(--foreground)] sm:px-6">
                    JuriAI
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.dimension}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-5 py-3.5 font-medium sm:px-6">
                      {row.dimension}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--muted)] sm:px-6">
                      {row.chatbot}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[var(--foreground)] sm:px-6">
                      {row.juriai}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SiteReveal>
      </div>
    </section>
  );
}
