import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { DeleteCaseButton } from "@/components/DeleteCaseButton";
import { AnalisarCasoButton } from "@/components/AnalisarCasoButton";
import { CaseCopilotPanel } from "@/components/CaseCopilotPanel";
import { EvidenceUploadForm } from "@/components/EvidenceUploadForm";
import { GenerateDraftForm } from "@/components/GenerateDraftForm";
import { IngestionStatusRefresh } from "@/components/IngestionStatusRefresh";
import { StrengthBadge } from "@/components/CaseBadges";
import { VincularProcessoForm } from "@/components/VincularProcessoForm";
import { getActorContext } from "@/lib/actor-context";
import { getLlmRuntimeState } from "@/lib/llm";
import { prisma } from "@/lib/prisma";
import { tribunalGroupsForDomain } from "@/lib/tribunais";
import { CASE_TYPE_LABEL, DOMAIN_LABEL, GAP_LABEL } from "@/lib/case-labels";
import {
  getCase,
  listCaseCourtProcesses,
  listCaseIngestionJobs,
} from "@/app/actions/cases";
import { reviewAuditEntry } from "@/app/actions/audits";

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
  searchParams: Promise<{
    error?: string;
    upload?: string;
    uploadError?: string;
  }>;
}) {
  const { id } = await params;
  const { error, upload, uploadError } = await searchParams;
  const caso = await getCase(id);
  const ingestionJobs = await listCaseIngestionJobs(id);
  const courtProcesses = await listCaseCourtProcesses(id);
  const llmRuntimeState = await getLlmRuntimeState();
  if (!caso) notFound();

  const actor = await getActorContext();
  const [chatMessages, auditEntries] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { caseId: caso.id },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: { role: true, content: true },
    }),
    prisma.auditEntry.findMany({
      where: { caseId: caso.id },
      orderBy: { createdAt: "desc" },
      include: {
        reviewedBy: { select: { name: true, email: true } },
      },
    }),
  ]);

  // Provas cujo job detectou partes do documento que não batem com o caso.
  const contextMismatchByEvidenceId = new Set<string>();
  for (const job of ingestionJobs) {
    if (
      !job.evidenceId ||
      !job.extractionResult ||
      typeof job.extractionResult !== "object"
    ) {
      continue;
    }
    const result = job.extractionResult as {
      contextCheck?: { matched?: boolean };
    };
    if (result.contextCheck?.matched === false) {
      contextMismatchByEvidenceId.add(job.evidenceId);
    }
  }

  const isJudicial = TIPOS_JUDICIAIS.has(caso.type);
  const tribunalGroups = tribunalGroupsForDomain(caso.domain);
  const suggestedNextStep = nextSuggestedStep({
    evidenceCount: caso.evidence.length,
    timelineCount: caso.timeline.length,
    gapCount: caso.gaps.length,
    draftCount: caso.drafts.length,
  });

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/workspace/casos"
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Casos
      </Link>

      {/* Cabeçalho operacional: ações secundárias ficam fora do eixo principal */}
      <header className="mt-3 flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:mt-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">
              {CASE_TYPE_LABEL[caso.type] ?? caso.type}
            </span>
            {!isJudicial && (
              <span className="text-xs text-[var(--muted)]">
                Fora dos tribunais
              </span>
            )}
            <span className="text-xs text-[var(--muted)]">
              {DOMAIN_LABEL[caso.domain]}
            </span>
          </div>
          <h1 className="mt-2 font-serif text-xl font-semibold tracking-tight sm:text-2xl">
            {caso.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {caso.clientName ?? "Cliente não informado"}
          </p>
          {caso.summary && (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
              {caso.summary}
            </p>
          )}
        </div>
        <details className="relative shrink-0 self-start sm:self-auto">
          <summary className="cursor-pointer select-none text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
            Mais
          </summary>
          <div className="absolute right-auto z-20 mt-2 w-44 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-2 sm:right-0">
            <Link
              href={`/casos/${caso.id}/editar`}
              className="block rounded px-2 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--background)]"
            >
              Editar caso
            </Link>
            <DeleteCaseButton
              id={caso.id}
              className="block px-2 py-1.5 text-left text-sm"
            />
          </div>
        </details>
      </header>

      {uploadError && (
        <p
          role="alert"
          className="mt-4 rounded border border-[var(--danger)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {uploadError}
        </p>
      )}
      {upload === "queued" && (
        <p
          role="status"
          className="mt-4 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          Prova salva. Use “Processar” na fila de ingestão para iniciar a
          análise do conteúdo.
        </p>
      )}
      {upload === "processing" && (
        <p
          role="status"
          className="mt-4 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          Prova salva. A análise do conteúdo foi enviada para processamento
          automático.
        </p>
      )}

      {/*
        Desktop: 2 colunas — dossiê à esquerda, assistente sticky à direita.
        Mobile: 1 coluna — assistente logo após o header (ordem lógica de ação).
      */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,24rem)] lg:items-start xl:grid-cols-[minmax(0,1.75fr)_minmax(22rem,26rem)]">
        {/* Coluna lateral: estado + análise + conversa */}
        <aside className="order-2 flex flex-col gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start">
          <Card className="px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Assistente do caso
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Converse aqui. Gere a análise do dossiê quando houver base
              documental. Rascunhos ficam na coluna principal.
            </p>
            <p className="mt-3 rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-snug text-[var(--foreground)]">
              Próximo passo sugerido: {suggestedNextStep}
            </p>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:grid-cols-4 lg:grid-cols-2">
              <Stat label="Provas" value={caso.evidence.length} />
              <Stat label="Fatos" value={caso.timeline.length} />
              <Stat label="Lacunas" value={caso.gaps.length} />
              <Stat label="Rascunhos" value={caso.drafts.length} />
            </dl>

            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <p className="text-xs font-medium text-[var(--foreground)]">
                Análise do dossiê
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Atualiza linha do tempo e lacunas a partir das provas.
              </p>
              <div className="mt-2">
                <AnalisarCasoButton
                  caseId={caso.id}
                  initialStatus={llmRuntimeState.status}
                  layout="stack"
                />
              </div>
            </div>
          </Card>

          <div className="flex min-h-[22rem] flex-1 flex-col lg:min-h-0 lg:overflow-hidden">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Conversa
            </p>
            <div className="min-h-0 flex-1 lg:max-h-[calc(100vh-16rem)]">
              <CaseCopilotPanel
                caseId={caso.id}
                caseTitle={caso.title}
                clientName={caso.clientName ?? null}
                actorName={actor.actorName}
                initialStatus={llmRuntimeState.status}
                timelineCount={caso.timeline.length}
                gapCount={caso.gaps.length}
                gapPrompts={caso.gaps.slice(0, 3).map((gap) => gap.description)}
                evidenceCount={caso.evidence.length}
                isJudicial={isJudicial}
                courtProcessCount={courtProcesses.length}
                draftCount={caso.drafts.length}
                initialMessages={chatMessages}
                compact
              />
            </div>
          </div>
        </aside>

        {/* Coluna principal: conteúdo do dossiê */}
        <div className="order-1 flex min-w-0 flex-col gap-5">
          {isJudicial && (
            <section aria-labelledby="court-process-title">
              <Card className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p id="court-process-title" className="text-sm font-semibold">
                      Processo judicial
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)] sm:text-sm">
                      Consulte o DataJud/CNJ e importe movimentações como
                      timeline pendente de validação nos autos.
                    </p>
                  </div>
                  <span className="shrink-0 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--muted)]">
                    CNJ
                  </span>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-3 rounded border border-[var(--danger)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--danger)]"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-3">
                  <VincularProcessoForm
                    caseId={caso.id}
                    tribunalGroups={tribunalGroups}
                  />
                </div>
              </Card>
            </section>
          )}

          {isJudicial && courtProcesses.length > 0 && (
            <Section title="Processos vinculados" count={courtProcesses.length}>
              {courtProcesses.map((process) => (
                <div key={process.id} className="px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
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
                    <span className="shrink-0 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--muted)]">
                      {process.movementCount} mov.
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Última sincronização: {formatDate(process.lastSyncedAt)} ·
                    Snapshots: {Number(process.snapshotCount ?? 0)}
                  </p>
                </div>
              ))}
            </Section>
          )}

          <section aria-labelledby="drafts-title">
            <Card className="overflow-hidden">
              <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <h2 id="drafts-title" className="text-sm font-semibold">
                      Rascunhos e redação
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--muted)] sm:text-sm">
                      Gere a peça aqui. O chat ao lado organiza estratégia; a
                      minuta salva neste dossiê para revisão e PDF.
                    </p>
                  </div>
                  <span className="text-xs text-[var(--muted)]">
                    {caso.drafts.length} rascunho
                    {caso.drafts.length === 1 ? "" : "s"}
                  </span>
                </div>
                <details className="mt-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] [&::-webkit-details-marker]:hidden">
                    <span>Nova minuta</span>
                  </summary>
                  <div className="mt-2 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
                    <GenerateDraftForm
                      caseId={caso.id}
                      caseType={caso.type}
                      initialStatus={llmRuntimeState.status}
                    />
                  </div>
                </details>
              </div>
              {caso.drafts.length === 0 ? (
                <Empty text="Nenhum rascunho ainda. Abra Nova minuta para gerar a primeira versão." />
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {caso.drafts.map((draft) => (
                    <DraftRow key={draft.id} draft={draft} />
                  ))}
                </div>
              )}
            </Card>
          </section>

          <Section title="Provas" count={caso.evidence.length}>
            {caso.evidence.length === 0 ? (
              <div className="px-4 pt-1 sm:px-5">
                <Empty text="Nenhuma prova ainda." />
              </div>
            ) : (
              caso.evidence.map((e) => (
                <EvidenceRow
                  key={e.id}
                  id={e.id}
                  label={e.label}
                  strength={e.strength}
                  mimeType={e.mimeType}
                  scanStatus={e.scanStatus}
                  downloadable={Boolean(
                    e.storagePath && e.scanStatus === "CLEAN",
                  )}
                  contextMismatch={contextMismatchByEvidenceId.has(e.id)}
                />
              ))
            )}
            <div className="border-t border-[var(--border)] px-4 py-3 sm:px-5">
              <details className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--background)]">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] [&::-webkit-details-marker]:hidden">
                  <span>Adicionar prova</span>
                </summary>
                <div className="border-t border-[var(--border)] bg-[var(--surface)] px-3 py-3">
                  <EvidenceUploadForm caseId={caso.id} />
                </div>
              </details>
            </div>
          </Section>

          <Section title="Ingestão" count={ingestionJobs.length}>
            <IngestionStatusRefresh
              active={ingestionJobs.some((job) =>
                ["PENDENTE", "PROCESSANDO"].includes(job.status),
              )}
            />
            {ingestionJobs.length === 0 ? (
              <Empty text="Nenhum job de ingestão ainda." />
            ) : (
              ingestionJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {job.sourceFileName}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {job.sourceMimeType || "mime desconhecido"} · {job.status}
                    </p>
                  </div>
                  {job.status === "CONCLUIDO" ? (
                    <span className="shrink-0 text-xs font-medium text-[var(--muted)]">
                      Concluído
                    </span>
                  ) : job.status === "PROCESSANDO" ? (
                    <span className="shrink-0 text-xs font-medium text-[var(--muted)]">
                      Processando…
                    </span>
                  ) : (
                    <form
                      action={`/api/ingestion-jobs/${job.id}/process`}
                      method="post"
                    >
                      <Button
                        size="md"
                        variant="ghost"
                        className="whitespace-nowrap"
                      >
                        {job.status === "FALHOU"
                          ? "Tentar novamente"
                          : "Processar"}
                      </Button>
                    </form>
                  )}
                </div>
              ))
            )}
          </Section>

          <Section title="Revisão das saídas de IA" count={auditEntries.length}>
            {auditEntries.length === 0 ? (
              <Empty text="Nenhuma saída de IA registrada para revisão." />
            ) : (
              auditEntries.map((audit) => (
                <AuditReviewRow
                  key={audit.id}
                  audit={audit}
                  reviewAction={reviewAuditEntry.bind(
                    null,
                    caso.id,
                    audit.id,
                  )}
                />
              ))
            )}
          </Section>

          <Section title="Linha do tempo" count={caso.timeline.length}>
            {caso.timeline.length === 0 ? (
              <Empty text="A linha do tempo será montada na análise do dossiê." />
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
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1.5">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </dt>
      <dd className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
        {value}
      </dd>
    </div>
  );
}

