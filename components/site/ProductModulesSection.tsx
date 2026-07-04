// Painel operacional (antes: grade de features). Os módulos operam sobre o
// mesmo caso — contexto compartilhado, estados visíveis (sem hover-reveal).
// Azul só no módulo ativo/status. Sem métrica falsa nem promessa técnica.

type Module = {
  name: string;
  state: string;
  active?: boolean;
};

const MODULES: Module[] = [
  { name: "Caso", state: "estruturado" },
  { name: "Publicação", state: "vinculada ao caso" },
  { name: "Documento", state: "indexado ao caso" },
  { name: "Prazo", state: "com responsável" },
  { name: "Tarefa", state: "atribuída" },
  { name: "Revisão humana", state: "aguardando aprovação", active: true },
  { name: "Próxima ação", state: "sugerida" },
];

export function ProductModulesSection() {
  return (
    <section
      id="recursos"
      className="scroll-mt-16 border-b border-[var(--border)]"
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Painel operacional
          </p>
          <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Um sistema operacional, não um assistente avulso.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
            Caso, publicação, documento, prazo, tarefa, revisão e próxima ação
            operam sobre o mesmo caso. É isso que transforma resposta de IA em
            operação jurídica conectada.
          </p>
        </div>

        {/* Painel único: todos os módulos no mesmo contexto de caso */}
        <div className="mt-12 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)]">
          {/* Titlebar — caso em foco (contexto compartilhado) */}
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
              Caso em foco{" "}
              <span className="text-[var(--foreground)]">
                · Caso 001 — Cobrança contratual
              </span>
            </p>
            <div className="flex items-center gap-2">
              <span
                className="site-status-dot"
                data-active="true"
                aria-hidden="true"
              />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Em operação
              </span>
            </div>
          </div>

          {/* Módulos conectados — estados visíveis */}
          <ul className="divide-y divide-[var(--border)]">
            {MODULES.map((mod) => (
              <li
                key={mod.name}
                className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                  mod.active ? "bg-[var(--surface)]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="site-status-dot shrink-0"
                    data-active={mod.active ? "true" : "false"}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-sm font-semibold ${
                      mod.active
                        ? "text-[var(--primary)]"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {mod.name}
                  </span>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  {mod.state}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Cada módulo herda o mesmo contexto do caso. A revisão humana fica no
          centro: nada avança para a próxima ação sem a aprovação do advogado.
        </p>
      </div>
    </section>
  );
}
