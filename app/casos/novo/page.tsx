import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { DOMAIN_LABEL } from "@/lib/case-labels";

// Áreas derivadas da fonte canônica (lib/case-labels.ts). O slug de rota é a
// chave do domínio em minúsculas — sem lista paralela manual.
const DOMAIN_OPTIONS = Object.entries(DOMAIN_LABEL).map(([key, label]) => ({
  slug: key.toLowerCase(),
  label,
}));

const STEPPER_STAGES = ["Área", "Contexto", "Partes", "Documentos", "Revisão"];

const CONTEXT_ROWS: { k: string; v: string; muted?: boolean }[] = [
  { k: "Área", v: "pendente", muted: true },
  { k: "Status", v: "em estruturação" },
  { k: "Documentos", v: "0 vinculados" },
  { k: "Prazos", v: "nenhum identificado" },
  { k: "Lacunas", v: "contexto inicial pendente", muted: true },
  { k: "Revisão", v: "obrigatória antes da criação" },
];

const NEXT_STEPS: { label: string; active?: boolean }[] = [
  { label: "Definir área", active: true },
  { label: "Informar partes" },
  { label: "Vincular documentos" },
  { label: "Revisar e criar caso" },
];

// Server Component, sem estado. Wizard operacional (fluxo guiado), não chat.
export default function NovoCasoWizardPage() {
  return (
    <main className="flex-1 bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-3">
        {/* Fluxo guiado central */}
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Fluxo guiado
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Novo caso
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Estruture o contexto inicial antes de criar o caso. Revisão
            obrigatória antes da criação do caso.
          </p>

          {/* Stepper do wizard */}
          <ol className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {STEPPER_STAGES.map((stage, i) => (
              <li key={stage} className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    i === 0
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted)]"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-sm font-medium ${
                    i === 0 ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                  }`}
                >
                  {stage}
                </span>
              </li>
            ))}
          </ol>

          {/* Etapa 1 — Área do caso */}
          <Card className="mt-6 p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Etapa 1 · Área do caso
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                Etapa 1 de {STEPPER_STAGES.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Selecione uma área para carregar o fluxo adequado. A seleção define
              os próximos campos do wizard.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DOMAIN_OPTIONS.map((opt) => (
                <Link
                  key={opt.slug}
                  href={`/casos/novo/${opt.slug}`}
                  className="rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] p-4 text-left text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--background)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </Card>

          <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
            A IA sugere a estrutura a partir da área e do conteúdo. O advogado
            revisa e aprova; nenhuma criação avança sem revisão.
          </p>
        </div>

        {/* Painel direito de contexto */}
        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Contexto do caso
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {CONTEXT_ROWS.map((row) => (
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

      {/* Command bar inferior — visual/auxiliar, sem ação real (sem submit/IA/API). */}
      <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex-1 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]">
            A entrada de contexto será liberada após a escolha da área.
          </div>
          <Button size="md" disabled>
            Continuar
          </Button>
        </div>
      </div>
    </main>
  );
}
