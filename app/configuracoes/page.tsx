import { Card } from "@/components/ui";
import { getActorContext } from "@/lib/actor-context";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const ctx = await getActorContext();

  return (
    <main className="flex-1 px-8 py-8">
      <h1 className="text-xl font-semibold tracking-tight">Configurações</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Sessão atual e preferências da conta.
      </p>

      <Card className="mt-6 px-5 py-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Usuário" value={ctx.actorName} />
          <Field label="E-mail" value={ctx.actorEmail} />
          <Field label="Escritório" value={ctx.workspaceName} />
          <Field label="Acesso" value={ctx.isSuperAdmin ? "Super admin" : "Usuário"} />
        </dl>
      </Card>

      <p className="mt-4 text-xs text-[var(--muted)]">
        Estes dados vêm do contexto local (variáveis JURIAI_*). O login real
        via Google já está disponível; troca de senha e a integração completa
        com Identity Platform ainda estão em implementação.
      </p>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
