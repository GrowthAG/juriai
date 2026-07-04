"use client";

import { useEffect, useState } from "react";
import { TiltCard } from "./TiltCard";

// Ciclo da fila operacional: cada etapa destaca um item da fila.
const CYCLE = ["Publicação", "Documento", "Prazo", "Revisão", "Ação"];

// Métricas ilustrativas do mock (não são dados reais de nenhuma workspace).
const METRICS = [
  { label: "Casos ativos", value: "12" },
  { label: "Publicações", value: "4" },
  { label: "Prazos", value: "7" },
  { label: "Tarefas abertas", value: "3" },
];

// Fila operacional: eventos + status do fluxo guiado. Cada item liga-se a um
// passo do ciclo (step) para o destaque já existente.
const QUEUE = [
  { n: "01", label: "Publicação recebida", status: "Aguardando vínculo", step: "Publicação" },
  { n: "02", label: "Documento vinculado", status: "Em revisão", step: "Documento" },
  { n: "03", label: "Prazo identificado", status: "Prazo a definir", step: "Prazo" },
  { n: "04", label: "Revisão humana pendente", status: "Aguardando aprovação", step: "Revisão" },
  { n: "05", label: "Próxima ação sugerida", status: "Tarefa criada", step: "Ação" },
];

// Casos ativos (amostra ilustrativa do total). Sem nomes/partes reais.
const CASES: { title: string; status: string; tone: string }[] = [
  { title: "Cobrança contratual", status: "Em revisão", tone: "warning" },
  { title: "Execução de título", status: "Aguardando aprovação", tone: "primary" },
  { title: "Reclamação trabalhista", status: "Prazo a definir", tone: "muted" },
  { title: "Revisão de contrato SaaS", status: "Aguardando vínculo", tone: "muted" },
  { title: "Notificação extrajudicial", status: "Tarefa criada", tone: "success" },
];

// Documentos vinculados aos casos (rótulos genéricos, sem conteúdo real).
const DOCUMENTS: { label: string; meta: string }[] = [
  { label: "Contrato assinado", meta: "vinculado" },
  { label: "E-mail de cobrança", meta: "recebido" },
  { label: "Print de conversa", meta: "em análise" },
  { label: "Comprovante de pagamento", meta: "vinculado" },
  { label: "Notificação enviada", meta: "enviada" },
];

const TRAIL = [
  "Publicação recebida",
  "Documento vinculado",
  "Prazo identificado",
  "Revisão humana pendente",
  "Próxima ação sugerida",
];

export function HeroProductPreview({ embedded = false }: { embedded?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (media?.matches) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % CYCLE.length);
    }, 1900);
    return () => clearInterval(id);
  }, []);

  const activeStep = CYCLE[activeIndex];
  const reviewing = activeStep === "Revisão";

  const body = (
    <>
      {/* Métricas operacionais */}
      <div className="grid grid-cols-2 border-b border-[var(--border)] lg:grid-cols-4">
        {METRICS.map((m, i) => (
          <div
            key={m.label}
            className={`border-b border-r border-[var(--border)] px-4 py-2.5 lg:border-b-0 ${
              i % 2 === 1 ? "border-r-0 lg:border-r" : ""
            } lg:last:border-r-0`}
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
              {m.label}
            </p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-[var(--foreground)]">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Fila operacional (esquerda) + Casos ativos (direita) */}
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,1fr)]">
        {/* Coluna esquerda — Fila operacional */}
        <div className="border-b border-[var(--border)] p-3.5 sm:p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Fila operacional</h3>
            <span className="font-mono text-[10px] text-[var(--muted)]">
              {activeIndex + 1}/{CYCLE.length}
            </span>
          </div>

          <ol className="mt-3 grid gap-2">
            {QUEUE.map((item, i) => {
              const isActive = item.step === activeStep;
              return (
                <li
                  key={item.n}
                  data-active={isActive}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className={`site-reveal flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                    isActive
                      ? "border-[var(--primary)] bg-[var(--surface)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`site-status-dot ${isActive ? "site-status-pulse" : ""}`}
                      data-active={isActive}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-[var(--foreground)]">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    {item.status}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Coluna direita — Casos ativos */}
        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Casos ativos</h3>
            <span className="font-mono text-[10px] text-[var(--muted)]">12 no total</span>
          </div>

          <ul className="mt-3 grid gap-2">
            {CASES.map((c) => (
              <li
                key={c.title}
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
              >
                <span className="text-xs font-medium text-[var(--foreground)]">
                  {c.title}
                </span>
                <Badge tone={c.tone}>{c.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Documentos vinculados aos casos */}
      <div className="border-t border-[var(--border)] p-3.5 sm:p-4">
        <h3 className="text-sm font-semibold">Documentos recentes</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {DOCUMENTS.map((doc) => (
            <div
              key={doc.label}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
            >
              <p className="text-xs font-medium text-[var(--foreground)]">
                {doc.label}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {doc.meta}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trilha do caso — marcos operacionais (sem hash/audit_id) */}
      <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-2.5 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
          Trilha do caso
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {TRAIL.map((milestone, i) => (
            <span key={milestone} className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span
                className="site-status-dot"
                data-active={i <= activeIndex}
                aria-hidden="true"
              />
              {milestone}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  // Modo embutido: sem card/header externo — o Product Shell fornece a moldura
  // e a command bar. Evita duplicar cabeçalho e integra ao sistema.
  if (embedded) {
    return <div className="site-reveal">{body}</div>;
  }

  return (
    <TiltCard className="w-full">
      <section
        className="site-reveal overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--surface)]"
        aria-label="Demonstração visual do workspace do JuriAI"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-2.5 sm:px-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
              JuriAI Workspace
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-[var(--foreground)] sm:text-base">
              Escritório Modelo — Operação jurídica
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded border border-[var(--border)] bg-[var(--background)] px-2.5 py-1">
            <span className="site-status-dot" data-active="true" aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              {reviewing ? "Revisão humana pendente" : "Em operação"}
            </span>
          </div>
        </div>
        {body}
      </section>
    </TiltCard>
  );
}

function Badge({ children, tone }: { children: string; tone: string }) {
  const toneClass =
    tone === "success"
      ? "border-[var(--success)] text-[var(--success)]"
      : tone === "warning"
        ? "border-[var(--warning)] text-[var(--warning)]"
        : tone === "primary"
          ? "border-[var(--primary)] text-[var(--primary)]"
          : "border-[var(--border-strong)] text-[var(--muted)]";

  return (
    <span
      className={`inline-flex shrink-0 rounded border bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${toneClass}`}
    >
      {children}
    </span>
  );
}
