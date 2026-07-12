const PAIRS = [
 { label: "Entrada", value: "Fluxo guiado por etapa, não um prompt aberto." },
 { label: "Saída", value: "Fonte, trecho citado e confiança declarada." },
 { label: "Decisão", value: "Do advogado, com revisão humana obrigatória." },
 { label: "Registro", value: "Trilha de auditoria em cada passo." },
];

export function NotChatSection() {
 return (
 <section id="produto" className="scroll-mt-16 border-b border-[var(--border)]">
 <div className="mx-auto max-w-6xl px-6 py-20">
 <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
 <div className="max-w-xl">
 <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
 Wizard, não chat
 </p>
 <h2 className="mt-4 font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
 Não é mais uma caixa de texto esperando um prompt.
 </h2>
 <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
 Um chatbot genérico devolve texto e transfere o risco inteiro para
 quem pergunta. O JuriAI conduz a operação: cada etapa tem entrada
 estruturada, saída verificável e um responsável definido.
 </p>
 <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
 A IA estrutura e sugere. O advogado revisa e aprova. Nada vira
 verdade só porque um modelo escreveu.
 </p>
 </div>

 <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
 <div className="border-b border-[var(--border)] px-6 py-4">
 <p className="text-sm font-semibold text-[var(--foreground)]">
 O que muda na prática
 </p>
 </div>
 <dl className="divide-y divide-[var(--border)]">
 {PAIRS.map((pair) => (
 <div
 key={pair.label}
 className="grid grid-cols-[7rem_1fr] gap-4 px-6 py-4"
 >
 <dt className="text-sm font-medium text-[var(--muted)]">
 {pair.label}
 </dt>
 <dd className="text-sm text-[var(--foreground)]">
 {pair.value}
 </dd>
 </div>
 ))}
 </dl>
 </div>
 </div>
 </div>
 </section>
 );
}
