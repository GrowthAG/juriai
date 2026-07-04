"use server";

import { revalidatePath } from "next/cache";
import { getActorContext } from "@/lib/actor-context";
import { prisma } from "@/lib/prisma";

export type DashboardTask = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  caseId: string | null;
  caseTitle: string | null;
  assignedToName: string | null;
};

/** Tarefas abertas do escritório (não concluídas), com caso e responsável. */
export async function listOpenTasks(limit = 6): Promise<DashboardTask[]> {
  try {
    const ctx = await getActorContext();
    const rows = await prisma.$queryRaw<DashboardTask[]>`
      SELECT
        t."id",
        t."title",
        t."status"::text AS "status",
        t."dueDate",
        t."caseId",
        c."title" AS "caseTitle",
        COALESCE(u."name", u."email") AS "assignedToName"
      FROM "Task" t
      LEFT JOIN "Case" c ON c."id" = t."caseId"
      LEFT JOIN "User" u ON u."id" = t."assignedToId"
      WHERE t."workspaceId" = ${ctx.workspaceId}
        AND t."status" <> 'CONCLUIDA'
      ORDER BY
        t."dueDate" ASC NULLS LAST,
        t."createdAt" DESC
      LIMIT ${limit}
    `;
    return rows;
  } catch {
    return [];
  }
}

/** Contagem de tarefas abertas e de tarefas vencidas (prazo no passado). */
export async function countTasks(): Promise<{ open: number; overdue: number }> {
  try {
    const ctx = await getActorContext();
    const rows = await prisma.$queryRaw<Array<{ open: number; overdue: number }>>`
      SELECT
        COUNT(*) FILTER (WHERE t."status" <> 'CONCLUIDA')::int AS open,
        COUNT(*) FILTER (
          WHERE t."status" <> 'CONCLUIDA'
            AND t."dueDate" IS NOT NULL
            AND t."dueDate" < NOW()
        )::int AS overdue
      FROM "Task" t
      WHERE t."workspaceId" = ${ctx.workspaceId}
    `;
    return rows[0] ?? { open: 0, overdue: 0 };
  } catch {
    return { open: 0, overdue: 0 };
  }
}

/** Cria uma tarefa no escritório atual. caso e responsável são opcionais. */
export async function createTask(formData: FormData) {
  const ctx = await getActorContext();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const caseId = String(formData.get("caseId") ?? "").trim() || null;
  const assignedToId =
    String(formData.get("assignedToId") ?? "").trim() || null;
  const dueRaw = String(formData.get("dueDate") ?? "").trim();
  const dueDate = dueRaw ? new Date(dueRaw) : null;

  await prisma.task.create({
    data: {
      title,
      dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
      workspaceId: ctx.workspaceId,
      caseId,
      assignedToId,
      createdById: ctx.actorId,
    },
  });

  revalidatePath("/workspace");
}

/** Alterna uma tarefa entre CONCLUIDA e PENDENTE. */
export async function toggleTask(formData: FormData) {
  const ctx = await getActorContext();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const task = await prisma.task.findFirst({
    where: { id, workspaceId: ctx.workspaceId },
    select: { status: true },
  });
  if (!task) return;

  await prisma.task.update({
    where: { id },
    data: { status: task.status === "CONCLUIDA" ? "PENDENTE" : "CONCLUIDA" },
  });

  revalidatePath("/workspace");
}
