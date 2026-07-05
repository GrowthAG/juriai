"use server";

import { revalidatePath } from "next/cache";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId } from "@/lib/session";
import { getAccessibleCase, listAccessibleCases } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { normalizeProcessNumber } from "@/lib/datajud";
import {
  persistPublication,
  sanitizePublicationInput,
  type RawPublicationInput,
} from "@/lib/legal-monitoring/publications";

/* Fase 3: Vincular Publicação ao Caso.
 *
 * Molde arquitetural: attachDatajudProcess em app/actions/cases.ts.
 * A publicação é armazenada em LegalPublication (armazenamento próprio); o
 * TimelineEvent criado é apenas reflexo cronológico no caso.
 * Sem IA, sem Task, sem prazo. */

export type CaseLinkOption = {
  id: string;
  title: string;
  clientName: string;
  matchedByCnj: boolean;
};

export type LinkPublicationResult = {
  status: "created" | "duplicate";
  caseId: string;
};

// Mesma barreira da rota /api/monitoring/probe: monitoramento é admin-only.
async function requireMonitoringActor() {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    throw new Error("Sessão expirada ou inexistente.");
  }

  const context = await getActorContext();
  if (context.actorId !== sessionUserId) {
    throw new Error("Sessão inválida.");
  }

  if (!context.isSuperAdmin && context.workspaceRole !== "WORKSPACE_ADMIN") {
    throw new Error("Você não tem permissão para vincular publicações.");
  }

  return context;
}

/* Lista os casos aos quais a publicação pode ser vinculada. Se o CNJ estiver
 * presente, marca (matchedByCnj) os casos do workspace que já têm um
 * CourtProcess com o mesmo número normalizado, e os traz para o topo.
 * Só retorna casos acessíveis ao usuário (tenant + RBAC via listAccessibleCases). */
export async function getPublicationLinkTargets(
  numeroProcesso?: string,
): Promise<CaseLinkOption[]> {
  const context = await requireMonitoringActor();

  const cases = await listAccessibleCases();

  const digits = numeroProcesso ? normalizeProcessNumber(numeroProcesso) : "";
  let matched = new Set<string>();

  if (digits.length === 20) {
    const rows = await prisma.$queryRawUnsafe<Array<{ caseId: string }>>(
      `SELECT DISTINCT cp."caseId"
         FROM "CourtProcess" cp
         JOIN "Case" c ON c."id" = cp."caseId"
        WHERE c."workspaceId" = $1
          AND regexp_replace(cp."numeroProcesso", '[^0-9]', '', 'g') = $2`,
      context.workspaceId,
      digits,
    );
    matched = new Set(rows.map((r) => r.caseId));
  }

  return cases
    .map((c) => ({
      id: c.id,
      title: c.title,
      clientName: c.clientName,
      matchedByCnj: matched.has(c.id),
    }))
    .sort((a, b) => Number(b.matchedByCnj) - Number(a.matchedByCnj));
}

/* Vincula uma publicação validada pelo humano a um caso.
 * - workspaceId é recalculado a partir do caso (nunca vem do browser).
 * - payload passa por whitelist e o hash é recalculado no servidor.
 * - dedup forte por (workspaceId, source, externalId); o TimelineEvent
 *   deduplica por (caseId, source, sourceRef). */
export async function linkPublicationToCase(
  caseId: string,
  input: RawPublicationInput,
): Promise<LinkPublicationResult> {
  await requireMonitoringActor();

  const caso = await getAccessibleCase(caseId);
  if (!caso) {
    throw new Error("Caso não encontrado ou sem acesso.");
  }
  const workspaceId = caso.workspaceId; // recomputado no servidor

  const context = await getActorContext();
  const clean = sanitizePublicationInput(input);

  const { created } = await persistPublication(
    clean,
    caseId,
    workspaceId,
    context.actorId,
  );

  revalidatePath(`/casos/${caseId}`);
  revalidatePath("/workspace/monitoramento");

  return { status: created ? "created" : "duplicate", caseId };
}