function nextSuggestedStep({
  evidenceCount,
  timelineCount,
  gapCount,
  draftCount,
}: {
  evidenceCount: number;
  timelineCount: number;
  gapCount: number;
  draftCount: number;
}) {
  if (evidenceCount === 0) return "adicionar a primeira prova do caso.";
  if (timelineCount === 0 && gapCount === 0) return "gerar a análise do dossiê.";
  if (gapCount > 0) return "validar a lacuna aberta antes de redigir.";
  if (draftCount === 0) return "abrir Nova minuta e gerar o primeiro rascunho.";
  return "revisar o rascunho mais recente ou baixar o PDF.";
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
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5 sm:px-5 sm:py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs tabular-nums text-[var(--muted)]">{count}</span>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </Card>
  );
}

// Estrutura própria (não o Row genérico) para já reservar o espaço à direita
// para futuras ações de editar/excluir metadados da prova — sem implementá-
// las ainda, já que isso exige novas server actions (fora do patch mínimo).
function EvidenceRow({
  id,
  label,
  strength,
  mimeType,
  scanStatus,
  downloadable,
  contextMismatch = false,
}: {
  id: string;
  label: string;
  strength: string;
  mimeType: string | null;
  scanStatus: string;
  downloadable: boolean;
  contextMismatch?: boolean;
}) {
  return (
    <div
      data-evidence-id={id}
      className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
    >
      <div className="min-w-0">
        <p className="truncate text-sm">{label}</p>
        {mimeType && (
          <p className="text-xs text-[var(--muted)]">{mimeType}</p>
        )}
        {scanStatus === "PENDING" && (
          <p className="mt-1.5 text-xs leading-snug text-[var(--warning)]">
            Verificação de segurança em andamento. Download e análise serão
            liberados automaticamente.
          </p>
        )}
        {scanStatus === "INFECTED" && (
          <p className="mt-1.5 text-xs leading-snug text-[var(--danger)]">
            Arquivo bloqueado pela verificação de segurança.
          </p>
        )}
        {scanStatus === "FAILED" && (
          <p className="mt-1.5 text-xs leading-snug text-[var(--danger)]">
            Não foi possível verificar a segurança deste arquivo.
          </p>
        )}
        {contextMismatch && (
          <p className="mt-1.5 text-xs leading-snug text-[var(--warning)]">
            As partes citadas neste documento não batem com as partes deste
            caso. Revise se o arquivo é do caso certo.
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {downloadable && (
          <a
            href={`/api/evidence/${id}/download`}
            className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
          >
            Baixar
          </a>
        )}
        <StrengthBadge strength={strength} />
      </div>
    </div>
  );
}

function AuditReviewRow({
  audit,
  reviewAction,
}: {
  audit: {
    id: string;
    action: string;
    model: string;
    groundedOn: unknown;
    confidence: string;
    unresolvedGaps: unknown;
    createdAt: Date;
    reviewedBy: { name: string | null; email: string } | null;
  };
  reviewAction: (formData: FormData) => Promise<void>;
}) {
  const sources = jsonItems(audit.groundedOn);
  const gaps = jsonItems(audit.unresolvedGaps);

  return (
    <div
      data-audit-id={audit.id}
      className="px-4 py-3 sm:px-5 sm:py-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {AUDIT_ACTION_LABEL[audit.action] ?? audit.action}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {audit.model} · confiança {audit.confidence.toLowerCase()} ·{" "}
            {formatDate(audit.createdAt)}
          </p>
        </div>
        {audit.reviewedBy ? (
          <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs text-[var(--muted)]">
            Revisado por {audit.reviewedBy.name || audit.reviewedBy.email}
          </span>
        ) : (
          <form action={reviewAction}>
            <Button size="md" variant="ghost">
              Marcar como revisado
            </Button>
          </form>
        )}
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
          Ver rastreabilidade
        </summary>
        <div className="mt-2 grid gap-2 text-xs leading-relaxed text-[var(--muted)]">
          <AuditDetail label="Base utilizada" items={sources} empty="Não informada" />
          <AuditDetail label="Lacunas não resolvidas" items={gaps} empty="Nenhuma" />
        </div>
      </details>
    </div>
  );
}

function AuditDetail({
  label,
  items,
  empty,
}: {
  label: string;
  items: string[];
  empty: string;
}) {
  return (
    <p>
      <span className="font-medium text-[var(--foreground)]">{label}:</span>{" "}
      {items.length > 0 ? items.join("; ") : empty}
    </p>
  );
}

function jsonItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).map((item) => {
    if (typeof item === "string") return item;
    if (typeof item === "number" || typeof item === "boolean") {
      return String(item);
    }
    return JSON.stringify(item);
  });
}

