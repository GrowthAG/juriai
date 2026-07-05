import {
  assignPlanToWorkspace,
  createBillingPlan,
  listAdminPlans,
  listAdminWorkspaces,
} from "@/app/actions/admin";
import { Button, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PlanosPage() {
  const [plans, workspaces] = await Promise.all([
    listAdminPlans(),
    listAdminWorkspaces(),
  ]);

  return (
    <main className="flex-1 px-8 py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Planos</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Crie planos locais e sincronize produto/preço com Stripe quando a chave estiver configurada.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="px-5 py-5">
          <h2 className="font-semibold">Criar plano</h2>
          <form action={createBillingPlan} className="mt-4 grid gap-3">
            <Field name="name" label="Nome" placeholder="JuriAI Pro" />
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Descrição</span>
              <textarea
                name="description"
                rows={3}
                placeholder="Plano para escritório com múltiplos usuários"
                className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              <Field name="currency" label="Moeda" placeholder="brl" defaultValue="brl" />
              <Field name="monthlyPrice" label="Mensal" placeholder="299,00" />
              <Field name="yearlyPrice" label="Anual" placeholder="2990,00" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Field name="maxWorkspaces" label="Escritórios" placeholder="3" />
              <Field name="maxUsers" label="Usuários" placeholder="10" />
              <Field name="maxCases" label="Casos" placeholder="100" />
            </div>
            <div className="pt-1">
              <Button type="submit">Criar plano</Button>
            </div>
          </form>
        </Card>

        <Card className="px-5 py-5">
          <h2 className="font-semibold">Atribuir plano</h2>
          <form action={assignPlanToWorkspace} className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Escritório</span>
              <select
                name="workspaceId"
                className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Plano</span>
              <select
                name="planId"
                className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3"
              >
                <option value="">Sem plano</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Status</span>
              <select
                name="status"
                className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3"
              >
                <option value="trialing">trialing</option>
                <option value="active">active</option>
                <option value="past_due">past_due</option>
                <option value="canceled">canceled</option>
              </select>
            </label>
            <div className="pt-1">
              <Button type="submit">Atribuir</Button>
            </div>
          </form>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-3">
          <h2 className="font-semibold">Planos cadastrados</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
              <th className="px-5 py-3 font-medium">Plano</th>
              <th className="px-5 py-3 font-medium">Preço</th>
              <th className="px-5 py-3 font-medium">Limites</th>
              <th className="px-5 py-3 font-medium">Stripe</th>
              <th className="px-5 py-3 font-medium">Assinaturas</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-xs text-[var(--muted)]">{plan.description}</p>
                </td>
                <td className="px-5 py-3 text-[var(--muted)]">
                  {formatMoney(plan.monthlyPriceCents, plan.currency)}/mês
                  {plan.yearlyPriceCents
                    ? ` · ${formatMoney(plan.yearlyPriceCents, plan.currency)}/ano`
                    : ""}
                </td>
                <td className="px-5 py-3 text-[var(--muted)]">
                  {plan.maxWorkspaces ?? "-"} escritórios · {plan.maxUsers ?? "-"} usuários ·{" "}
                  {plan.maxCases ?? "-"} casos
                </td>
                <td className="px-5 py-3">
                  <p className="font-mono text-xs text-[var(--muted)]">
                    {plan.stripeProductId ?? "local"}
                  </p>
                  <p className="font-mono text-xs text-[var(--muted)]">
                    {plan.stripeMonthlyPriceId ?? "sem price"}
                  </p>
                </td>
                <td className="px-5 py-3 text-[var(--muted)]">
                  {Number(plan.subscriptionCount ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </main>
  );
}

function Field({
  name,
  label,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]"
      />
    </label>
  );
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
