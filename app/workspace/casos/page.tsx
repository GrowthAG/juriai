import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonLink, Card } from "@/components/ui";
import { DeleteCaseButton } from "@/components/DeleteCaseButton";
import { StatusBadge, TypeBadge } from "@/components/CaseBadges";
import { getActorContext } from "@/lib/actor-context";
import { listAccessibleCases } from "@/lib/access";
import {
  CASE_STATUS,
  CASE_STATUS_ORDER,
  DOMAIN_LABEL,
  relativeDays,
} from "@/lib/case-labels";

export const dynamic = "force-dynamic";

// Busca acento-insensível: "família" casa com "familia".
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const inputClass =
  "h-10 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--primary)]";

export default async function CasosIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; area?: string }>;
}) {
  const ctx = await getActorContext();
  // A conta mestre é control plane e não opera casos (mesma invariante do dashboard).
  if (ctx.workspaceKind === "MASTER" || ctx.isSuperAdmin) {
    redirect("/admin");
  }

  const { q = "", status = "", area = "" } = await searchParams;
  // Fonte única e isolada por acesso: nunca consultamos casos fora deste escopo.
  const allCases = await listAccessibleCases();

  // Só oferecemos filtro de área para domínios que existem de fato na lista.
  const presentDomains = Object.keys(DOMAIN_LABEL).filter((domain) =>
    allCases.some((c) => c.domain === domain),
  );
  // Filtros só valem se corresponderem a valores reais do enum/dados.
  const statusFilter = CASE_STATUS_ORDER.includes(status) ? status : "";
  const areaFilter = presentDomains.includes(area) ? area : "";
  const query = normalize(q.trim());

  const cases = allCases.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (areaFilter && c.domain !== areaFilter) return false;
    if (query) {
      const haystack = normalize(`${c.title} ${c.clientName ?? ""}`);
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const hasFilter = Boolean(query || statusFilter || areaFilter);
  const countLabel = hasFilter
    ? `${cases.length} de ${allCases.length} ${
        allCases.length === 1 ? "caso" : "casos"
      }`
    : `${allCases.length} ${
        allCases.length === 1 ? "caso acessível" : "casos acessíveis"
      } neste escritório.`;

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
          <p className="mt-2 text-sm text-[var(--muted)]">{countLabel}</p>
        </div>
        <ButtonLink href="/casos/novo" size="lg">
          Novo caso
        </ButtonLink>
      </div>

      {allCases.length === 0 ? (
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
        <>
          {/* Busca + filtros (GET: a URL filtrada é compartilhável e sobrevive a refresh) */}
          <form
            method="get"
            className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por caso ou cliente"
              aria-label="Buscar por título do caso ou nome do cliente"
              className={`${inputClass} sm:flex-1`}
            />
            <select
              name="status"
              defaultValue={statusFilter}
              aria-label="Filtrar por status"
              className={inputClass}
            >
              <option value="">Todos os status</option>
              {CASE_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {CASE_STATUS[s]?.label ?? s}
                </option>
              ))}
            </select>
            <select
              name="area"
              defaultValue={areaFilter}
              aria-label="Filtrar por área"
              className={inputClass}
            >
              <option value="">Todas as áreas</option>
              {presentDomains.map((d) => (
                <option key={d} value={d}>
                  {DOMAIN_LABEL[d] ?? d}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 rounded-[var(--radius-card)] bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
            >
              Filtrar
            </button>
            {hasFilter ? (
              <Link
                href="/workspace/casos"
                className="flex h-10 items-center px-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Limpar
              </Link>
            ) : null}
          </form>

          {cases.length === 0 ? (
            <Card className="mt-4 flex flex-col items-center justify-center px-6 py-16 text-center">
              <h2 className="text-lg font-semibold">
                Nenhum caso corresponde ao filtro
              </h2>
              <p className="mt-1 max-w-md text-sm text-[var(--muted)]">
                Ajuste a busca ou os filtros para encontrar o caso que procura.
              </p>
              <div className="mt-6">
                <ButtonLink href="/workspace/casos" size="lg" variant="secondary">
                  Limpar filtros
                </ButtonLink>
              </div>
            </Card>
          ) : (
            <Card className="mt-4 overflow-hidden">
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
        </>
      )}
    </main>
  );
}
