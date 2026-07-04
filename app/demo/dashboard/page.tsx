import type { Metadata } from "next";

// Case Operations Board (demo) — visão geral do escritório para screenshot.
// Nao consulta banco, nao chama getActorContext, nao usa auth/session. Todos os
// dados sao ficticios e declarados neste arquivo. Sem grafico BI decorativo, sem
// pills chamativas: filas de trabalho + um item selecionado como detalhe.
export const metadata: Metadata = {
  title: "Demo · Dashboard",
  robots: { index: false, follow: false },
};

// Rampa monocromatica de azul para o pipeline (barras).
const BLUE_RAMP = ["#0057d8", "#3f76c9", "#6f9fe0", "#a9c6ef"];

// --- Rail lateral ---
const NAV_SECTIONS: { section: string; items: { label: string; active?: boolean }[] }[] = [
  {
    section: "Operação",
    items: [
      { label: "Visão geral", active: true },
      { label: "Casos" },
      { label: "Monitoramento" },
      { label: "Novo caso" },
    ],
  },
  { section: "Gestão do Escritório", items: [{ label: "Configurações" }] },
];

// --- KPIs ---
const KPIS: { label: string; value: string; accent?: boolean; note?: string }[] = [
  { label: "Casos ativos", value: "12", accent: true },
  { label: "Publicações aguardam vínculo", value: "4" },
  { label: "Prazos monitorados", value: "7" },
  { label: "Tarefas abertas", value: "12", note: "3 vencem hoje · 2 sem responsável" },
  { label: "Documentos indexados", value: "18" },
  { label: "Revisões pendentes", value: "5" },
];

// --- Mesa operacional: grupos/filas gerais do escritorio ---
const MESA_GROUPS: { title: string; count: string; items: string[] }[] = [
  {
    title: "Publicações aguardando vínculo",
    count: "4 itens",
    items: [
      "Intimação recebida — Cobrança contratual",
      "Publicação sem vínculo — Revisão de contrato SaaS",
    ],
  },
  {
    title: "Prazos sem responsável",
    count: "2 itens",
    items: [
      "Manifestação em 2 dias — Reclamação trabalhista",
      "Prazo a confirmar — Execução de título",
    ],
  },
  {
    title: "Tarefas críticas",
    count: "3 itens",
    items: [
      "Preparar minuta de manifestação — Cobrança contratual",
      "Confirmar prazo identificado — Reclamação trabalhista",
    ],
  },
  {
    title: "Revisões pendentes",
    count: "5 itens",
    items: [
      "Estrutura do dossiê — Execução de título",
      "Documento anexado — Revisão de contrato SaaS",
    ],
  },
  {
    title: "Casos que precisam de ação",
    count: "4 casos",
    items: [
      "Cobrança contratual — Manifestação em 2 dias",
      "Execução de título — Dossiê aguarda aprovação",
    ],
  },
];

// --- Pipeline operacional (barras) ---
const PIPELINE = [
  { stage: "Entrada recebida", value: 18 },
  { stage: "Contexto estruturado", value: 14 },
  { stage: "Revisão humana", value: 5 },
  { stage: "Tarefa criada", value: 3 },
];
const PIPELINE_MAX = Math.max(...PIPELINE.map((p) => p.value));

// --- Vínculos da tarefa selecionada (detalhe do item, nao do escritorio) ---
const TASK_LINKS = [
  { k: "Caso vinculado", v: "Cobrança contratual" },
  { k: "Publicação de origem", v: "Intimação recebida" },
  { k: "Documento vinculado", v: "Contrato assinado" },
  { k: "Prazo relacionado", v: "Manifestação em 2 dias" },
  { k: "Revisão", v: "Documento validado pelo advogado" },
  { k: "Responsável", v: "Advogado(a)" },
];

// --- Fila de tarefas criticas ---
const TASKS: { task: string; caso: string; origin: string; vinculo: string; due: string; owner: string; urgent?: boolean }[] = [
  { task: "Preparar minuta de manifestação", caso: "Cobrança contratual", origin: "Prazo identificado", vinculo: "Manifestação em 2 dias", due: "Hoje", owner: "Advogado(a)", urgent: true },
  { task: "Confirmar prazo identificado", caso: "Reclamação trabalhista", origin: "Publicação recebida", vinculo: "Intimação recebida", due: "Hoje", owner: "Advogado(a)", urgent: true },
  { task: "Vincular publicação ao caso", caso: "Revisão de contrato SaaS", origin: "Publicação sem vínculo", vinculo: "Contrato assinado", due: "Amanhã", owner: "Sem responsável" },
  { task: "Aprovar estrutura do dossiê", caso: "Execução de título", origin: "Documento vinculado", vinculo: "Dossiê do caso", due: "Esta semana", owner: "Advogado(a)" },
];

