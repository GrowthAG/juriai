import Image from "next/image";
import { SiteReveal } from "./SiteReveal";

/**
 * Faixa editorial: ângulo de substituição de mão de obra + foto humana.
 */
export function HumanStrip() {
  return (
    <section className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <SiteReveal>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-[var(--border)] sm:aspect-[16/11]">
              <Image
                src="/site/human-desk-still.jpg"
                alt="Mesa com papéis, caneta e café em luz de manhã."
                fill
                sizes="(min-width: 1024px) 28rem, 100vw"
                className="object-cover"
              />
            </div>
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                O trabalho bracal
              </p>
              <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                O sócio vira gargalo porque só ele “sabe o caso”.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                60 a 70% do tempo some em releitura, pasta e Word. O JuriAI faz
                o bracal de uma equipe júnior 24/7: mapa, provas, lacunas e
                rascunho com trilha. Você volta a pensar estratégia.
              </p>
              <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--foreground)]">
                Não é hype de IA. É custo de mão de obra e risco de citação
                inventada fora da mesa.
              </p>
            </div>
          </div>
        </SiteReveal>
      </div>
    </section>
  );
}
