import { SiteReveal } from "./SiteReveal";

const PAINS = [
  {
    title: "O gargalo da releitura eterna",
    body: "Contratos, notificações, e-mails e faturas espalhados. O sócio perde a manhã explicando o contexto do cliente enquanto a equipe júnior trava na triagem dos fatos.",
  },
  {
    title: "A armadilha dos modelos antigos",
    body: "Copiar peças antigas sem auditar se as provas materiais do caso atual sustentam os pedidos em juízo. A petição sai com formato bonito, mas sem lastro probatório.",
  },
  {
    title: "O perigo das IAs genéricas de R$ 127",
    body: "ChatGPT e ferramentas amadoras inventam números de processos e decisões revogadas. Você gasta mais tempo checando fontes inexistentes do que redigindo do zero.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SiteReveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              O problema real
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Software de prazos e chat de IA genérico não montam o caso.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
              O custo real do gargalo é a folha salarial de equipe júnior somada ao risco ético e financeiro de assinar peças com fundamentação vulnerável.
            </p>
          </div>
        </SiteReveal>

        <ul className="mt-12 grid gap-4 overflow-hidden rounded-[var(--radius)] sm:grid-cols-3">
          {PAINS.map((pain, i) => (
            <li key={pain.title} className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-7 shadow-sm hover:shadow-md transition-shadow">
              <SiteReveal delayMs={i * 50}>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--primary)] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-serif text-xl font-semibold tracking-tight text-[var(--foreground)]">
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

