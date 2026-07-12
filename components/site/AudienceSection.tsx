import { SiteReveal } from "./SiteReveal";

const AUDIENCE = [
  "Escritório cível B2B, 2 a 30 advogados, 20+ casos densos ao mesmo tempo",
  "Sócio ou senior que é o único que “sabe o caso” e vira gargalo de tudo",
  "Já tentou ChatGPT ou IA jurídica barata e se queimou com citação inventada",
  "Usa gestão de prazos, mas monta peça ainda no Word com modelo antigo",
];

const ANTI = [
  "Solo sem volume de casos",
  "Quem quer IA que assina a peça sozinha",
  "Só agenda de prazo, sem dor de dossiê",
];

export function AudienceSection() {
  return (
    <section
      id="para-quem"
      className="scroll-mt-16 border-b border-[var(--border)]"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <SiteReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Para quem
              </p>
              <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                Feito para quem responde pelo caso. Não para brincar com prompt.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
                Se você só compra com 40 logos na home, feche a aba. Se tem
                carteira cível documental e odeia releitura e IA mentirosa, a
                demo é o filtro.
              </p>
            </SiteReveal>
            <ul className="mt-8 grid gap-3">
              {AUDIENCE.map((item, i) => (
                <li key={item}>
                  <SiteReveal delayMs={i * 50}>
                    <div className="flex gap-3 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm leading-relaxed text-[var(--foreground)]">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                      />
                      <span>{item}</span>
                    </div>
                  </SiteReveal>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SiteReveal delayMs={40}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Não é para
              </p>
              <h3 className="mt-4 font-serif text-xl font-semibold tracking-tight sm:text-2xl">
                Anti-ICP (economia o tempo dos dois lados)
              </h3>
            </SiteReveal>
            <ul className="mt-8 grid gap-3">
              {ANTI.map((item, i) => (
                <li key={item}>
                  <SiteReveal delayMs={80 + i * 50}>
                    <div className="flex gap-3 rounded-sm border border-[var(--border)] bg-[var(--background)] px-5 py-4 text-sm leading-relaxed text-[var(--muted)]">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-[var(--muted)]"
                      />
                      <span>{item}</span>
                    </div>
                  </SiteReveal>
                </li>
              ))}
            </ul>
            <SiteReveal delayMs={200}>
              <p className="mt-8 text-sm leading-relaxed text-[var(--muted)]">
                Foco da v1: cível empresarial (contratos, SaaS, serviços,
                cobrança, RC). Criminal ou trabalhista puro ficam para o
                roadmap.
              </p>
            </SiteReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
