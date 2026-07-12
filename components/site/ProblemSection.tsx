import { SiteReveal } from "./SiteReveal";

const PAINS = [
  {
    title: "Releitura eterna",
    body: "Contrato, e-mail, NF e print espalhados. O sócio é o único que sabe o caso. Junior pergunta, senior para e perde a manhã.",
  },
  {
    title: "Word de 2019",
    body: "Modelo antigo, caso novo. Prova fraca vira forte no rascunho porque ninguém classificou. A peça sai bonita e o dossiê continua um caos.",
  },
  {
    title: "IA que inventa",
    body: "ChatGPT e “IA jurídica” de R$ 127 citam o que não existe. Você gasta mais tempo checando do que escrevendo do zero.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SiteReveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              O problema
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Gestão de prazo e chat genérico não montam o caso.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
              O erro é comparar o JuriAI com software barato. O custo real do
              gargalo é o salário do analista mais o risco de peça com fonte
              inventada.
            </p>
          </div>
        </SiteReveal>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
          {PAINS.map((pain, i) => (
            <li key={pain.title} className="bg-white px-6 py-8">
              <SiteReveal delayMs={i * 50}>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  0{i + 1}
                </p>
                <h3 className="mt-4 font-serif text-xl font-semibold tracking-tight">
                  {pain.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {pain.body}
                </p>
              </SiteReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
