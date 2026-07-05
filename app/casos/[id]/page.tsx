import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, ButtonLink, Card } from "@/components/ui";
import { DeleteCaseButton } from "@/components/DeleteCaseButton";
import { AnalisarCasoButton } from "@/components/AnalisarCasoButton";
import { EvidenceUploadForm } from "@/components/EvidenceUploadForm";
import { StrengthBadge } from "@/components/CaseBadges";
import { VincularProcessoForm } from "@/components/VincularProcessoForm";
import { getLlmRuntimeState } from "@/lib/llm";
import { tribunalGroupsForDomain } from "@/lib/tribunais";
import { CASE_TYPE_LABEL, DOMAIN_LABEL, GAP_LABEL } from "@/lib/case-labels";
import {
  getCase,
  listCaseCourtProcesses,
  listCaseIngestionJobs,
} from "@/app/actions/cases";

export const dynamic = "force-dynamic";

// Caso ja esta (ou vai estar) nos tribunais? So ai faz sentido consultar o CNJ
// e vincular numero de processo. Extrajudicial e consultivo nao passam por
// tribunal, entao esses blocos somem e a experiencia fica focada.
const TIPOS_JUDICIAIS = new Set(["JUDICIAL_PASSIVO", "JUDICIAL_ATIVO"]);

