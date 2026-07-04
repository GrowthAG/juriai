import Link from "next/link";
import { getAdminOverview, listAdminWorkspaces } from "@/app/actions/admin";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [overview, workspaces] = await Promise.all([
    getAdminOverview(),
    listAdminWorkspaces(),
  ]);

  const totalCases = workspaces.reduce(
    (sum, workspace) => sum + Number(workspace.caseCount ?? 0),
    0,
  );
  const workspacesWithAi = workspaces.filter(
    (workspace) => Boolean(workspace.llmProvider && workspace.llmProvider !== "inherit"),
  ).length;

  return (
    <main className="flex-1 px-8 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Console JuriAI
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Console JuriAI
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Gerencie escritórios, planos, uso e saúde da plataforma.
          </p>
        </div>
        <div className="text-right text-xs text-[var(--muted)]">
          <p>{overview.workspaceName}</p>
          <p>{overview.isSuperAdmin ? "Admin global" : "Admin do escritório"}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Escritórios ativos" value={overview.counts.workspaces} />
        <Metric label="Membros totais" value={overview.counts.users} />
        <Metric label="Casos ativos" value={totalCases} />
        <Metric
          label="Uso de IA"
          value={workspacesWithAi > 0 ? `${workspacesWithAi} escritórios` : "Dados demo"}
          hint="Indicador visual"
        />
        <Metric label="Saúde dos ambientes" value="Dados demo" hint="Monitoramento futuro" />
      </div>

      <Card className="mt-6 px-5 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">Indicadores provisórios</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Os cards de IA e saúde usam fallback visual até o monitoramento
              operacional existir.
            </p>
          </div>
          <span className="rounded bg-[var(--background)] px-2 py-1 text-xs font-medium text-[var(--muted)]">
            dados demo
          </span>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ActionCard
          href="/admin/subcontas"
          title="Escritórios"
          description="Ver, criar e organizar os ambientes empresariais do JuriAI."
        />
        <ActionCard
          href="/admin/planos"
          title="Planos"
          description="Gerenciar produtos, limites e cobrança."
        />
        <ActionCard
          title="Saúde"
          description="Monitoramento operacional dos escritórios e da plataforma."
        />
        <ActionCard
          title="Configurações globais"
          description="Parâmetros administrativos do Console JuriAI."
        />
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </Card>
  );
}

function ActionCard({
  href,
  title,
  description,
}: {
  href?: string;
  title: string;
  description: string;
}) {
  const content = (
    <Card className="px-5 py-5 transition-colors hover:border-[var(--primary)]">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      {!href ? (
        <p className="mt-4 text-xs uppercase tracking-wide text-[var(--muted)]">
          Em breve
        </p>
      ) : null}
    </Card>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}
