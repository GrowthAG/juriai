"use client";

import { useState } from "react";

type Stage = {
  n: string;
  title: string;
  desc: string;
  entrada: string;
  estrutura: string;
  revisao: string;
  proxima: string;
};

// Trilha operacional principal da Home. Quatro estágios, interatividade
// discreta (state-driven, sem loop). Sem promessa técnica nem termo interno.
const STAGES: Stage[] = [
  {
    n: "01",
    title: "Contexto recebido",
    desc: "Publicação, documento ou resumo do caso entram e são ligados ao contexto do caso.",
    entrada: "Publicação, documento ou resumo",
    estrutura: "Vínculo ao contexto do caso",
    revisao: "Advogado confirma o vínculo",
    proxima: "Seguir para a estruturação",
  },
  {
    n: "02",
    title: "Estruturação",
    desc: "A IA organiza a narrativa, monta a linha do tempo e aponta as lacunas do caso.",
    entrada: "Texto das peças e do resumo",
    estrutura: "Linha do tempo e lacunas",
    revisao: "Advogado ajusta a estrutura",
    proxima: "Enviar para revisão humana",
  },
  {
    n: "03",
    title: "Revisão humana",
    desc: "Cada sugestão traz fonte original e trecho citado. Nada avança sem aprovação do advogado.",
    entrada: "Sugestões da IA",
    estrutura: "Fonte original e trecho citado",
    revisao: "Aprovação obrigatória antes de gerar",
    proxima: "Liberar a próxima ação",
  },
  {
    n: "04",
    title: "Próxima ação",
    desc: "A partir do que foi aprovado, o sistema propõe o próximo passo: tarefa, prazo ou minuta.",
    entrada: "Itens aprovados",
    estrutura: "Tarefa, prazo ou minuta",
    revisao: "Advogado confirma a ação",
    proxima: "Registrar e seguir o caso",
  },
];

export function MechanismSection() {
  const [active, setActive] = useState(0);
  const stage = STAGES[active];

  return (
    <section
      id="como-funciona"
      className="scroll-mt-16 border-b border-[var(--border)]"
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Trilha operacional
          </p>
          <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            A trilha do caso, do contexto à próxima ação.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
            Um percurso guiado, não uma caixa de texto. Cada estágio produz uma
            saída verificável e conduz ao próximo: a IA sugere, o advogado revisa
            e aprova.
          </p>
        </div>

        {/* Stepper da trilha — 4 estágios */}
        <ol className="mt-12 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, i) => {
            const isActive = i === active;
            const done = i < active;
            return (
              <li key={s.n}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className={`h-full w-full rounded-md border px-4 py-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                    isActive
                      ? "border-[var(--primary)] bg-[var(--surface)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="site-status-dot shrink-0"
                      data-active={isActive || done ? "true" : "false"}
                      aria-hidden="true"
                    />
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isActive || done
                          ? "text-[var(--primary)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {s.n}
                    </span>
                  </div>
                  <span className="mt-2 block text-sm font-semibold leading-snug text-[var(--foreground)]">
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Painel do estágio ativo */}
        <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-semibold text-[var(--primary)]">
              {stage.n}
            </span>
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              {stage.title}
            </h3>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            {stage.desc}
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Entrada" value={stage.entrada} />
            <Field label="Estruturação" value={stage.estrutura} />
            <Field label="Revisão humana" value={stage.revisao} />
            <Field label="Próxima ação" value={stage.proxima} />
          </dl>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-[var(--border)] pt-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--foreground)]">{value}</dd>
    </div>
  );
}
