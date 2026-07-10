"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActorContext } from "@/lib/actor-context";
import { getAccessibleCase, listAccessibleCases } from "@/lib/access";
import {
  DatajudConfigError,
  DatajudInputError,
  DatajudUpstreamError,
  lookupDatajudProcess,
} from "@/lib/datajud";
import { prisma } from "@/lib/prisma";
import type { CaseType, LegalDomain } from "@prisma/client";

export async function listCases() {
  try {
    return await listAccessibleCases();
  } catch {
    return [];
  }
}

export async function getCase(id: string) {
  return getAccessibleCase(id);
}

export async function listCaseIngestionJobs(caseId: string) {
  const caso = await getAccessibleCase(caseId);
  if (!caso) return [];

  return prisma.ingestionJob.findMany({
    where: { caseId },
    select: {
      id: true,
      status: true,
      sourceFileName: true,
      sourceMimeType: true,
      storagePath: true,
      createdAt: true,
      updatedAt: true,
      error: true,
      evidenceId: true,
      extractionResult: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listCaseCourtProcesses(caseId: string) {
  const caso = await getAccessibleCase(caseId);
  if (!caso) return [];

  return prisma.$queryRaw<
    Array<{
      id: string;
      tribunal: string;
      alias: string;
      numeroProcesso: string;
      classeNome: string | null;
      orgaoJulgadorNome: string | null;
      grau: string | null;
      nivelSigilo: number | null;
      dataAjuizamento: Date | null;
      lastSyncedAt: Date | null;
      latestMovementAt: Date | null;
      movementCount: number;
      snapshotCount: bigint | number | null;
    }>
  >`
    SELECT
      cp."id",
      cp."tribunal",
      cp."alias",
      cp."numeroProcesso",
      cp."classeNome",
      cp."orgaoJulgadorNome",
      cp."grau",
      cp."nivelSigilo",
      cp."dataAjuizamento",
      cp."lastSyncedAt",
      cp."latestMovementAt",
      cp."movementCount",
      (
        SELECT COUNT(*)
        FROM "CourtProcessSnapshot" cps
        WHERE cps."courtProcessId" = cp."id"
      ) AS "snapshotCount"
    FROM "CourtProcess" cp
    WHERE cp."caseId" = ${caseId}
    ORDER BY cp."updatedAt" DESC
  `;
}

export async function attachDatajudProcess(caseId: string, formData: FormData) {
  const caso = await getAccessibleCase(caseId);
  if (!caso) {
    throw new Error("Caso não encontrado");
  }

  const tribunal = String(formData.get("tribunal") || "").trim();
  const numeroProcesso = String(formData.get("numeroProcesso") || "").trim();

  let result;
  try {
    result = await lookupDatajudProcess({ tribunal, numeroProcesso });
  } catch (error) {
    if (error instanceof DatajudConfigError) {
      redirect(
        `/casos/${caseId}?error=${encodeURIComponent(
          "Integração DataJud não configurada neste ambiente. Configure DATAJUD_API_KEY para vincular processos automaticamente.",
        )}`,
      );
    }
    if (error instanceof DatajudInputError) {
      redirect(`/casos/${caseId}?error=${encodeURIComponent(error.message)}`);
    }
    if (error instanceof DatajudUpstreamError) {
      const message =
        error.status === 504
          ? "O DataJud não respondeu a tempo. Tente novamente em instantes."
          : "O DataJud está indisponível no momento. Tente novamente em instantes.";
      redirect(`/casos/${caseId}?error=${encodeURIComponent(message)}`);
    }
    throw error;
  }
  const process = result.processos[0];

  if (!process) {
    throw new Error("O DataJud não retornou processo para os dados informados.");
  }

  const movements = process.movimentos ?? [];
  const latestMovementAt = latestDate(movements.map((movement) => movement.dataHora));

  await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "CourtProcess" (
        "id",
        "tribunal",
        "alias",
        "numeroProcesso",
        "classeCodigo",
        "classeNome",
        "orgaoJulgadorCodigo",
        "orgaoJulgadorNome",
        "grau",
        "nivelSigilo",
        "dataAjuizamento",
        "lastSyncedAt",
        "latestMovementAt",
        "movementCount",
        "createdAt",
        "updatedAt",
        "caseId"
      ) VALUES (
        gen_random_uuid()::text,
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        NOW(),
        $11,
        $12,
        NOW(),
        NOW(),
        $13
      )
      ON CONFLICT ("caseId", "tribunal", "numeroProcesso") DO UPDATE SET
        "alias" = EXCLUDED."alias",
        "classeCodigo" = EXCLUDED."classeCodigo",
        "classeNome" = EXCLUDED."classeNome",
        "orgaoJulgadorCodigo" = EXCLUDED."orgaoJulgadorCodigo",
        "orgaoJulgadorNome" = EXCLUDED."orgaoJulgadorNome",
        "grau" = EXCLUDED."grau",
        "nivelSigilo" = EXCLUDED."nivelSigilo",
        "dataAjuizamento" = EXCLUDED."dataAjuizamento",
        "lastSyncedAt" = EXCLUDED."lastSyncedAt",
        "latestMovementAt" = EXCLUDED."latestMovementAt",
        "movementCount" = EXCLUDED."movementCount",
        "updatedAt" = NOW()
      RETURNING "id"`,
      process.tribunal ?? result.tribunal,
      result.alias,
      process.numeroProcesso ?? result.numeroProcesso,
      process.classe?.codigo ?? null,
      process.classe?.nome ?? null,
      process.orgaoJulgador?.codigo ?? null,
      process.orgaoJulgador?.nome ?? null,
      process.grau ?? null,
      process.nivelSigilo ?? null,
      parseDate(process.dataAjuizamento),
      latestMovementAt,
      movements.length,
      caseId,
    );

    const courtProcessId = rows[0]?.id;
    if (!courtProcessId) {
      throw new Error("Falha ao vincular processo judicial");
    }

    await tx.$executeRawUnsafe(
      `INSERT INTO "CourtProcessSnapshot" (
        "id",
        "total",
        "timedOut",
        "tookMs",
        "payload",
        "courtProcessId"
      ) VALUES (
        gen_random_uuid()::text,
        $1,
        $2,
        $3,
        $4::jsonb,
        $5
      )`,
      result.total,
      result.timedOut,
      result.tookMs,
      JSON.stringify(result),
      courtProcessId,
    );

    for (const movement of movements) {
      const sourceRef = [
        result.tribunal,
        result.numeroProcesso,
        movement.codigo ?? "mov",
        movement.dataHora ?? "sem-data",
        movement.nome ?? "sem-nome",
      ].join(":");

      const description = [
        "[VALIDAR NOS AUTOS]",
        movement.nome ?? "Movimentação processual",
        movement.complementosTabelados?.length
          ? `(${movement.complementosTabelados
              .map((item) => item.nome)
              .filter(Boolean)
              .join("; ")})`
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      await tx.$executeRawUnsafe(
        `INSERT INTO "TimelineEvent" (
          "id",
          "occurredAt",
          "description",
          "certainty",
          "source",
          "sourceRef",
          "needsValidation",
          "createdAt",
          "caseId"
        )
        SELECT
          gen_random_uuid()::text,
          $1,
          $2,
          'COMPROVADO'::"FactCertainty",
          'DATAJUD',
          $3,
          true,
          NOW(),
          $4
        WHERE NOT EXISTS (
          SELECT 1
          FROM "TimelineEvent" te
          WHERE te."caseId" = $4
            AND te."source" = 'DATAJUD'
            AND te."sourceRef" = $3
        )`,
        parseDate(movement.dataHora),
        description,
        sourceRef,
        caseId,
      );
    }
  });

  revalidatePath(`/casos/${caseId}`);
}

export async function createCase(input: {
  title: string;
  clientName?: string;
  type: CaseType;
  domain: LegalDomain;
  summary?: string;
}) {
  const { workspaceId, actorId, workspaceKind } = await getActorContext();
  // Invariante de plano (spec 002): a conta mestre é control plane e não opera casos.
  if (workspaceKind === "MASTER") {
    throw new Error(
      "Conta mestre não opera casos. Entre em um escritório operacional para criar processos.",
    );
  }
  const clientName = input.clientName?.trim() || null;
  const displayClientName = clientName || "Cliente não informado";

  const created = await prisma.$transaction(async (tx) => {
    const clientRows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "Client" ("id", "name", "document", "createdAt", "updatedAt", "kind", "workspaceId")
       VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW(), 'PJ'::"PartyKind", $3)
       ON CONFLICT ("workspaceId", "document") DO UPDATE SET
         "name" = EXCLUDED."name",
         "updatedAt" = NOW()
       RETURNING "id"`,
      displayClientName,
      clientName,
      workspaceId,
    );

    const clientId = clientRows[0]?.id;
    if (!clientId) throw new Error("Falha ao criar cliente");

    const caseRows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "Case" ("id", "title", "clientName", "domain", "type", "summary", "createdAt", "updatedAt", "workspaceId", "ownerId", "clientId")
       VALUES (gen_random_uuid()::text, $1, $2, $3::"LegalDomain", $4::"CaseType", $5, NOW(), NOW(), $6, $7, $8)
       RETURNING "id"`,
      input.title,
      displayClientName,
      input.domain,
      input.type,
      input.summary || null,
      workspaceId,
      actorId,
      clientId,
    );

    const caseId = caseRows[0]?.id;
    if (!caseId) throw new Error("Falha ao criar caso");

    await tx.$executeRawUnsafe(
      `INSERT INTO "CaseMember" ("caseId", "userId", "createdAt")
       VALUES ($1, $2, NOW())
       ON CONFLICT ("caseId", "userId") DO NOTHING`,
      caseId,
      actorId,
    );

    return { id: caseId };
  });

  revalidatePath("/workspace");
  revalidatePath("/workspace/casos");
  redirect(`/casos/${created.id}`);
}

const DOMAINS = ["CIVIL", "TRABALHISTA", "PENAL", "CONSUMIDOR", "TRIBUTARIO", "FAMILIA"];
const TYPES = ["EXTRAJUDICIAL", "JUDICIAL_ATIVO", "JUDICIAL_PASSIVO", "CONSULTIVO"];
const STATUSES = ["TRIAGEM", "ANALISE", "ESTRATEGIA", "REDACAO", "CONCLUIDO", "ARQUIVADO"];

/* Adaptador FormData → createCase, chamado pela etapa 2 do wizard
   (/casos/novo/[area]). Valida no servidor e, em caso de erro, volta para o
   próprio passo com ?error= (mesmo padrão do loginAsEmail). Em caso de sucesso,
   a createCase redireciona para /casos/[id]. Não altera a createCase. */
export async function createCaseFromWizard(domain: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const clientName = String(formData.get("clientName") || "").trim();
  const type = String(formData.get("type") || "");
  const summary = String(formData.get("summary") || "").trim();

  const backTo = `/casos/novo/${domain.toLowerCase()}`;
  if (!DOMAINS.includes(domain)) {
    redirect(`${backTo}?error=${encodeURIComponent("Área inválida.")}`);
  }
  if (!title) {
    redirect(`${backTo}?error=${encodeURIComponent("Informe o título do caso.")}`);
  }
  if (!TYPES.includes(type)) {
    redirect(`${backTo}?error=${encodeURIComponent("Selecione o tipo do caso.")}`);
  }

  await createCase({
    title,
    clientName: clientName || undefined,
    type: type as CaseType,
    domain: domain as LegalDomain,
    summary: summary || undefined,
  });
}

export async function updateCase(id: string, formData: FormData) {
  const caso = await getAccessibleCase(id);
  if (!caso) throw new Error("Caso não encontrado");

  const title = String(formData.get("title") || "").trim();
  const clientName = String(formData.get("clientName") || "").trim();
  const domain = String(formData.get("domain") || "");
  const type = String(formData.get("type") || "");
  const status = String(formData.get("status") || "");
  const summary = String(formData.get("summary") || "").trim();

  if (!title) throw new Error("O título é obrigatório.");
  if (!DOMAINS.includes(domain)) throw new Error("Área inválida.");
  if (!TYPES.includes(type)) throw new Error("Tipo inválido.");
  if (!STATUSES.includes(status)) throw new Error("Status inválido.");

  // Regra anti-alucinação: o caso não avança para REDAÇÃO com lacunas pendentes.
  if (status === "REDACAO") {
    const pending = await prisma.$queryRawUnsafe<Array<{ n: bigint }>>(
      `SELECT COUNT(*)::bigint AS n FROM "Gap" WHERE "caseId" = $1 AND "resolved" = false`,
      id,
    );
    if (Number(pending[0]?.n ?? 0) > 0) {
      throw new Error(
        "Não é possível mover para Redação com lacunas pendentes. Resolva as lacunas primeiro.",
      );
    }
  }

  await prisma.$executeRawUnsafe(
    `UPDATE "Case"
       SET "title" = $1,
           "clientName" = $2,
           "domain" = $3::"LegalDomain",
           "type" = $4::"CaseType",
           "status" = $5::"CaseStatus",
           "summary" = $6,
           "updatedAt" = NOW()
     WHERE "id" = $7`,
    title,
    clientName || "Cliente não informado",
    domain,
    type,
    status,
    summary || null,
    id,
  );

  revalidatePath("/workspace");
  revalidatePath("/workspace/casos");
  revalidatePath(`/casos/${id}`);
  redirect(`/casos/${id}`);
}

export async function deleteCase(id: string) {
  const caso = await getAccessibleCase(id);
  if (!caso) throw new Error("Caso não encontrado");

  // FKs do Case são onDelete: Cascade, provas, timeline, lacunas etc. saem junto.
  await prisma.$executeRawUnsafe(`DELETE FROM "Case" WHERE "id" = $1`, id);

  revalidatePath("/workspace");
  revalidatePath("/workspace/casos");
  redirect("/workspace/casos");
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function latestDate(values: Array<string | undefined>) {
  const dates = values
    .map((value) => parseDate(value))
    .filter((value): value is Date => value instanceof Date);

  if (dates.length === 0) return null;

  return new Date(Math.max(...dates.map((date) => date.getTime())));
}
