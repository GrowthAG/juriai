"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SiteReveal } from "./SiteReveal";

const STEPS = [
  {
    n: "01",
    title: "Abrir o caso",
    desc: "Wizard guiado: tipo, área, partes e resumo. Contexto no dossiê desde o primeiro minuto. Sem prompt aberto.",
  },
  {
    n: "02",
    title: "Anexar provas",
    desc: "Documentos entram no caso. Extração do que importa e sinal quando o material não bate com o dossiê.",
  },
  {
    n: "03",
    title: "Mapear e analisar",
    desc: "Fatos, timeline e lacunas a partir do material. O que não tem prova vira [FATO ALEGADO], não vira inventado.",
  },
  {
    n: "04",
    title: "Redigir com lastro",
    desc: "Rascunho fundamentado com fontes rastreadas. PDF para revisão. Você assina o que aprova.",
  },
  {
    n: "05",
    title: "Revisar e decidir",
    desc: "Nada sai como verdade automática. O advogado aprova, ajusta e responde pelo resultado.",
  },
];

export function MechanismSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const step = STEPS[active];

  const handleSetActive = (index: number) => {
    setDirection(index > active ? 1 : -1);
    setActive(index);
  };

  return (
    <section
      id="como-funciona"
      className="scroll-mt-16 border-b border-[var(--border)]"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SiteReveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Como funciona
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Do dossiê ao rascunho, com o que está nos autos.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
              Triagem, análise, estratégia, redação e conclusão. A forma como o
              senior pensa, forçada pelo sistema. A IA organiza. Você decide.
            </p>
          </div>
        </SiteReveal>

        <SiteReveal delayMs={70}>
          <div className="mt-14 overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--surface)]">
            <div
              className="flex gap-0 overflow-x-auto border-b border-[var(--border)]"
              role="tablist"
              aria-label="Etapas do fluxo"
            >
              {STEPS.map((s, i) => {
                const selected = i === active;
                return (
                  <button
                    key={s.n}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => handleSetActive(i)}
                    className={[
                      "relative min-w-[7.5rem] flex-1 px-3 py-4 text-left transition-colors sm:min-w-0 sm:px-4",
                      selected
                        ? "bg-[var(--background)]"
                        : "hover:bg-[var(--background)]/60",
                      i < STEPS.length - 1
                        ? "border-r border-[var(--border)]"
                        : "",
                    ].join(" ")}
                  >
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                      {s.n}
                    </span>
                    <span
                      className={[
                        "mt-1 block text-xs font-semibold sm:text-sm",
                        selected
                          ? "text-[var(--foreground)]"
                          : "text-[var(--muted)]",
                      ].join(" ")}
                    >
                      {s.title}
                    </span>
                    {selected && (
                      <span
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--primary)]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.n}
                className="site-step-panel grid gap-6 px-5 py-7 sm:grid-cols-[minmax(0,8rem)_1fr] sm:px-8 sm:py-9"
                role="tabpanel"
                initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div>
                  <p className="font-mono text-3xl font-semibold tabular-nums text-[var(--primary)] sm:text-4xl">
                    {step.n}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Etapa {active + 1} de {STEPS.length}
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold tracking-tight sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                    {step.desc}
                  </p>
                  <div
                    className="mt-6 h-0.5 w-full overflow-hidden rounded-full bg-[var(--border)]"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-400 ease-out"
                      style={{
                        width: `${((active + 1) / STEPS.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </SiteReveal>
      </div>
    </section>
  );
}