// --- Casos que precisam de ação ---
const CASES: { caso: string; status: string; pending: string; next: string; urgent?: boolean }[] = [
  { caso: "Cobrança contratual", status: "Em revisão", pending: "Manifestação em 2 dias", next: "Preparar minuta de manifestação", urgent: true },
  { caso: "Reclamação trabalhista", status: "Prazo a definir", pending: "Prazo sem responsável", next: "Confirmar prazo identificado", urgent: true },
  { caso: "Revisão de contrato SaaS", status: "Aguardando vínculo", pending: "Publicação sem vínculo", next: "Vincular publicação ao caso" },
  { caso: "Execução de título", status: "Aguardando aprovação", pending: "Dossiê aguarda aprovação", next: "Aprovar estrutura do dossiê" },
];

export default function DemoDashboardPage() {
  return (
    <div className="flex min-h-full w-full bg-[var(--background)]">
      {/* Rail lateral demo */}
      <aside className="fixed left-0 top-0 flex h-full w-56 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
        <div className="flex h-16 items-center gap-2.5 border-b border-[var(--border)] px-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/gavel-tile.svg" alt="" aria-hidden="true" className="h-8 w-8" />
          <span className="font-serif text-lg font-semibold tracking-tight">
            Juri<span className="font-sans text-[var(--primary)]">AI</span>
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_SECTIONS.map((group) => (
            <div key={group.section} className="mb-3">
              <span className="mb-1 block px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                {group.section}
              </span>
              <div className="grid gap-1">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      item.active
                        ? "border-[var(--border)] bg-[var(--background)] font-semibold text-[var(--foreground)]"
                        : "border-transparent text-[var(--muted)]"
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] px-5 py-4">
          <p className="truncate text-xs font-medium text-[var(--foreground)]">Advogado(a)</p>
          <p className="truncate text-xs text-[var(--muted)]">equipe@escritoriomodelo.demo</p>
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">Escritório Modelo</p>
          <p className="mt-2 inline-flex rounded bg-[var(--background)] px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Meu Escritório
          </p>
        </div>
      </aside>

      {/* Área principal */}
      <main className="ml-56 flex-1 px-8 py-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Inteligência operacional
            </p>
            <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight">
              Escritório Modelo
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Filas de trabalho, gargalos e próximos movimentos do escritório.
            </p>
          </div>
          <span className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)]">
            Novo caso
          </span>
        </div>

        {/* KPIs (6) */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-[var(--radius-card)] border bg-[var(--surface)] px-3 py-2.5 ${
                kpi.accent ? "border-[var(--primary)]" : "border-[var(--border)]"
              }`}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                {kpi.label}
              </p>
              <p
                className={`mt-0.5 text-xl font-semibold tabular-nums ${
                  kpi.accent ? "text-[var(--primary)]" : "text-[var(--foreground)]"
                }`}
              >
                {kpi.value}
              </p>
              {kpi.note && (
                <p className="mt-0.5 text-[10px] leading-tight text-[var(--muted)]">{kpi.note}</p>
              )}
            </div>
          ))}
        </div>

        {/* Linha 1: Mesa operacional (escritório) + Tarefa selecionada (item) */}
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
          <Panel title="Mesa operacional" hint="visão geral do escritório">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {MESA_GROUPS.map((g) => (
                <div key={g.title} className="rounded-md border border-[var(--border)] p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-xs font-semibold text-[var(--foreground)]">{g.title}</h3>
                    <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
                      {g.count}
                    </span>
                  </div>
                  <ul className="mt-2 grid gap-1.5">
                    {g.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-[11px]">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--border-strong)]"
                        />
                        <span className="text-[var(--foreground)]">{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>

          {/* Tarefa selecionada — detalhe do item, com vínculos da tarefa */}
          <Panel title="Tarefa selecionada">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Preparar minuta de manifestação
            </p>

            <div className="mt-3 rounded-md border border-[var(--border)] p-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                Vínculos da tarefa
              </h3>
              <dl className="mt-2.5 grid gap-2.5">
                {TASK_LINKS.map((l) => (
                  <div key={l.k} className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                      {l.k}
                    </dt>
                    <dd className="text-sm font-medium text-[var(--foreground)]">{l.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-3">
              <ActionButton primary>Editar tarefa</ActionButton>
              <ActionButton>Abrir caso</ActionButton>
              <ActionButton subtle>Remover</ActionButton>
            </div>
          </Panel>
        </div>

        {/* Linha 2: Pipeline operacional do escritório (apoio) */}
        <div className="mt-4">
          <Panel title="Pipeline operacional" hint="18 entradas no período">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {PIPELINE.map((p, i) => (
                <div key={p.stage}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--foreground)]">{p.stage}</span>
                    <span className="font-mono tabular-nums text-[var(--muted)]">{p.value}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--background)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(p.value / PIPELINE_MAX) * 100}%`,
                        backgroundColor: BLUE_RAMP[Math.min(i, BLUE_RAMP.length - 1)],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[var(--muted)]">
              18 entradas recebidas · 14 estruturadas · 5 aguardam revisão · 3 tarefas criadas
            </p>
          </Panel>
        </div>

        {/* Linha 3: Fila de tarefas críticas */}
        <div className="mt-4">
          <Panel title="Fila de tarefas críticas" hint="camada de execução">
            <div className="overflow-hidden rounded-md border border-[var(--border)]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                    <Th>Tarefa</Th>
                    <Th>Caso vinculado</Th>
                    <Th>Criada a partir de</Th>
                    <Th>Vínculo principal</Th>
                    <Th>Prazo</Th>
                    <Th>Responsável</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {TASKS.slice(0, 3).map((t) => (
                    <tr
                      key={t.task}
                      className={`cursor-pointer border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--background)] ${
                        t.urgent ? "border-l-2 border-l-[var(--primary)]" : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 font-medium text-[var(--foreground)]">{t.task}</td>
                      <td className="px-3 py-2.5 text-[var(--foreground)]">{t.caso}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                          {t.origin}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[var(--foreground)]">{t.vinculo}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-[var(--foreground)]">{t.due}</td>
                      <td className="px-3 py-2.5 text-[var(--muted)]">{t.owner}</td>
                      <td className="px-3 py-2.5">
                        <RowActions />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Linha 4: Casos que precisam de ação */}
        <div className="mt-4">
          <Panel title="Casos que precisam de ação">
            <div className="overflow-hidden rounded-md border border-[var(--border)]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                    <Th>Caso</Th>
                    <Th>Status</Th>
                    <Th>Pendência</Th>
                    <Th>Próxima tarefa</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {CASES.slice(0, 3).map((c) => (
                    <tr
                      key={c.caso}
                      className={`cursor-pointer border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--background)] ${
                        c.urgent ? "border-l-2 border-l-[var(--primary)]" : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 font-medium text-[var(--foreground)]">
                        <span className="inline-flex items-center gap-1.5">
                          <StatusDot on={c.urgent} />
                          {c.caso}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[var(--foreground)]">{c.status}</td>
                      <td className="px-3 py-2.5 text-[var(--muted)]">{c.pending}</td>
                      <td className="px-3 py-2.5 text-[var(--foreground)]">{c.next}</td>
                      <td className="px-3 py-2.5">
                        <RowActions />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </main>
    </div>
  );
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          {title}
        </h2>
        {hint && <span className="text-[11px] text-[var(--muted)]">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function Th({ children }: { children: string }) {
  return <th className="px-3 py-2 font-semibold text-[var(--muted)]">{children}</th>;
}

function StatusDot({ on }: { on?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 shrink-0 rounded-full ${on ? "bg-[var(--primary)]" : "bg-[var(--border-strong)]"}`}
    />
  );
}

// Ações inline por linha (estáticas, sem handler): Abrir · Editar.
function RowActions() {
  return (
    <div className="flex items-center justify-end gap-2 text-[11px]">
      <button type="button" className="font-semibold text-[var(--primary)] hover:underline">
        Abrir
      </button>
      <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
      <button type="button" className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)] hover:underline">
        Editar
      </button>
    </div>
  );
}

// Ações do painel de detalhe (estáticas, sem handler).
function ActionButton({
  children,
  primary,
  subtle,
}: {
  children: string;
  primary?: boolean;
  subtle?: boolean;
}) {
  const cls = primary
    ? "text-[var(--primary)] hover:underline"
    : subtle
      ? "text-[var(--muted)] hover:text-[var(--danger)]"
      : "text-[var(--foreground)] hover:underline";
  return (
    <button type="button" className={`text-xs font-semibold ${cls}`}>
      {children}
    </button>
  );
}
