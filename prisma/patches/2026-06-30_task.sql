-- Patch: cria a tabela Task (tarefas/prazos do escritório). Idempotente.
DO $$ BEGIN
  CREATE TYPE "TaskStatus" AS ENUM ('PENDENTE','EM_ANDAMENTO','CONCLUIDA');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "Task" (
  "id"           TEXT PRIMARY KEY,
  "title"        TEXT NOT NULL,
  "description"  TEXT,
  "status"       "TaskStatus" NOT NULL DEFAULT 'PENDENTE',
  "dueDate"      TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  "workspaceId"  TEXT NOT NULL,
  "caseId"       TEXT,
  "assignedToId" TEXT,
  "createdById"  TEXT,
  CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Task_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Task_workspaceId_status_idx" ON "Task"("workspaceId", "status");
CREATE INDEX IF NOT EXISTS "Task_caseId_idx" ON "Task"("caseId");
CREATE INDEX IF NOT EXISTS "Task_assignedToId_idx" ON "Task"("assignedToId");
