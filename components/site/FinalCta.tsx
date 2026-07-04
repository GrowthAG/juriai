export function FinalCta() {
  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-3xl font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-[2rem]">
          Estruture a operação jurídica antes de automatizar decisões.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Veja o JuriAI aplicado aos seus casos: fluxo guiado, fonte rastreável
          e revisão humana em cada etapa.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="mailto:contato@juriai.com.br"
            className="inline-flex h-[3.25rem] items-center justify-center rounded-lg bg-[var(--primary)] px-8 text-base font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            Solicitar demonstração
          </a>
          <a
            href="#como-funciona"
            className="inline-flex h-[3.25rem] items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-8 text-base font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--background)]"
          >
            Ver como funciona
          </a>
        </div>
      </div>
    </section>
  );
}
