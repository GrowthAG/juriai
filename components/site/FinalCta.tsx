import Image from "next/image";
import { SiteReveal } from "./SiteReveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="absolute inset-0">
        <Image
          src="/site/human-office-meeting.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-white/90 backdrop-blur-[2px]"
          aria-hidden="true"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <SiteReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Beta assistido · vagas de onboarding limitadas
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-[2.15rem]">
              Pare de pagar salário cheio por trabalho bracal que uma máquina
              pode fazer sem inventar fonte.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[var(--muted)]">
              Leve um caso real para a demo. Em uma sessão você vê mapa, lacunas
              e o contraste anti-alucinação. Se em 30 dias a montagem não for
              mais rápida, devolvemos o mês.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:contato@juriai.com.br?subject=Demo%20JuriAI%20com%20caso%20real"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--primary)] px-8 text-base font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
              >
                Agendar demo com caso real
              </a>
              <a
                href="#precos"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white px-8 text-base font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--background)]"
              >
                Ver planos
              </a>
            </div>
            <p className="mx-auto mt-8 max-w-md text-sm font-medium leading-relaxed text-[var(--foreground)]">
              A única coisa que com certeza não resolve a releitura eterna é
              fechar esta página e abrir o Word de novo.
            </p>
          </div>
        </SiteReveal>
      </div>
    </section>
  );
}
