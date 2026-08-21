import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonLink, Card } from "@/components/ui";
import { StatusBadge } from "@/components/CaseBadges";
import { getActorContext } from "@/lib/actor-context";
import { prisma } from "@/lib/prisma";
import {
  CASE_STATUS,
  CASE_STATUS_ORDER,
  GAP_LABEL,
  DOMAIN_LABEL,
  relativeDays,
} from "@/lib/case-labels";
import {
  countTasks,
  createTask,
  listOpenTasks,
  toggleTask,
} from "@/app/actions/tasks";

export const dynamic = "force-dynamic";

type StatusRow = { status: string; n: number };
type VerticalRow = { domain: string; n: number };
type OwnerRow = { owner: string; n: number };
type RecentRow = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  owner: string;
};
type GapRow = {
  id: string;
  type: string;
  description: string;
  caseId: string;
  caseTitle: string;
};
type Option = { id: string; label: string };
type AttentionItem = {
  id: string;
  kind: "Tarefa" | "Lacuna";
  title: string;
  detail: string;
  href: string;
  tone: "danger" | "warning" | "neutral";
};

function dueLabel(due: Date | null) {
  if (!due) return { text: "sem prazo", overdue: false };
  const days = Math.floor((new Date(due).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { text: `venceu há ${Math.abs(days)} d`, overdue: true };
  if (days === 0) return { text: "vence hoje", overdue: true };
  if (days === 1) return { text: "vence amanhã", overdue: false };
  return { text: `vence em ${days} d`, overdue: false };
}

function dueTone(due: Date | null) {
  if (!due) return "neutral" as const;
  const days = Math.floor((new Date(due).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "danger" as const;
  if (days <= 1) return "warning" as const;
  return "neutral" as const;
}

export default async function WorkspacePage() {
  const ctx = await getActorContext();
  if (ctx.workspaceKind === "MASTER" || ctx.isSuperAdmin) {
    redirect("/admin");
  }

  // LIMITED_USER não tem visão agregada do escritório (mesma regra de
  // canAccessAllCases em lib/access.ts) — vai direto para a lista de casos,
  // que já filtra por acesso individual (ownerId ou CaseMember).
  if (ctx.workspaceRole === "LIMITED_USER") {
    redirect("/workspace/casos");
  }

  const wid = ctx.workspaceId;

  const [
    statusRows,
    verticalRows,
    ownerRows,
    recentRows,
    memberRows,
    gapRows,
    gapCountRows,
    caseOptions,
    memberOptions,
    openTasks,
    taskCounts,
  ] = await Promise.all([
    prisma.$queryRawUnsafe<StatusRow[]>(
      `SELECT "status"::text AS status, COUNT(*)::int AS n
       FROM "Case" WHERE "workspaceId" = $1 GROUP BY "status"`,
      wid,
    ),
    prisma.$queryRawUnsafe<VerticalRow[]>(
      `SELECT "domain"::text AS domain, COUNT(*)::int AS n
       FROM "Case"
       WHERE "workspaceId" = $1
       GROUP BY "domain"
       ORDER BY n DESC`,
      wid,
    ),
    prisma.$queryRawUnsafe<OwnerRow[]>(
      `SELECT COALESCE(u."name", u."email") AS owner, COUNT(*)::int AS n
       FROM "Case" c JOIN "User" u ON u."id" = c."ownerId"
       WHERE c."workspaceId" = $1
       GROUP BY COALESCE(u."name", u."email")
       ORDER BY n DESC LIMIT 6`,
      wid,
    ),
    prisma.$queryRawUnsafe<RecentRow[]>(
      `SELECT c."id", c."title", c."status"::text AS status, c."createdAt",
              COALESCE(u."name", u."email") AS owner
       FROM "Case" c JOIN "User" u ON u."id" = c."ownerId"
       WHERE c."workspaceId" = $1
       ORDER BY c."createdAt" DESC LIMIT 6`,
      wid,
    ),
    prisma.$queryRawUnsafe<Array<{ n: number }>>(
      `SELECT COUNT(*)::int AS n FROM "Membership" WHERE "workspaceId" = $1`,
      wid,
    ),
    prisma.$queryRawUnsafe<GapRow[]>(
      `SELECT g."id", g."type"::text AS type, g."description",
              c."id" AS "caseId", c."title" AS "caseTitle"
       FROM "Gap" g JOIN "Case" c ON c."id" = g."caseId"
       WHERE c."workspaceId" = $1 AND g."resolved" = false
       ORDER BY g."createdAt" DESC LIMIT 6`,
      wid,
    ),
    prisma.$queryRawUnsafe<Array<{ n: number }>>(
      `SELECT COUNT(*)::int AS n
       FROM "Gap" g JOIN "Case" c ON c."id" = g."caseId"
       WHERE c."workspaceId" = $1 AND g."resolved" = false`,
      wid,
    ),
    prisma.$queryRawUnsafe<Option[]>(
      `SELECT "id", "title" AS label FROM "Case"
       WHERE "workspaceId" = $1 ORDER BY "createdAt" DESC LIMIT 50`,
      wid,
    ),
    prisma.$queryRawUnsafe<Option[]>(
      `SELECT u."id", COALESCE(u."name", u."email") AS label
       FROM "User" u JOIN "Membership" m ON m."userId" = u."id"
       WHERE m."workspaceId" = $1 ORDER BY label`,
      wid,
    ),
    listOpenTasks(6),
    countTasks(),
  ]);

  const statusMap = new Map(statusRows.map((r) => [r.status, r.n]));
  const totalCases = statusRows.reduce((s, r) => s + r.n, 0);
  const activeCases =
    totalCases -
    (statusMap.get("CONCLUIDO") ?? 0) -
    (statusMap.get("ARQUIVADO") ?? 0);
  const inAnalysis = statusMap.get("ANALISE") ?? 0;
  const members = memberRows[0]?.n ?? 0;
  const primaryVertical = verticalRows[0]?.domain ?? null;
  const openGaps = gapCountRows[0]?.n ?? 0;
  const prioritySummary =
    taskCounts.overdue > 0
      ? `Priorize ${taskCounts.overdue} tarefa${taskCounts.overdue === 1 ? "" : "s"} vencida${taskCounts.overdue === 1 ? "" : "s"}.`
      : openGaps > 0
        ? `Revise ${openGaps} lacuna${openGaps === 1 ? "" : "s"} aberta${openGaps === 1 ? "" : "s"}.`
        : totalCases === 0
          ? "Crie o primeiro caso para iniciar a operação."
          : "Sem urgência crítica; revise casos recentes e mantenha a fila limpa.";
  const attentionItems: AttentionItem[] = [
    ...openTasks.map((task) => {
      const due = dueLabel(task.dueDate);
      return {
        id: `task-${task.id}`,
        kind: "Tarefa" as const,
        title: task.title,
        detail: [
          task.caseTitle ? task.caseTitle : "Sem caso",
          task.assignedToName ? task.assignedToName : null,
          due.text,
        ]
          .filter(Boolean)
          .join(" · "),
        href: task.caseId ? `/casos/${task.caseId}` : "/workspace",
        tone: dueTone(task.dueDate),
      };
    }),
    ...gapRows.map((gap) => ({
      id: `gap-${gap.id}`,
      kind: "Lacuna" as const,
      title: gap.description,
      detail: gap.caseTitle,
      href: `/casos/${gap.caseId}`,
      tone: "warning" as const,
    })),
  ].slice(0, 6);

  const donutSegments = CASE_STATUS_ORDER.filter(
    (s) => (statusMap.get(s) ?? 0) > 0,
  ).map((s) => ({
    label: CASE_STATUS[s].label,
    color: CASE_STATUS[s].color,
    value: statusMap.get(s) ?? 0,
  }));

  const maxOwner = Math.max(1, ...ownerRows.map((o) => o.n));
  const nextStepsByVertical = [
    {
      domain: "CIVIL",
      title: "Cível",
      detail: "Contratos, cobrança, prova documental e linha do tempo.",
    },
    {
      domain: "TRABALHISTA",
      title: "Trabalhista",
      detail: "Prazos fatais, peças, movimentações e revisão de risco.",
    },
    {
      domain: "TRIBUTARIO",
      title: "Tributário",
      detail: "Intimações, autos, documentos fiscais e tese com fonte.",
    },
  ];

  return (
    <main className="flex-1 px-8 py-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Cockpit operacional
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight">
            {ctx.workspaceName}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            O que exige atenção, o que está ativo e qual é a próxima ação.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="/workspace/casos" size="lg">
            Ver casos
          </ButtonLink>
          <ButtonLink href="/casos/novo" size="lg" variant="secondary">
            Novo caso
          </ButtonLink>
        </div>
      </div>

      <Card className="mt-6 border-[var(--border-strong)] px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Nicho ativo
            </p>
            <p className="mt-2 text-base font-medium text-[var(--foreground)]">
              {primaryVertical
                ? `Foco principal em ${DOMAIN_LABEL[primaryVertical] ?? primaryVertical}.`
                : "Nicho ainda não consolidado no workspace."}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {prioritySummary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {verticalRows.slice(0, 3).map((vertical) => (
              <span
                key={vertical.domain}
                className="rounded-full bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
              >
                {DOMAIN_LABEL[vertical.domain] ?? vertical.domain} · {vertical.n}
              </span>
            ))}
            <span className="rounded-full bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              {activeCases} ativos
            </span>
            <span className="rounded-full bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              {taskCounts.open} tarefas abertas
            </span>
            <span className="rounded-full bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              {openGaps} lacunas abertas
            </span>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Casos ativos" value={activeCases} accent />
        <Kpi label="Em análise" value={inAnalysis} />
        <Kpi
          label="Tarefas abertas"
          value={taskCounts.open}
          note={
            taskCounts.overdue > 0
              ? `${taskCounts.overdue} vencida${taskCounts.overdue === 1 ? "" : "s"}`
              : undefined
          }
          noteDanger
        />
        <Kpi label="Lacunas abertas" value={openGaps} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {nextStepsByVertical.map((vertical) => (
          <Card key={vertical.domain} className="px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Próximo passo por vertical
            </p>
            <h2 className="mt-2 text-base font-medium">
              {vertical.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {vertical.detail}
            </p>
          </Card>
        ))}
      </div>

      {totalCases === 0 ? (
        <EmptyState />
      ) : (
        <>
          <AttentionCard items={attentionItems} />

          {/* Gráficos */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card className="px-6 py-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Casos por status
              </h2>
              <div className="mt-5 flex items-center gap-6">
                <Donut segments={donutSegments} total={totalCases} />
                <ul className="grid gap-2 text-sm">
                  {donutSegments.map((seg) => (
                    <li key={seg.label} className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-sm"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-[var(--foreground)]">
                        {seg.label}
                      </span>
                      <span className="ml-auto font-semibold tabular-nums">
                        {seg.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card className="px-6 py-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Casos por advogado responsável
              </h2>
              <ul className="mt-5 grid gap-3">
                {ownerRows.map((o) => (
                  <li key={o.owner} className="grid gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{o.owner}</span>
                      <span className="text-[var(--muted)] tabular-nums">
                        {o.n}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--border)]">
                      <div
                        className="h-2 rounded-full bg-[var(--primary)]"
                        style={{ width: `${(o.n / maxOwner) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Tarefas + Lacunas */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <TasksCard
              tasks={openTasks}
              caseOptions={caseOptions}
              memberOptions={memberOptions}
            />
            <GapsCard gaps={gapRows} />
          </div>

          {/* Casos recentes */}
          <Card className="mt-4 overflow-hidden">
            <div className="border-b border-[var(--border)] px-6 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Casos recentes
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                  <th className="px-6 py-3 font-medium">Caso</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Responsável</th>
                  <th className="px-6 py-3 font-medium text-right">Criado</th>
                </tr>
              </thead>
              <tbody>
                {recentRows.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--background)]"
                  >
                    <td className="px-6 py-3 font-medium">
                      <Link
                        href={`/casos/${c.id}`}
                        className="hover:text-[var(--primary)]"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-3 text-[var(--muted)]">{c.owner}</td>
                    <td className="px-6 py-3 text-right text-[var(--muted)]">
                      {relativeDays(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      <p className="mt-6 text-xs text-[var(--muted)]">
        {members} {members === 1 ? "membro" : "membros"} neste escritório
      </p>
    </main>
  );
}

function Kpi({
  label,
  value,
  accent = false,
  note,
  noteDanger = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
  note?: string;
  noteDanger?: boolean;
}) {
  return (
    <Card className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <p
          className={`text-3xl font-semibold tabular-nums ${
            accent ? "text-[var(--primary)]" : ""
          }`}
        >
          {value}
        </p>
        {note ? (
          <span
            className={`text-xs font-medium ${
              noteDanger ? "text-[var(--danger)]" : "text-[var(--muted)]"
            }`}
          >
            {note}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

function AttentionCard({ items }: { items: AttentionItem[] }) {
  return (
    <Card className="mt-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Fila de atenção
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            O que exige ação antes de olhar os gráficos
          </p>
        </div>
        <span className="text-xs text-[var(--muted)]">{items.length} itens</span>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {items.length === 0 ? (
          <p className="px-6 py-5 text-sm text-[var(--muted)]">
            Nenhuma pendência urgente. O escritório está limpo no momento.
          </p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-[var(--background)]"
            >
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  item.tone === "danger"
                    ? "bg-[var(--danger)]"
                    : item.tone === "warning"
                      ? "bg-amber-500"
                      : "bg-[var(--primary)]"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                    {item.kind}
                  </span>
                  <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted)]">
                    {item.tone === "danger"
                      ? "urgente"
                      : item.tone === "warning"
                        ? "atenção"
                        : "acompanhar"}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{item.detail}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}

function TasksCard({
  tasks,
  caseOptions,
  memberOptions,
}: {
  tasks: Awaited<ReturnType<typeof listOpenTasks>>;
  caseOptions: Option[];
  memberOptions: Option[];
}) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Tarefas e prazos
        </h2>
        <span className="text-xs text-[var(--muted)]">o que você planeja</span>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {tasks.length === 0 ? (
          <p className="px-6 py-5 text-sm text-[var(--muted)]">
            Nenhuma tarefa aberta. Adicione a primeira abaixo.
          </p>
        ) : (
          tasks.map((t) => {
            const due = dueLabel(t.dueDate);
            return (
              <div key={t.id} className="flex items-start gap-3 px-6 py-3">
                <form action={toggleTask} className="pt-0.5">
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    aria-label="Concluir tarefa"
                    className="grid h-4 w-4 place-items-center rounded border border-[var(--border-strong)] text-transparent hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    ✓
                  </button>
                </form>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-[var(--muted)]">
                    {t.caseTitle ? (
                      <Link
                        href={`/casos/${t.caseId}`}
                        className="hover:text-[var(--primary)]"
                      >
                        {t.caseTitle}
                      </Link>
                    ) : (
                      <span>Sem caso</span>
                    )}
                    {t.assignedToName ? <span>· {t.assignedToName}</span> : null}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium ${
                    due.overdue
                      ? "text-[var(--danger)]"
                      : "text-[var(--muted)]"
                  }`}
                >
                  {due.text}
                </span>
              </div>
            );
          })
        )}
      </div>

      <details className="border-t border-[var(--border)] px-6 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--primary)]">
          + Nova tarefa
        </summary>
        <form action={createTask} className="mt-3 grid gap-2">
          <input
            name="title"
            required
            placeholder="Ex: protocolar contestação"
            className="h-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--primary)]"
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <select
              name="caseId"
              defaultValue=""
              className="h-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
            >
              <option value="">Sem caso</option>
              {caseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              name="assignedToId"
              defaultValue=""
              className="h-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
            >
              <option value="">Responsável</option>
              {memberOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <input
              name="dueDate"
              type="date"
              className="h-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="rounded-[var(--radius-card)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
            >
              Adicionar tarefa
            </button>
          </div>
        </form>
      </details>
    </Card>
  );
}

function GapsCard({ gaps }: { gaps: GapRow[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Lacunas abertas
        </h2>
        <span className="text-xs text-[var(--muted)]">o que a IA detectou</span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {gaps.length === 0 ? (
          <p className="px-6 py-5 text-sm text-[var(--muted)]">
            Nenhuma lacuna aberta. As análises da IA apontam pendências aqui.
          </p>
        ) : (
          gaps.map((g) => (
            <div key={g.id} className="px-6 py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm">{g.description}</p>
                <span className="shrink-0 rounded-full bg-[var(--background)] px-2.5 py-0.5 text-xs text-[var(--muted)]">
                  {GAP_LABEL[g.type] ?? g.type}
                </span>
              </div>
              <Link
                href={`/casos/${g.caseId}`}
                className="mt-1 inline-block text-xs text-[var(--muted)] hover:text-[var(--primary)]"
              >
                {g.caseTitle}
              </Link>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function Donut({
  segments,
  total,
}: {
  segments: { label: string; color: string; value: number }[];
  total: number;
}) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const lengths = segments.map((seg) => (seg.value / total) * c);
  const offsets = lengths.map((_, i) =>
    lengths.slice(0, i).reduce((a, b) => a + b, 0),
  );

  return (
    <svg width="132" height="132" viewBox="0 0 132 132" className="shrink-0">
      <circle
        cx="66"
        cy="66"
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth="14"
      />
      <g transform="rotate(-90 66 66)">
        {segments.map((seg, i) => (
          <circle
            key={seg.label}
            cx="66"
            cy="66"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${lengths[i]} ${c - lengths[i]}`}
            strokeDashoffset={-offsets[i]}
          />
        ))}
      </g>
      <text
        x="66"
        y="62"
        textAnchor="middle"
        className="fill-[var(--foreground)]"
        style={{ fontSize: "22px", fontWeight: 700 }}
      >
        {total}
      </text>
      <text
        x="66"
        y="80"
        textAnchor="middle"
        className="fill-[var(--muted)]"
        style={{ fontSize: "10px" }}
      >
        {total === 1 ? "caso" : "casos"}
      </text>
    </svg>
  );
}

function EmptyState() {
  return (
    <Card className="mt-6 flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="grid h-12 w-12 place-items-center rounded-full text-[var(--primary)]"
        style={{ backgroundColor: "rgba(0,87,216,0.1)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold">Comece pelo primeiro caso</h2>
      <p className="mt-1 max-w-md text-sm text-[var(--muted)]">
        Assim que você criar um caso, este painel ganha vida: casos por status,
        por advogado responsável, tarefas, prazos e as lacunas da IA.
      </p>
      <div className="mt-6">
        <ButtonLink href="/casos/novo" size="lg">
          Novo caso
        </ButtonLink>
      </div>
    </Card>
  );
}
