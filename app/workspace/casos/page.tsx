import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonLink, Card } from "@/components/ui";
import { DeleteCaseButton } from "@/components/DeleteCaseButton";
import { StatusBadge, TypeBadge } from "@/components/CaseBadges";
import { getActorContext } from "@/lib/actor-context";
import { listAccessibleCases } from "@/lib/access";
import { DOMAIN_LABEL, relativeDays } from "@/lib/case-labels";

export const dynamic = "force-dynamic";

export default async function CasosIndexPage() {
  const ctx = await getActorContext();
  // A conta mestre é control plane e não opera casos (mesma invariante do dashboard).
  if (ctx.workspaceKind === "MASTER" || ctx.isSuperAdmin) {
    redirect("/admin");
  }

  const cases = await listAccessibleCases();

  return (
    <main className="flex-1 px-8 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Meu Escritório
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight">
            Casos
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {cases.length}{" "}
            {cases.length === 1 ? "caso acessível" : "casos acessíveis"} neste
            escritório.
          </p>
        </div>
        <ButtonLink href="/casos/novo" size="lg">
          Novo caso
        </ButtonLink>
      </div>

      {cases.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center justify-center px-6 py-16 text-center">
          <h2 className="text-lg font-semibold">Nenhum caso ainda</h2>
          <p className="mt-1 max-w-md text-sm text-[var(--muted)]">
            Crie o primeiro caso para começar a organizar provas, linha do tempo
            e lacunas.
          </p>
          <div className="mt-6">
            <ButtonLink href="/casos/novo" size="lg">
              Novo caso
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <Card className="mt-6 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-6 py-3 font-medium">Caso</th>
                <th className="px-6 py-3 font-medium">Área</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Atualizado</th>
                <th className="px-6 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--background)]"
                >
                  <td className="px-6 py-3">
                    <Link
                      href={`/casos/${c.id}`}
                      className="font-medium hover:text-[var(--primary)]"
                    >
                      {c.title}
                    </Link>
                    <p className="text-xs text-[var(--muted)]">
                      {c.clientName ?? "Cliente não informado"}
                    </p>
                  </td>
                  <td className="px-6 py-3 text-[var(--muted)]">
                    {DOMAIN_LABEL[c.domain] ?? c.domain}
                  </td>
                  <td className="px-6 py-3">
                    <TypeBadge type={c.type} />
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-3 text-[var(--muted)]">
                    {relativeDays(c.updatedAt)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/casos/${c.id}/editar`}
                        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        Editar
                      </Link>
                      <DeleteCaseButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </main>
  );
}
