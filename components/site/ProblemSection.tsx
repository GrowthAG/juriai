// Bloco fundido (antes: ProblemSection + NotChatSection). Contraste direto
// entre a operação dispersa e o fluxo guiado do JuriAI. Azul só no lado do
// fluxo (status). Copy sem promessa técnica nem nomes internos de schema.

const LOOSE = [
  "Publicações chegam por canais diferentes",
  "Documentos ficam fora do contexto do caso",
  "Prazos dependem de planilhas e memória",
  "Respostas soltas não viram próxima ação",
];

const GUIDED = [
  "Contexto recebido",
  "Documento vinculado",
  "Revisão humana",
  "Próxima ação sugerida",
];

export function ProblemSection() {
  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Antes e depois
          </p>
          <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Do prompt solto ao fluxo guiado.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
            O JuriAI transforma entradas dispersas em contexto estruturado,
            revisão humana e próxima ação.
          </p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] md:grid-cols-2">
          {/* Prompt solto — operação dispersa */}
          <div className="border-b border-[var(--border)] px-6 py-7 md:border-b-0 md:border-r">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Prompt solto
            </p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">operação dispersa</p>
            <ul className="mt-5 grid gap-3.5">
              {LOOSE.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1 w-4 shrink-0 rounded-full bg-[var(--border-strong)]"
                  />
                  <span className="text-[var(--foreground)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fluxo guiado — operação estruturada */}
          <div className="px-6 py-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
              Fluxo guiado
            </p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              operação estruturada
            </p>
            <ul className="mt-5 grid gap-3.5">
              {GUIDED.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm leading-relaxed">
                  <span
                    className="site-status-dot shrink-0"
                    data-active="true"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-[var(--foreground)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Não é uma caixa de texto esperando um prompt. É um fluxo guiado: a IA
          estrutura e sugere, o advogado revisa e aprova, e cada saída aponta a
          próxima ação.
        </p>
      </div>
    </section>
  );
}
