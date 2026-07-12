import { SiteReveal } from "./SiteReveal";

const TIERS = [
  {
    name: "Silver",
    price: "497",
    blurb: "Escritório pequeno validando sozinho.",
    features: [
      "1 a 3 advogados",
      "Wizard + análise anti-alucinação",
      "Limite de análises/mês",
      "Suporte por e-mail",
    ],
    highlighted: false,
  },
  {
    name: "Gold",
    price: "697",
    blurb: "O plano default do escritório cível B2B.",
    features: [
      "Mais volume de análises",
      "Mais usuários no workspace",
      "Exportação de peças",
      "Prioridade de suporte",
      "Onboarding assistido no beta",
    ],
    highlighted: true,
  },
  {
    name: "Platinum",
    price: "1.997",
    blurb: "Alto volume, marca do escritório, prioridade.",
    features: [
      "Alto volume de análises",
      "White-label (cor + logo)",
      "Onboarding prioritário",
      "Caminho para operação maior",
    ],
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section
      id="precos"
      className="scroll-mt-16 border-b border-[var(--border)] bg-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SiteReveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Preço
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Um estagiário custa R$&nbsp;1.200. Um analista, R$&nbsp;4.200.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
              O JuriAI Gold custa R$&nbsp;697, trabalha 24/7 e não inventa
              jurisprudência. Por escritório, não por assento na v1.
            </p>
          </div>
        </SiteReveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <SiteReveal key={tier.name} delayMs={i * 60}>
              <div
                className={[
                  "flex h-full flex-col rounded-sm border px-6 py-7",
                  tier.highlighted
                    ? "border-[var(--primary)] bg-[var(--background)]"
                    : "border-[var(--border)] bg-[var(--surface)]",
                ].join(" ")}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--foreground)]">
                    {tier.name}
                  </h3>
                  {tier.highlighted ? (
                    <span className="rounded bg-[var(--primary)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Default
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 font-serif text-4xl font-semibold tracking-tight tabular-nums">
                  R$&nbsp;{tier.price}
                  <span className="ml-1 font-sans text-sm font-medium text-[var(--muted)]">
                    /mês
                  </span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {tier.blurb}
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex gap-2 text-sm leading-snug text-[var(--foreground)]"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                        aria-hidden="true"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:contato@juriai.com.br?subject=Demo%20JuriAI%20-%20plano%20"
                  className={[
                    "mt-8 inline-flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                    tier.highlighted
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
                      : "border border-[var(--border-strong)] bg-white text-[var(--foreground)] hover:bg-[var(--background)]",
                  ].join(" ")}
                >
                  Agendar demo
                </a>
              </div>
            </SiteReveal>
          ))}
        </div>

        <SiteReveal delayMs={120}>
          <div className="mt-10 grid gap-6 rounded-sm border border-[var(--border)] bg-[var(--background)] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Garantia de processo · 30 dias
              </p>
              <p className="mt-3 text-base font-medium leading-relaxed text-[var(--foreground)] sm:text-lg">
                Monte um caso real com mapa de provas e lacunas. Se não for
                mais rápido que o fluxo atual do escritório, devolvemos o mês
                ou estendemos o onboarding sem custo.
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Não garantimos mérito nem ganhar causa. Garantimos processo e
                tempo de montagem.
              </p>
            </div>
            <a
              href="mailto:contato@juriai.com.br?subject=Demo%20JuriAI%20com%20caso%20real"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
            >
              Agendar demo com caso real
            </a>
          </div>
        </SiteReveal>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Anual: 10 meses no preço de 12. Piso R$&nbsp;497 (sem tier de
          “brinquedo” a R$&nbsp;197).
        </p>
      </div>
    </section>
  );
}
