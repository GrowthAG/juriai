"use client";

import { useState } from "react";

const SCENARIOS = [
 {
 risk: "Publicação sem vínculo",
 riskDesc:
 "Uma intimação do DJEN chega e não é ligada a nenhum caso. O prazo começa a correr sem dono.",
 fix: "O JuriAI captura a publicação, sugere o caso pelo número do processo e mantém a decisão do vínculo com o advogado.",
 },
 {
 risk: "Documento sem contexto",
 riskDesc:
 "Uma peça entra solta, sem se saber a qual caso e a qual fase ela pertence.",
 fix: "Cada documento é indexado ao caso, com origem e data preservadas, e a IA extrai fatos com fonte e confiança.",
 },
 {
 risk: "Prazo sem responsável",
 riskDesc:
 "Um prazo é identificado, mas ninguém fica designado para cumpri-lo.",
 fix: "O prazo é registrado com responsável e segue rastreado até o cumprimento, dentro da trilha de auditoria.",
 },
 {
 risk: "Resposta sem fonte",
 riskDesc:
 "Uma resposta é gerada sem apontar de onde veio a informação, e o risco fica com quem lê.",
 fix: "O JuriAI só entrega saída com fonte, trecho citado e confiança declarada; sem isso, ela não avança.",
 },
 {
 risk: "Caso sem próxima ação",
 riskDesc:
 "O caso avança e ninguém sabe qual é o próximo passo, nem quem deveria dá-lo.",
 fix: "Cada etapa aprovada gera a próxima ação sugerida e rastreada, com responsável definido.",
 },
];

export function OperationalScenariosSection() {
 const [active, setActive] = useState(0);
 const scenario = SCENARIOS[active];

 return (
 <section className="border-b border-[var(--border)]">
 <div className="mx-auto max-w-6xl px-6 py-20">
 <div className="max-w-2xl">
 <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
 Cenários operacionais
 </p>
 <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
 Cenários onde a operação deixa de escapar.
 </h2>
 <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
 Não é sobre gerar texto mais rápido. É sobre não perder o que já está
 na mesa: uma publicação, um documento, um prazo.
 </p>
 </div>

 <div className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-8">
 <ul className="grid gap-2" aria-label="Cenários operacionais">
 {SCENARIOS.map((sc, i) => {
 const isActive = i === active;
 return (
 <li key={sc.risk}>
 <button
 type="button"
 aria-pressed={isActive}
 onMouseEnter={() => setActive(i)}
 onFocus={() => setActive(i)}
 onClick={() => setActive(i)}
 className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
 isActive
 ? "border-[var(--primary)] bg-[var(--surface)] font-medium text-[var(--foreground)]"
 : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--border-strong)]"
 }`}
 >
 <span className="font-mono text-xs">
 {String(i + 1).padStart(2, "0")}
 </span>
 <span>{sc.risk}</span>
 </button>
 </li>
 );
 })}
 </ul>

 <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
 <p className="text-xs font-semibold uppercase tracking-wide text-[var(--danger)]">
 Risco
 </p>
 <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
 {scenario.risk}
 </h3>
 <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
 {scenario.riskDesc}
 </p>
 <div className="mt-6 border-t border-[var(--border)] pt-6">
 <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
 Como o JuriAI resolve
 </p>
 <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
 {scenario.fix}
 </p>
 </div>
 </div>
 </div>

 <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
 Em todos os casos, a IA estrutura e sugere; a decisão passa por revisão
 humana antes de virar ação.
 </p>
 </div>
 </section>
 );
}
