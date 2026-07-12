import { SiteReveal } from "./SiteReveal";

const SIGNALS = [
  {
    title: "Anti-alucinação",
    body: "Fato sem prova vira [FATO ALEGADO]. Sem inventar artigo.",
  },
  {
    title: "Vs. folha de pagamento",
    body: "Gold a R$ 697. Um analista custa cerca de R$ 4.200.",
  },
  {
    title: "Revisão humana",
    body: "Nada sai como verdade automática. O advogado decide.",
  },
  {
    title: "Wizard, não chat",
    body: "Fluxo de caso guiado. Junior não precisa saber prompt.",
  },
];

/**
 * Faixa de confiança pós-hero: sinais concretos, sem logos inventados.
 */
export function TrustStrip() {
  return (
    <section
      className="border-b border-[var(--border)] bg-[var(--surface)]"
      aria-label="Sinais de confiança"
    >
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <SiteReveal>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {SIGNALS.map((item) => (
              <li
                key={item.title}
                className="min-w-0 border-l-2 border-[var(--primary)] pl-4"
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {item.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)] sm:text-sm">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </SiteReveal>
      </div>
    </section>
  );
}
