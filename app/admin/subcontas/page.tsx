import Link from "next/link";
import {
  enterWorkspace,
  listAdminUsers,
  listAdminWorkspaces,
} from "@/app/actions/admin";
import { ButtonLink, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SubcontasPage() {
  const [workspaces, users] = await Promise.all([
    listAdminWorkspaces(),
    listAdminUsers(),
  ]);

  const workspaceCount = workspaces.length;
  const memberCount = users.length;
  const caseCount = workspaces.reduce(
    (sum, workspace) => sum + Number(workspace.caseCount ?? 0),
    0,
  );

  return (
    <main className="flex-1 px-8 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Escritórios</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Ambientes empresariais que operam dentro do JuriAI.
          </p>
        </div>
        <ButtonLink href="/onboarding/subconta" size="md">
          Criar escritório
        </ButtonLink>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Metric label="Escritórios" value={workspaceCount} />
        <Metric label="Membros" value={memberCount} />
        <Metric label="Casos" value={caseCount} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-3">
          <h2 className="font-semibold">Escritórios</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Membros</th>
              <th className="px-5 py-3 font-medium">Casos</th>
              <th className="px-5 py-3 font-medium">Plano</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-4 text-[var(--muted)]">
                  Nenhum escritório ainda. Crie o primeiro acima.
                </td>
              </tr>
            ) : (
              workspaces.map((workspace) => (
                <tr
                  key={workspace.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium">{workspace.name}</p>
                    <p className="font-mono text-xs text-[var(--muted)]">
                      {workspace.id}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)]">
                    {Number(workspace.userCount ?? 0)}
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)]">
                    {Number(workspace.caseCount ?? 0)}
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)]">
                    {workspace.planName ?? "Sem plano"}
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)]">
                    {workspace.subscriptionStatus ?? "sem assinatura"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/subcontas/${workspace.id}`}
                        className="rounded-[var(--radius-card)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium hover:border-[var(--primary)]"
                      >
                        Gerenciar
                      </Link>
                      <form action={enterWorkspace}>
                        <input
                          type="hidden"
                          name="workspaceId"
                          value={workspace.id}
                        />
                        <button
                          type="submit"
                          className="rounded-[var(--radius-card)] bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
                        >
                          Acessar →
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-3">
          <h2 className="font-semibold">Membros</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
              <th className="px-5 py-3 font-medium">Membro</th>
              <th className="px-5 py-3 font-medium">Escritório</th>
              <th className="px-5 py-3 font-medium">Papel</th>
              <th className="px-5 py-3 font-medium">Admin global</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[var(--border)] last:border-0"
              >
                <td className="px-5 py-3">
                  <p className="font-medium">{user.name ?? user.email}</p>
                  <p className="font-mono text-xs text-[var(--muted)]">
                    {user.email}
                  </p>
                </td>
                <td className="px-5 py-3 text-[var(--muted)]">
                  {user.workspaceName}
                </td>
                <td className="px-5 py-3 text-[var(--muted)]">{user.role}</td>
                <td className="px-5 py-3 text-[var(--muted)]">
                  {user.isSuperAdmin ? "sim" : "não"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}
