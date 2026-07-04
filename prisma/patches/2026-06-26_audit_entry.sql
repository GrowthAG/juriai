-- Patch incremental: trilha de auditoria para saídas de IA.
-- Aplicar no banco existente sem destruir dados.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditAction') THEN
    CREATE TYPE "AuditAction" AS ENUM (
      'ANALYZE',
      'GENERATE_DRAFT',
      'SUGGEST_STRATEGY',
      'EXTRACT_EVIDENCE'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditConfidence') THEN
    CREATE TYPE "AuditConfidence" AS ENUM ('ALTA', 'MEDIA', 'BAIXA');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "AuditEntry" (
  "id"             TEXT PRIMARY KEY,
  "action"         "AuditAction" NOT NULL,
  "model"          TEXT NOT NULL,
  "groundedOn"     JSONB NOT NULL,
  "confidence"     "AuditConfidence" NOT NULL,
  "unresolvedGaps" JSONB NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "caseId"         TEXT NOT NULL,
  "reviewedById"   TEXT,
  CONSTRAINT "AuditEntry_caseId_fkey"
    FOREIGN KEY ("caseId") REFERENCES "Case"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AuditEntry_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "User"("id")
    ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AuditEntry_caseId_idx"
  ON "AuditEntry"("caseId");

COMMIT;
