import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { DOMAIN_LABEL } from "@/lib/case-labels";

// Etapa 2 do wizard — placeholder visual funcional. Server component, sem
// estado, sem API/IA/banco. A validacao da area usa a fonte canonica
// (DOMAIN_LABEL), sem lista paralela: o slug de rota e a chave em minusculas.

const STEPPER_STAGES = ["Área", "Contexto", "Partes", "Documentos", "Revisão"];

// Campos visuais da etapa 2 (placeholders, sem submit real).
const CONTEXT_FIELDS: { label: string; placeholder: string }[] = [
  {
    label: "Resumo inicial",
    placeholder:
      "Descreva em poucas linhas o que aconteceu e o que o cliente busca.",
  },
  {
    label: "Partes envolvidas",
    placeholder: "Quem são as partes e qual o papel de cada uma no caso.",
  },
  {
    label: "Documentos disponíveis",
    placeholder: "Contratos, publicações, comprovantes já em mãos.",
  },
  {
    label: "Prazos conhecidos",
    placeholder: "Datas, vencimentos ou prazos processuais já identificados.",
  },
];

const NEXT_STEPS: { label: string; active?: boolean }[] = [
  { label: "Informar contexto", active: true },
  { label: "Vincular documentos" },
  { label: "Revisar lacunas" },
  { label: "Criar caso" },
];

export default async function NovoCasoContextoPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area } = await params;
  const key = area.toUpperCase();
  const label = DOMAIN_LABEL[key];
  if (!label) notFound();

  const contextRows: { k: string; v: string; muted?: boolean }[] = [
    { k: "Área", v: label },
    { k: "Status", v: "em estruturação" },
    { k: "Documentos", v: "pendente", muted: true },
    { k: "Prazos", v: "pendente", muted: true },
    { k: "Revisão", v: "obrigatória antes da criação" },
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
            Informe o contexto mínimo para preparar a estrutura do caso.
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

          {/* Etapa 2 — Contexto do caso */}
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
              Estes campos preparam a estrutura do dossiê. Nada é salvo nesta
              etapa; a criação exige revisão.
            </p>

            <div className="mt-4 grid gap-4">
              {CONTEXT_FIELDS.map((field) => (
                <div key={field.label}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {field.label}
                  </p>
                  <div className="mt-1.5 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]">
                    {field.placeholder}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
            A IA sugere a estrutura a partir da área e do conteúdo. O advogado
            revisa e aprova; nenhuma criação avança sem revisão.
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

      {/* Command bar inferior — visual/auxiliar, sem ação real (etapa futura). */}
      <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex-1 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]">
            A entrada de contexto será habilitada em uma etapa futura do wizard.
          </div>
          <Button size="md" disabled>
            Continuar (etapa futura)
          </Button>
        </div>
      </div>
    </main>
  );
}
