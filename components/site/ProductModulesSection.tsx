import { SiteReveal } from "./SiteReveal";

const MODULES = [
  {
    name: "Casos",
    desc: "Dossiê com partes, status e resumo. Um lugar para o caso inteiro viver.",
  },
  {
    name: "Provas",
    desc: "Upload e força probatória (FORTE / MÉDIA / FRACA). Alerta quando o documento parece de outro caso.",
  },
  {
    name: "Análise",
    desc: "Fatos, riscos e lacunas a partir do material. [FATO ALEGADO] quando falta prova.",
  },
  {
    name: "Rascunhos",
    desc: "Peças para revisão humana, com exportação em PDF. Você assina o que aprova.",
  },
  {
    name: "Conversa no caso",
    desc: "Estratégia no contexto do dossiê. Minuta formal fica no módulo de rascunhos.",
  },
  {
    name: "Monitoramento",
    desc: "Publicações e consulta processual quando a fonte oficial responder.",
  },
];

export function ProductModulesSection() {
  return (
    <section id="produto" className="scroll-mt-16 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SiteReveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Módulos
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Um sistema de caso. Não um assistente avulso.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
              Tudo indexado ao mesmo dossiê. Isso transforma resposta de IA em
              operação jurídica que o escritório consegue auditar.
            </p>
          </div>
        </SiteReveal>

        <SiteReveal delayMs={60}>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod, i) => (
              <li key={mod.name} className="bg-white px-6 py-6 sm:py-7">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                  {mod.name}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                  {mod.desc}
                </p>
              </li>
            ))}
          </ul>
        </SiteReveal>
      </div>
    </section>
  );
}
