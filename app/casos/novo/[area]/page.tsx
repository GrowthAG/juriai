import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { CASE_TYPE_LABEL, DOMAIN_LABEL } from "@/lib/case-labels";
import { createCaseFromWizard } from "@/app/actions/cases";

// Etapa 2 do wizard: contexto mínimo que cria o caso de verdade. Server
// component; o submit chama a action createCaseFromWizard (adaptador da
// createCase). A validacao da area usa a fonte canonica (DOMAIN_LABEL): o slug
// de rota e a chave em minusculas.

const STEPPER_STAGES = ["Área", "Contexto", "Criação"];

const FORM_ID = "novo-caso-form";

const fieldClass =
  "w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]";

const NEXT_STEPS: { label: string; active?: boolean }[] = [
  { label: "Informar contexto", active: true },
  { label: "Criar caso", active: true },
  { label: "Anexar provas" },
  { label: "Gerar análise para revisão" },
];

export default async function NovoCasoContextoPage({
  params,
  searchParams,
}: {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { area } = await params;
  const { error } = await searchParams;
  const key = area.toUpperCase();
  const label = DOMAIN_LABEL[key];
  if (!label) notFound();

  const contextRows: { k: string; v: string; muted?: boolean }[] = [
    { k: "Área", v: label },
    { k: "Status", v: "em estruturação" },
    { k: "Provas", v: "após a criação", muted: true },
    { k: "Prazos", v: "após a criação", muted: true },
    { k: "Revisão", v: "obrigatória na análise" },
  ];

  return (
    <main className="flex-1 bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-3">
        {/* Fluxo guiado central */}
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Fluxo guiado
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Etapa 2 · Contexto inicial
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Informe o contexto mínimo para criar o caso. Provas e análise vêm
            depois, já dentro do caso.
          </p>

          {/* Stepper do wizard — etapa 2 ativa */}
          <ol className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {STEPPER_STAGES.map((stage, i) => (
              <li key={stage} className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    i <= 1
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted)]"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-sm font-medium ${
                    i === 1 ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                  }`}
                >
                  {stage}
                </span>
              </li>
            ))}
          </ol>

          {/* Etapa 2 — Contexto do caso (formulário real) */}
          <Card className="mt-6 p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Etapa 2 · Contexto do caso — {label}
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                Etapa 2 de {STEPPER_STAGES.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Estes campos criam o caso. Você poderá editá-los e anexar provas
              logo em seguida.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-[var(--radius-card)] border border-[var(--danger)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--danger)]"
              >
                {error}
              </p>
            )}

            <form
              id={FORM_ID}
              action={createCaseFromWizard.bind(null, key)}
              className="mt-4 grid gap-4"
            >
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Título do caso
                </span>
                <input
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  autoFocus
                  placeholder="Ex: Rescisão contratual — Onboard S.A."
                  className={fieldClass}
                />
                <span className="text-xs text-[var(--muted)]">
                  Nome objetivo (assunto — parte envolvida), não a narrativa em
                  primeira pessoa.
                </span>
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Cliente
                </span>
                <input
                  name="clientName"
                  type="text"
                  maxLength={200}
                  placeholder="Cliente não informado"
                  className={fieldClass}
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Tipo do caso
                </span>
                <select name="type" required defaultValue="" className={fieldClass}>
                  <option value="" disabled>
                    Selecione o tipo
                  </option>
                  {Object.entries(CASE_TYPE_LABEL).map(([value, typeLabel]) => (
                    <option key={value} value={value}>
                      {typeLabel}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Resumo inicial
                </span>
                <textarea
                  name="summary"
                  rows={4}
                  maxLength={2000}
                  placeholder="Descreva em poucas linhas o que aconteceu e o que o cliente busca."
                  className={fieldClass}
                />
              </label>
            </form>
          </Card>

          <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
            A IA sugere a estrutura a partir da área e do conteúdo. O advogado
            revisa e aprova; nenhuma análise avança sem revisão.
          </p>

          {/* Voltar para seleção de área */}
          <div className="mt-6">
            <Link
              href="/casos/novo"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              ← Voltar para seleção de área
            </Link>
          </div>
        </div>

        {/* Painel direito de contexto */}
        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Contexto do caso
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {contextRows.map((row) => (
                <div key={row.k} className="flex justify-between gap-3">
                  <dt className="text-[var(--muted)]">{row.k}</dt>
                  <dd
                    className={`font-medium ${
                      row.muted
                        ? "text-[var(--muted)]"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Próximas etapas
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {NEXT_STEPS.map((step) => (
                <li key={step.label} className="flex items-center gap-2">
                  <span
                    className="site-status-dot"
                    data-active={step.active ? "true" : "false"}
                    aria-hidden="true"
                  />
                  <span
                    className={
                      step.active
                        ? "font-medium text-[var(--foreground)]"
                        : "text-[var(--muted)]"
                    }
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      {/* Command bar inferior — submit real do formulário da etapa 2. */}
      <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex-1 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]">
            Revise o contexto acima. O caso é criado com estes dados e pode ser
            editado em seguida.
          </div>
          <Button type="submit" form={FORM_ID} size="md">
            Criar caso
          </Button>
        </div>
      </div>
    </main>
  );
}
