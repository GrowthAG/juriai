-- Fase 3: Monitoramento Juridico: Vincular Publicacao ao Caso
-- Cria a tabela LegalPublication (armazenamento próprio da publicação DJEN
-- validada por um humano). NÃO guarda o `raw` da fonte.
--
-- APLICAÇÃO PENDENTE POR SEGURANÇA: DATABASE_URL aponta para o Cloud SQL Proxy
-- (banco remoto). Aplicar manualmente só contra banco local/dev descartável:
--   npm run db:patch prisma/patches/2026-07-01_legal_publication.sql
-- Create-only e idempotente (IF NOT EXISTS): não altera tabelas existentes.

CREATE TABLE IF NOT EXISTS "LegalPublication" (
  "id"                   TEXT PRIMARY KEY,
  "source"               TEXT NOT NULL,
  "externalId"           TEXT NOT NULL,
  "sourceUrl"            TEXT NOT NULL,
  "tribunal"             TEXT NOT NULL,
  "numeroProcesso"       TEXT NOT NULL,
  "tipo"                 TEXT NOT NULL,
  "texto"                TEXT NOT NULL,
  "dataDisponibilizacao" TIMESTAMP(3),
  "dataPublicacao"       TIMESTAMP(3),
  "destinatarios"        JSONB NOT NULL,
  "advogados"            JSONB NOT NULL,
  "contentHash"          TEXT NOT NULL,
  "linkedById"           TEXT,
  "linkedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,
  "workspaceId"          TEXT NOT NULL,
  "caseId"               TEXT NOT NULL,
  CONSTRAINT "LegalPublication_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LegalPublication_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LegalPublication_linkedById_fkey" FOREIGN KEY ("linkedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "LegalPublication_workspaceId_source_externalId_key" ON "LegalPublication"("workspaceId", "source", "externalId");
CREATE INDEX IF NOT EXISTS "LegalPublication_workspaceId_numeroProcesso_idx" ON "LegalPublication"("workspaceId", "numeroProcesso");
CREATE INDEX IF NOT EXISTS "LegalPublication_caseId_idx" ON "LegalPublication"("caseId");
CREATE INDEX IF NOT EXISTS "LegalPublication_workspaceId_dataDisponibilizacao_idx" ON "LegalPublication"("workspaceId", "dataDisponibilizacao");
CREATE INDEX IF NOT EXISTS "LegalPublication_workspaceId_contentHash_idx" ON "LegalPublication"("workspaceId", "contentHash");
