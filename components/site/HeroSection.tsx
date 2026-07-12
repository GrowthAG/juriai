import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="grid lg:min-h-[min(90vh,54rem)] lg:grid-cols-2">
        <div className="flex flex-col justify-center bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          <div className="site-reveal max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Dossiê inteligente · cível B2B
            </p>
            <h1 className="mt-5 font-serif text-[2rem] font-semibold leading-[1.1] tracking-tight text-[var(--foreground)] sm:text-[2.55rem] lg:text-[2.85rem]">
              Economize até 95% do que você paga em estagiário e analista.
            </h1>
            <p className="mt-5 text-[1.05rem] leading-relaxed text-[var(--muted)] sm:text-lg">
              Um agente monta o mapa do caso, classifica provas e gera rascunho
              com fonte rastreada. Nunca inventa jurisprudência. Você revisa e
              aprova.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--foreground)]">
                Gold R$&nbsp;697/mês
              </span>
              <span className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--muted)]">
                vs analista ~R$&nbsp;4.200
              </span>
              <span className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--muted)]">
                [FATO ALEGADO]
              </span>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="mailto:contato@juriai.com.br?subject=Demo%20JuriAI%20com%20caso%20real"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--primary)] px-7 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
              >
                Agendar demo com caso real
              </a>
              <a
                href="#precos"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white px-7 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--background)]"
              >
                Ver planos
              </a>
            </div>
            <p className="mt-6 max-w-md text-xs leading-relaxed text-[var(--muted)]">
              Se em 30 dias o mapa de um caso real não sair mais rápido que o
              seu processo atual, devolvemos o mês ou estendemos o onboarding.
              Não garantimos ganhar causa. Garantimos processo e tempo de
              montagem.
            </p>
          </div>
        </div>

        <div className="relative min-h-[18rem] sm:min-h-[22rem] lg:min-h-full">
          <Image
            src="/site/hero-human-desk.jpg"
            alt="Mesa de trabalho com documentos em luz natural, ambiente de escritório."
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-black/[0.06]"
            aria-hidden="true"
          />
          <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-xs">
            <div className="rounded-sm border border-white/20 bg-white/95 px-4 py-3 backdrop-blur-sm">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                Âncora de valor
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-snug text-[var(--foreground)]">
                Não compete com software de R$&nbsp;127. Compete com a folha.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
