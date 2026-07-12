"use client";

import { useState } from "react";
import { ProductMockup } from "./ProductMockup";
import { SiteReveal } from "./SiteReveal";

const SHOTS = [
  {
    id: "wizard",
    label: "Abrir caso",
    caption: "Wizard guiado. Sem prompt solto.",
    variant: "wizard-clean" as const,
    src: undefined,
    alt: "Fluxo guiado de novo caso no JuriAI.",
    title: "app.juriai · novo caso",
  },
  {
    id: "operacao",
    label: "Operação",
    caption: "Tarefas e prazos no workspace.",
    variant: "image" as const,
    src: "/site/demo-dashboard.png",
    alt: "Visão operacional do workspace JuriAI.",
    title: "app.juriai · operação",
  },
  {
    id: "workspace",
    label: "Workspace",
    caption: "Escritório e membros no mesmo lugar.",
    variant: "image" as const,
    src: "/site/juriai-dashboard-real.png",
    alt: "Painel do escritório no JuriAI.",
    title: "app.juriai · workspace",
  },
];

export function ProductShowcaseSection() {
  const [active, setActive] = useState(0);
  const shot = SHOTS[active];

  return (
    <section
      id="produto-em-acao"
      className="scroll-mt-16 border-b border-[var(--border)] bg-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SiteReveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Produto
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Fluxo de caso. Não caixa de chat.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
              Do wizard ao workspace: o dossiê vive no sistema. A demo mostra o
              contraste com IA genérica no mesmo material.
            </p>
          </div>
        </SiteReveal>

        <SiteReveal delayMs={60}>
          <div className="mt-10 flex gap-2 overflow-x-auto pb-1" role="tablist">
            {SHOTS.map((item, i) => {
              const selected = i === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(i)}
                  className={[
                    "min-w-[10.5rem] shrink-0 rounded-sm border px-4 py-3 text-left text-sm transition-colors",
                    selected
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--surface)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]",
                  ].join(" ")}
                >
                  <span className="block font-semibold">{item.label}</span>
                  <span
                    className={[
                      "mt-1 block text-xs leading-snug",
                      selected ? "text-white/70" : "text-[var(--muted)]",
                    ].join(" ")}
                  >
                    {item.caption}
                  </span>
                </button>
              );
            })}
          </div>
        </SiteReveal>

        <SiteReveal delayMs={90}>
          <div className="mt-8 rounded-sm border border-[var(--border)] bg-[var(--background)] px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
            <div key={shot.id} className="site-product-stage mx-auto max-w-3xl">
              <ProductMockup
                variant={shot.variant}
                src={shot.src}
                alt={shot.alt}
                title={shot.title}
                sizes="(min-width: 1024px) 48rem, 100vw"
                aspectClassName={
                  shot.variant === "wizard-clean"
                    ? "min-h-[24rem] sm:min-h-[28rem] aspect-auto"
                    : "aspect-[16/9] sm:aspect-[16/10]"
                }
                priority={active === 0}
              />
            </div>
            <p className="mt-5 text-center text-xs text-[var(--muted)]">
              Interface de produto. Sem dados de cliente real na página.
            </p>
          </div>
        </SiteReveal>
      </div>
    </section>
  );
}