export default async function CasoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const caso = await getCase(id);
  const ingestionJobs = await listCaseIngestionJobs(id);
  const courtProcesses = await listCaseCourtProcesses(id);
  const llmRuntimeState = await getLlmRuntimeState();
  if (!caso) notFound();

  const isJudicial = TIPOS_JUDICIAIS.has(caso.type);
  const tribunalGroups = tribunalGroupsForDomain(caso.domain);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link
          href="/workspace/casos"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Casos
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">
                {CASE_TYPE_LABEL[caso.type] ?? caso.type}
              </span>
              {!isJudicial && (
                <span className="text-xs text-[var(--muted)]">
                  Fora dos tribunais
                </span>
              )}
            </div>
            <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight">
              {caso.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {caso.clientName ?? "Cliente não informado"} · {DOMAIN_LABEL[caso.domain]}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <ButtonLink href={`/casos/${caso.id}/editar`} variant="secondary" size="md">
              Editar
            </ButtonLink>
            <DeleteCaseButton id={caso.id} />
          </div>
        </div>
        {caso.summary && (
          <p className="mt-2 text-[var(--muted)]">{caso.summary}</p>
        )}

        {isJudicial && (
          <section className="mt-6" aria-labelledby="court-process-title">
            <Card className="border-[var(--primary)] bg-[var(--surface)] px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p id="court-process-title" className="font-semibold">
                    Vincular processo judicial
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    Consulte o DataJud/CNJ pelo número único e importe as
                    movimentações como timeline pendente de validação nos autos.
                  </p>
                </div>
                <span className="rounded-lg bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted)]">
                  CNJ
                </span>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-[var(--danger)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--danger)]"
                >
                  {error}
                </p>
              )}

              <VincularProcessoForm
                caseId={caso.id}
                tribunalGroups={tribunalGroups}
              />
            </Card>
          </section>
        )}

        <section className="mt-8" aria-labelledby="ai-analysis-title">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Análise com IA
          </p>
          <Card className="mt-2 flex items-center justify-between gap-4 bg-[var(--surface)] px-5 py-4">
            <div>
              <p id="ai-analysis-title" className="font-semibold">
                Análise preliminar
              </p>
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                Estrutura a narrativa, organiza a linha do tempo e aponta
                lacunas para revisão do advogado, sem depender de processo
                judicial vinculado.
              </p>
            </div>
            <AnalisarCasoButton
              caseId={caso.id}
              initialStatus={llmRuntimeState.status}
            />
          </Card>
        </section>

        <div className="mt-8 grid gap-4">
          {isJudicial && (
          <Section title="Processos judiciais" count={courtProcesses.length}>
            {courtProcesses.length === 0 ? (
              <Empty text="Nenhum processo judicial vinculado ainda." />
            ) : (
              courtProcesses.map((process) => (
                <div key={process.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-medium">
                        {formatProcessNumber(process.numeroProcesso)}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {process.tribunal}
                        {process.grau ? ` · ${process.grau}` : ""}
                        {process.orgaoJulgadorNome
                          ? ` · ${process.orgaoJulgadorNome}`
                          : ""}
                      </p>
                      {process.classeNome && (
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {process.classeNome}
                        </p>
                      )}
                    </div>
                    <span className="rounded-lg bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted)]">
                      {process.movementCount} movimentos
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    Última sincronização: {formatDate(process.lastSyncedAt)} ·
                    Snapshots: {Number(process.snapshotCount ?? 0)}
                  </p>
                </div>
              ))
            )}
          </Section>
          )}

          <Section title="Ingestão" count={ingestionJobs.length}>
            {ingestionJobs.length === 0 ? (
              <Empty text="Nenhum job de ingestão ainda." />
            ) : (
              ingestionJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{job.sourceFileName}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {job.sourceMimeType || "mime desconhecido"} · {job.status}
                    </p>
                  </div>
                  <form action={`/api/ingestion-jobs/${job.id}/process`} method="post">
                    <Button size="md" variant="secondary">
                      Processar
                    </Button>
                  </form>
                </div>
              ))
            )}
          </Section>

          <Section title="Provas" count={caso.evidence.length}>
            {caso.evidence.length === 0 ? (
              <div className="px-5 pt-1">
                <Empty text="Nenhuma prova ainda. Comece anexando a primeira." />
              </div>
            ) : (
              caso.evidence.map((e) => (
                <EvidenceRow
                  key={e.id}
                  label={e.label}
                  strength={e.strength}
                  mimeType={e.mimeType}
                />
              ))
            )}
            <div className="border-t border-[var(--border)] px-5 py-4 first:border-0">
              <EvidenceUploadForm caseId={caso.id} />
            </div>
          </Section>

          <Section title="Linha do tempo" count={caso.timeline.length}>
            {caso.timeline.length === 0 ? (
              <Empty text="A linha do tempo será montada na análise." />
            ) : (
              caso.timeline.map((t) => (
                <Row key={t.id} title={t.description} tag={t.certainty} />
              ))
            )}
          </Section>

          <Section title="Lacunas a resolver" count={caso.gaps.length}>
            {caso.gaps.length === 0 ? (
              <Empty text="Nenhuma lacuna mapeada ainda." />
            ) : (
              caso.gaps.map((g) => (
                <Row key={g.id} title={g.description} tag={GAP_LABEL[g.type]} />
              ))
            )}
          </Section>
        </div>
    </main>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-sm text-[var(--muted)]">{count}</span>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </Card>
  );
}

// Estrutura própria (não o Row genérico) para já reservar o espaço à direita
// para futuras ações de editar/excluir metadados da prova — sem implementá-
// las ainda, já que isso exige novas server actions (fora do patch mínimo).
function EvidenceRow({
  label,
  strength,
  mimeType,
}: {
  label: string;
  strength: string;
  mimeType: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm">{label}</p>
        {mimeType && (
          <p className="text-xs text-[var(--muted)]">{mimeType}</p>
        )}
      </div>
      <StrengthBadge strength={strength} />
    </div>
  );
}

function Row({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3">
      <span className="text-sm">{title}</span>
      {tag && (
        <span className="rounded-full bg-[var(--background)] px-2.5 py-0.5 text-xs text-[var(--muted)]">
          {tag}
        </span>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-5 py-4 text-sm text-[var(--muted)]">{text}</p>;
}

function formatDate(value: Date | null) {
  if (!value) return "não registrada";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatProcessNumber(value: string) {
  if (value.length !== 20) return value;
  return value.replace(
    /^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/,
    "$1-$2.$3.$4.$5.$6",
  );
}
