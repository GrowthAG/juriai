import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, ButtonLink, Card } from "@/components/ui";
import { DeleteCaseButton } from "@/components/DeleteCaseButton";
import { AnalisarCasoButton } from "@/components/AnalisarCasoButton";
import { isLlmConfigured } from "@/lib/llm";
import { tribunalGroupsForDomain } from "@/lib/tribunais";
import { CASE_TYPE_LABEL, DOMAIN_LABEL, GAP_LABEL } from "@/lib/case-labels";
import {
  attachDatajudProcess,
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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caso = await getCase(id);
  const ingestionJobs = await listCaseIngestionJobs(id);
  const courtProcesses = await listCaseCourtProcesses(id);
  const llmConfigured = await isLlmConfigured();
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
          <Card className="mt-6 border-[var(--primary)] bg-[var(--surface)] px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Vincular processo judicial</p>
                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  Consulte o DataJud/CNJ pelo número único e importe as
                  movimentações como timeline pendente de validação nos autos.
                </p>
              </div>
              <span className="rounded-lg bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted)]">
                CNJ
              </span>
            </div>

            <form
              action={attachDatajudProcess.bind(null, caso.id)}
              className="mt-5 grid gap-3 sm:grid-cols-[200px_1fr_auto]"
            >
              <select
                name="tribunal"
                required
                defaultValue=""
                className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm outline-none focus:border-[var(--primary)]"
              >
                <option value="" disabled>
                  Selecione o tribunal
                </option>
                {tribunalGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.tribunais.map((t) => (
                      <option key={t.sigla} value={t.sigla}>
                        {t.sigla} · {t.nome}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input
                name="numeroProcesso"
                type="text"
                required
                placeholder="100XXXX-XX.2024.8.26.0000"
                className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
              />
              <Button type="submit" size="md">
                Consultar
              </Button>
            </form>
          </Card>
        )}

        <Card className="mt-6 border-[var(--primary)] bg-[var(--surface)] px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Provas do caso</p>
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                Anexe contrato, print, e-mail ou PDF para compor o contexto do
                caso.
              </p>
            </div>
            <span className="rounded-lg bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted)]">
              pendente
            </span>
          </div>

          <form
            action={`/api/cases/${caso.id}/evidence`}
            method="post"
            encType="multipart/form-data"
            className="mt-5 grid gap-3 sm:grid-cols-[1.1fr_1fr_auto]"
          >
            <input
              name="file"
              type="file"
              required
              className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--primary-foreground)] hover:file:bg-[var(--primary-hover)]"
            />
            <input
              name="label"
              type="text"
              required
              placeholder="Título da prova"
              className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
            />
            <Button type="submit" size="md" variant="secondary">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 1 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
              </svg>
              Anexar prova
            </Button>
            <textarea
              name="description"
              rows={3}
              placeholder="Descrição opcional"
              className="sm:col-span-2 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
            />
          </form>
        </Card>

        {/* Próximo passo sempre visível (wizard, não ferramenta) */}
        <Card className="mt-6 flex items-center justify-between gap-4 border-[var(--primary)] bg-[var(--surface)] px-5 py-4">
          <div>
            <p className="font-semibold">Análise preliminar</p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              O JuriAI estrutura a narrativa, organiza a linha do tempo e aponta
              lacunas para revisão do advogado.
            </p>
          </div>
          <AnalisarCasoButton caseId={caso.id} configured={llmConfigured} />
        </Card>

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
              <Empty text="Nenhuma prova ainda." />
            ) : (
              caso.evidence.map((e) => (
                <Row key={e.id} title={e.label} tag={e.strength} />
              ))
            )}
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
