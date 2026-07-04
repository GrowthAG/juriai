import type { CaseStatus, CaseType, LegalDomain } from "@prisma/client";
import { getActorContext } from "@/lib/actor-context";
import { prisma } from "@/lib/prisma";

type CaseListRow = {
  id: string;
  title: string;
  clientName: string | null;
  domain: LegalDomain;
  type: CaseType;
  status: CaseStatus;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  evidenceCount: bigint | number | null;
  gapsCount: bigint | number | null;
};

type CaseDetailRow = {
  id: string;
  title: string;
  clientName: string | null;
  domain: LegalDomain;
  type: CaseType;
  status: CaseStatus;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  workspaceId: string;
  clientId: string;
};

function canAccessAllCases(workspaceRole: string) {
  return workspaceRole === "WORKSPACE_ADMIN" || workspaceRole === "CASE_MANAGER";
}

function mapCaseListRow(row: CaseListRow) {
  return {
    id: row.id,
    title: row.title,
    clientName: row.clientName ?? "Cliente não informado",
    domain: row.domain,
    type: row.type,
    status: row.status,
    summary: row.summary,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ownerId: row.ownerId,
    _count: {
      evidence: Number(row.evidenceCount ?? 0),
      gaps: Number(row.gapsCount ?? 0),
    },
  };
}

export async function listAccessibleCases() {
  const context = await getActorContext();

  const queryAllCases = () =>
    prisma.$queryRaw<CaseListRow[]>`
      SELECT
        c."id",
        c."title",
        c."clientName",
        c."domain"::text AS "domain",
        c."type"::text AS "type",
        c."status"::text AS "status",
        c."summary",
        c."createdAt",
        c."updatedAt",
        c."ownerId",
        (
          SELECT COUNT(*)
          FROM "Evidence" e
          WHERE e."caseId" = c."id"
        ) AS "evidenceCount",
        (
          SELECT COUNT(*)
          FROM "Gap" g
          WHERE g."caseId" = c."id"
        ) AS "gapsCount"
      FROM "Case" c
      WHERE c."workspaceId" = ${context.workspaceId}
    `;

  const rows = canAccessAllCases(context.workspaceRole)
    ? await queryAllCases()
    : await prisma.$queryRaw<CaseListRow[]>`
        SELECT
          c."id",
          c."title",
          c."clientName",
          c."domain"::text AS "domain",
          c."type"::text AS "type",
          c."status"::text AS "status",
          c."summary",
          c."createdAt",
          c."updatedAt",
          c."ownerId",
          (
            SELECT COUNT(*)
            FROM "Evidence" e
            WHERE e."caseId" = c."id"
          ) AS "evidenceCount",
          (
            SELECT COUNT(*)
            FROM "Gap" g
            WHERE g."caseId" = c."id"
          ) AS "gapsCount"
        FROM "Case" c
        WHERE c."workspaceId" = ${context.workspaceId}
          AND (
            c."ownerId" = ${context.actorId}
            OR EXISTS (
              SELECT 1
              FROM "CaseMember" cm
              WHERE cm."caseId" = c."id"
                AND cm."userId" = ${context.actorId}
            )
          )
      `;

  return rows.map(mapCaseListRow);
}

export async function getAccessibleCase(id: string) {
  const context = await getActorContext();

  const rows = canAccessAllCases(context.workspaceRole)
    ? await prisma.$queryRaw<CaseDetailRow[]>`
        SELECT
          c."id",
          c."title",
          c."clientName",
          c."domain"::text AS "domain",
          c."type"::text AS "type",
          c."status"::text AS "status",
          c."summary",
          c."createdAt",
          c."updatedAt",
          c."ownerId",
          c."workspaceId",
          c."clientId"
        FROM "Case" c
        WHERE c."id" = ${id}
          AND c."workspaceId" = ${context.workspaceId}
        LIMIT 1
      `
    : await prisma.$queryRaw<CaseDetailRow[]>`
        SELECT
          c."id",
          c."title",
          c."clientName",
          c."domain"::text AS "domain",
          c."type"::text AS "type",
          c."status"::text AS "status",
          c."summary",
          c."createdAt",
          c."updatedAt",
          c."ownerId",
          c."workspaceId",
          c."clientId"
        FROM "Case" c
        WHERE c."id" = ${id}
          AND c."workspaceId" = ${context.workspaceId}
          AND (
            c."ownerId" = ${context.actorId}
            OR EXISTS (
              SELECT 1
              FROM "CaseMember" cm
              WHERE cm."caseId" = c."id"
                AND cm."userId" = ${context.actorId}
            )
          )
        LIMIT 1
      `;

  const row = rows[0];
  if (!row) return null;

  const [parties, evidence, timeline, gaps, drafts] = await Promise.all([
    prisma.party.findMany({
      where: { caseId: row.id },
      orderBy: { id: "asc" },
    }),
    prisma.evidence.findMany({
      where: { caseId: row.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.timelineEvent.findMany({
      where: { caseId: row.id },
      orderBy: { occurredAt: "asc" },
    }),
    prisma.gap.findMany({
      where: { caseId: row.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.draft.findMany({
      where: { caseId: row.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    ...row,
    client: { name: row.clientName ?? "Cliente não informado" },
    parties,
    evidence,
    timeline,
    gaps,
    drafts,
  };
}
