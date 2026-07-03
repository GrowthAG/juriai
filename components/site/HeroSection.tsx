import Image from "next/image";
import { HeroProductPreview } from "./HeroProductPreview";

const COMMAND_OPTIONS = [
  "Novo caso",
  "Monitorar publicação",
  "Vincular documento",
  "Criar prazo",
  "Atribuir tarefa",
  "Revisar sugestão",
];

const STEPPER = ["Contexto", "Estruturação", "Revisão", "Próxima ação"];

export function HeroSection() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
        {/* Intro centralizada (hero premium, base branca) */}
        <div className="site-reveal mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Legal Operating System
          </p>
          <h1 className="mx-auto mt-4 max-w-[24ch] font-serif text-3xl font-semibold leading-[1.12] text-[var(--foreground)] sm:text-4xl lg:text-5xl">
            Transforme publicações, documentos e prazos soltos em um caso
            pronto para revisão.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            O JuriAI conecta cada entrada ao contexto do caso, organiza os
            próximos passos e mantém o advogado no controle antes de qualquer
            ação.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <a
              href="mailto:contato@juriai.com.br"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
            >
              Solicitar demonstração
            </a>
            <a
              href="#como-funciona"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-6 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--background)]"
            >
              Ver fluxo guiado
            </a>
          </div>
        </div>

        {/* Product Shell vivo: fallback em mobile/tablet (< lg), onde o print
            denso do dashboard não é legível. */}
        <div className="site-reveal mx-auto mt-12 max-w-5xl overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] lg:hidden">
          {/* Titlebar do sistema */}
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
              JuriAI Workspace{" "}
              <span className="text-[var(--foreground)]">· Escritório Modelo</span>
            </p>
            <div className="flex items-center gap-2">
              <span
                className="site-status-dot site-status-pulse"
                data-active="true"
                aria-hidden="true"
              />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Wizard operacional
              </span>
            </div>
          </div>

          {/* Command bar: toolbar de operação integrada ao produto */}
          <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Iniciar operação guiada
              </p>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {STEPPER.map((step, i) => (
                  <span key={step} className="flex items-center gap-1.5">
                    <span
                      className={
                        i === 0
                          ? "font-semibold text-[var(--primary)]"
                          : undefined
                      }
                    >
                      {step}
                    </span>
                    {i < STEPPER.length - 1 && (
                      <span aria-hidden="true" className="text-[var(--border-strong)]">
                        →
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Progresso do wizard: microanimação discreta (largura oscila) */}
            <div
              className="mt-2.5 h-0.5 w-full overflow-hidden rounded-full bg-[var(--border)]"
              aria-hidden="true"
            >
              <div className="site-progress h-full rounded-full bg-[var(--primary)]" />
            </div>

            <div className="mt-2.5 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5">
              <p className="text-sm text-[var(--muted)]">
                Selecione uma operação ou cole um conteúdo para estruturar o dossiê...
              </p>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {COMMAND_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--background)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  {option}
                </button>
              ))}
            </div>

            <p className="mt-2.5 text-[11px] text-[var(--muted)]">
              Demonstração visual. Nenhuma saída avança sem revisão humana.
            </p>
          </div>

          {/* Cockpit (dossiê + análise + trilha), embutido no shell */}
          <HeroProductPreview embedded />
        </div>

        {/* Desktop (lg+): print do produto real. Referencia só o PNG estático
            em /public — sem iframe, sem fetch, sem importar a rota /demo. */}
        <div className="site-reveal mx-auto mt-12 hidden aspect-[1922/994] max-w-5xl overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] lg:block">
          <Image
            src="/site/demo-dashboard.png"
            alt="Painel operacional do JuriAI: dossiê do caso, vínculos, fila de tarefas e próximos passos."
            width={1922}
            height={994}
            priority
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