const AUDIT_ACTION_LABEL: Record<string, string> = {
  ANALYZE: "Análise do dossiê",
  GENERATE_DRAFT: "Geração de minuta",
  SUGGEST_STRATEGY: "Sugestão de estratégia",
  EXTRACT_EVIDENCE: "Extração de prova",
};

function Row({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5">
      <span className="min-w-0 text-sm leading-snug">{title}</span>
      {tag && (
        <span className="shrink-0 rounded-full bg-[var(--background)] px-2.5 py-0.5 text-xs text-[var(--muted)]">
          {tag}
        </span>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="px-4 py-3 text-sm text-[var(--muted)] sm:px-5 sm:py-4">
      {text}
    </p>
  );
}

function DraftRow({
  draft,
}: {
  draft: {
    id: string;
    type: string;
    title: string;
    content: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  };
}) {
  return (
    <div className="px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{draftTypeLabel(draft.type)}</p>
          <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
            {draft.title}
          </p>
        </div>
        <div className="shrink-0 text-right text-xs text-[var(--muted)]">
          <p>v{draft.version}</p>
          <p>Atualizado em {formatDate(draft.updatedAt)}</p>
          <p className="mt-2">
            <a
              href={`/api/drafts/${draft.id}/export`}
              className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
            >
              Abrir PDF
            </a>
          </p>
        </div>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
          Ver prévia
        </summary>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
          {previewText(draft.content, 420)}
        </p>
      </details>
    </div>
  );
}

function draftTypeLabel(value: string) {
  const label = DRAFT_TYPE_LABELS[value as keyof typeof DRAFT_TYPE_LABELS];
  return label ?? value;
}

const DRAFT_TYPE_LABELS = {
  NOTIFICACAO_EXTRAJUDICIAL: "Notificação extrajudicial",
  RESPOSTA_EXTRAJUDICIAL: "Resposta extrajudicial",
  PETICAO_INICIAL: "Petição inicial",
  CONTESTACAO: "Contestação",
  RECONVENCAO: "Reconvenção",
  ACORDO: "Acordo",
  PARECER: "Parecer",
  OUTRO: "Outro",
} as const;

function previewText(value: string, maxLength: number) {
  const normalized = value.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
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
