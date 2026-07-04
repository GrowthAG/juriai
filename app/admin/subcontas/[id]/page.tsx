import Link from "next/link";
import {
  createWorkspaceUser,
  enterWorkspace,
  getWorkspaceDetail,
  updateWorkspaceAiConfig,
} from "@/app/actions/admin";
import { Button, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

const ROLE_OPTIONS = [
  ["WORKSPACE_ADMIN", "Admin de escritório"],
  ["CASE_MANAGER", "Gestor de casos"],
  ["LIMITED_USER", "Usuário limitado"],
];

const MEMBERSHIP_OPTIONS = [
  ["OWNER", "Owner"],
  ["LAWYER", "Advogado"],
  ["INTERN", "Estagiário"],
  ["FINANCE", "Financeiro"],
  ["VIEWER", "Visualizador"],
];

const AI_PROVIDER_OPTIONS = [
  ["inherit", "Herdar da plataforma"],
  ["anthropic-vertex", "Claude no Vertex"],
  ["anthropic-direct", "Claude direto"],
];

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace, members } = await getWorkspaceDetail(id);

  const planLabel = workspace.planName ?? "Sem plano";
  const statusLabel = workspace.subscriptionStatus ?? "sem assinatura";

  return (
    <main className="flex-1 px-8 py-8">
      <Link
        href="/admin/subcontas"
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Escritórios
      </Link>

      <Card className="mt-3 flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">

          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {planLabel} · {statusLabel} · {Number(workspace.userCount ?? 0)}{" "}
            membros · {Number(workspace.caseCount ?? 0)} casos
          </p>
        </div>
        <form action={enterWorkspace}>
          <input type="hidden" name="workspaceId" value={workspace.id} />
          <Button type="submit" size="lg">
            Acessar escritório →
          </Button>
        </form>
      </Card>

      {/* ── Membros & Acessos ─────────────────────────────── */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Membros &amp; Acessos</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Quem entra neste escritório e o que pode fazer. &quot;Papel no
          sistema&quot; controla o acesso; &quot;Função&quot; é só um rótulo
          organizacional e não afeta permissões.
        </p>

        <Card className="mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-5 py-3 font-medium">Membro</th>
                <th className="px-5 py-3 font-medium">Papel no sistema</th>
                <th className="px-5 py-3 font-medium">Função (rótulo)</th>
                <th className="px-5 py-3 font-medium">Admin global</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-4 text-[var(--muted)]"
                  >
                    Nenhum membro ainda. Adicione um abaixo para poder acessar.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium">{m.name ?? m.email}</p>
                      <p className="font-mono text-xs text-[var(--muted)]">
                        {m.email}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)]">{m.role}</td>
                    <td className="px-5 py-3 text-[var(--muted)]">
                      {m.membershipRole ?? "não informado"}
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)]">
                      {m.isSuperAdmin ? "sim" : "não"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        <Card className="mt-4 px-5 py-5">
          <h3 className="font-semibold">Adicionar membro</h3>
          <form action={createWorkspaceUser} className="mt-4 grid gap-3">
            <input type="hidden" name="workspaceId" value={workspace.id} />
            <Field name="name" label="Nome" placeholder="Nome do usuário" />
            <Field
              name="email"
              label="E-mail"
              placeholder="usuario@escritorio.com"
              type="email"
              required
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                name="role"
                label="Papel no sistema (o que pode fazer)"
                options={ROLE_OPTIONS}
              />
              <Select
                name="membershipRole"
                label="Função no escritório (rótulo organizacional, não afeta permissões)"
                options={MEMBERSHIP_OPTIONS}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input name="isSuperAdmin" type="checkbox" />
              Admin global (cuidado: acesso total à plataforma)
            </label>
            <div className="pt-1">
              <Button type="submit">Criar membro</Button>
            </div>
          </form>
        </Card>
      </section>

      {/* ── Configurações ─────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Configurações</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Marca, plano e integração de IA deste escritório.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card className="px-5 py-5">
            <h3 className="font-semibold">Marca</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              <Row
                label="Cor primária"
                value={
                  workspace.brandPrimaryColor ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 rounded border border-[var(--border)]"
                        style={{
                          backgroundColor: workspace.brandPrimaryColor,
                        }}
                      />
                      <span className="font-mono">
                        {workspace.brandPrimaryColor}
                      </span>
                    </span>
                  ) : (
                    "não informado"
                  )
                }
              />
              <Row
                label="Logo"
                value={workspace.logoPath ? "enviado" : "não informado"}
              />
              <Row
                label="Papel timbrado"
                value={workspace.letterheadPath ? "enviado" : "não informado"}
              />
              <Row label="Porte" value={workspace.firmSize ?? "não informado"} />
            </dl>
          </Card>

          <Card className="px-5 py-5">
            <h3 className="font-semibold">Plano</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              <Row label="Plano" value={planLabel} />
              <Row label="Status" value={statusLabel} />
            </dl>
          </Card>
        </div>

        <Card className="mt-4 px-5 py-5">
          <details>
            <summary className="cursor-pointer font-semibold">
              Avançado · Integração de IA{" "}
              <span className="font-normal text-[var(--muted)]">
                (só super admin, normalmente herda da plataforma)
              </span>
            </summary>
            <form
              action={updateWorkspaceAiConfig}
              className="mt-4 grid gap-3"
            >
              <input type="hidden" name="workspaceId" value={workspace.id} />
              <Select
                name="llmProvider"
                label="Provider de IA"
                options={AI_PROVIDER_OPTIONS}
                defaultValue={workspace.llmProvider ?? "inherit"}
              />
              <Field
                name="llmModel"
                label="Modelo"
                placeholder="claude-opus-4-7"
                defaultValue={workspace.llmModel ?? ""}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  name="llmRegion"
                  label="Região Vertex"
                  placeholder="us-east5"
                  defaultValue={workspace.llmRegion ?? ""}
                />
                <Field
                  name="llmProjectId"
                  label="Project ID"
                  placeholder="juriai-app"
                  defaultValue={workspace.llmProjectId ?? ""}
                />
              </div>
              <div className="pt-1">
                <Button type="submit" variant="secondary">
                  Salvar IA
                </Button>
              </div>
            </form>
          </details>
        </Card>
      </section>
    </main>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="h-11 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]"
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: string[][];
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-11 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-3"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
