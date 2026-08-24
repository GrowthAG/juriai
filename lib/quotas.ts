import { prisma } from "@/lib/prisma";
import { getActorContext } from "@/lib/actor-context";

export type QuotaResource = "intel_searches" | "ai_drafts" | "djen_lookups" | "active_cases";

export const BETA_LIMITS: Record<QuotaResource, number> = {
  active_cases: 5,
  intel_searches: 30,
  ai_drafts: 20,
  djen_lookups: 15,
};

export const RESOURCE_NAMES: Record<QuotaResource, string> = {
  active_cases: "Casos ativos",
  intel_searches: "Consultas de inteligência e ativos",
  ai_drafts: "Minutas geradas por IA",
  djen_lookups: "Consultas ao Diário Oficial",
};

let tableInitialized = false;

async function ensureTable() {
  if (tableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "WorkspaceUsage" (
        "id" TEXT PRIMARY KEY,
        "workspaceId" TEXT NOT NULL,
        "resource" TEXT NOT NULL,
        "period" TEXT NOT NULL,
        "count" INTEGER NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_workspace_usage_lookup" ON "WorkspaceUsage" ("workspaceId", "resource", "period");
    `);
    tableInitialized = true;
  } catch (err) {
    console.warn("[Quotas] Tabela WorkspaceUsage ja inicializada ou aviso:", err);
    tableInitialized = true;
  }
}

function getPeriodKey(resource: QuotaResource): string {
  const now = new Date();
  if (resource === "djen_lookups") {
    // Periodo diario: YYYY-MM-DD
    return now.toISOString().split("T")[0];
  }
  // Periodo mensal: YYYY-MM
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getResourceUsage(workspaceId: string, resource: QuotaResource): Promise<number> {
  await ensureTable();

  if (resource === "active_cases") {
    const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(`
      SELECT COUNT(*) as count FROM "Case"
      WHERE "workspaceId" = $1 AND "status" != 'ARQUIVADO'
    `, workspaceId);
    return Number(rows[0]?.count || 0);
  }

  const period = getPeriodKey(resource);
  const id = `${workspaceId}_${resource}_${period}`;

  const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(`
    SELECT "count" FROM "WorkspaceUsage" WHERE "id" = $1 LIMIT 1
  `, id);

  return rows[0]?.count || 0;
}

export async function checkQuota(
  resource: QuotaResource,
  customWorkspaceId?: string
): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  resourceName: string;
  isUnlimited: boolean;
  message?: string;
}> {
  let workspaceId = customWorkspaceId;
  let isUnlimited = false;

  if (!workspaceId) {
    try {
      const ctx = await getActorContext();
      workspaceId = ctx.workspaceId;
      if (ctx.isSuperAdmin || ctx.workspaceKind === "MASTER") {
        isUnlimited = true;
      }
    } catch {
      // Fallback
    }
  }

  if (!workspaceId) {
    return {
      allowed: true,
      current: 0,
      limit: BETA_LIMITS[resource],
      resourceName: RESOURCE_NAMES[resource],
      isUnlimited: true,
    };
  }

  if (isUnlimited) {
    const current = await getResourceUsage(workspaceId, resource);
    return {
      allowed: true,
      current,
      limit: 999999,
      resourceName: RESOURCE_NAMES[resource],
      isUnlimited: true,
    };
  }

  const current = await getResourceUsage(workspaceId, resource);
  const limit = BETA_LIMITS[resource];
  const allowed = current < limit;

  let message: string | undefined;
  if (!allowed) {
    message = `Limite do Programa Pioneiro atingido (${current}/${limit} ${RESOURCE_NAMES[resource].toLowerCase()}). Para ampliar a capacidade da sua banca, contate seu consultor.`;
  }

  return {
    allowed,
    current,
    limit,
    resourceName: RESOURCE_NAMES[resource],
    isUnlimited: false,
    message,
  };
}

export async function incrementQuota(resource: QuotaResource, customWorkspaceId?: string): Promise<number> {
  if (resource === "active_cases") {
    // Casos ativos sao controlados pelo numero de linhas no banco
    return 0;
  }

  let workspaceId = customWorkspaceId;
  if (!workspaceId) {
    try {
      const ctx = await getActorContext();
      workspaceId = ctx.workspaceId;
    } catch {
      return 0;
    }
  }

  if (!workspaceId) return 0;

  await ensureTable();
  const period = getPeriodKey(resource);
  const id = `${workspaceId}_${resource}_${period}`;

  const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(`
    INSERT INTO "WorkspaceUsage" ("id", "workspaceId", "resource", "period", "count", "updatedAt")
    VALUES ($1, $2, $3, $4, 1, NOW())
    ON CONFLICT ("id") DO UPDATE SET
      "count" = "WorkspaceUsage"."count" + 1,
      "updatedAt" = NOW()
    RETURNING "count"
  `, id, workspaceId, resource, period);

  return rows[0]?.count || 1;
}
