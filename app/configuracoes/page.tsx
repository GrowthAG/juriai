import { Card } from "@/components/ui";
import { getActorContext } from "@/lib/actor-context";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const ctx = await getActorContext();

  return (
    <main className="flex-1 bg-[var(--surface)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Gestão da conta
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
          Configurações
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sessão atual, escritório e acesso da conta.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <Card className="px-5 py-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Identidade
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Usuário" value={ctx.actorName} />
              <Field label="E-mail" value={ctx.actorEmail} />
              <Field label="Escritório" value={ctx.workspaceName} />
              <Field label="Acesso" value={ctx.isSuperAdmin ? "Super admin" : "Usuário"} />
            </dl>
          </Card>

          <Card className="px-5 py-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Ambiente
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <li>Login via Google habilitado.</li>
              <li>Contexto e papel carregados do backend.</li>
              <li>Preferências da conta ainda em evolução.</li>
            </ul>
          </Card>
        </div>

        <p className="mt-4 text-xs text-[var(--muted)]">
          Estes dados vêm do contexto local (variáveis JURIAI_*). A experiência
          de conta ainda é básica e deve evoluir para preferências editáveis e
          gerenciamento de sessão no próprio produto.
        </p>
      </div>
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
