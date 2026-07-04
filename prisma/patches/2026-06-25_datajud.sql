-- Patch incremental: DataJud / consulta processual.
-- Aplicar no banco existente sem destruir dados.

BEGIN;

ALTER TABLE "Case"
  ADD COLUMN IF NOT EXISTS "clientName" TEXT;

ALTER TABLE "TimelineEvent"
  ADD COLUMN IF NOT EXISTS "source" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceRef" TEXT,
  ADD COLUMN IF NOT EXISTS "needsValidation" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "TimelineEvent_caseId_source_sourceRef_idx"
  ON "TimelineEvent"("caseId", "source", "sourceRef");

CREATE TABLE IF NOT EXISTS "CourtProcess" (
  "id"                  TEXT PRIMARY KEY,
  "tribunal"            TEXT NOT NULL,
  "alias"               TEXT NOT NULL,
  "numeroProcesso"      TEXT NOT NULL,
  "classeCodigo"        INTEGER,
  "classeNome"          TEXT,
  "orgaoJulgadorCodigo" INTEGER,
  "orgaoJulgadorNome"   TEXT,
  "grau"                TEXT,
  "nivelSigilo"         INTEGER,
  "dataAjuizamento"     TIMESTAMP(3),
  "lastSyncedAt"        TIMESTAMP(3),
  "latestMovementAt"    TIMESTAMP(3),
  "movementCount"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL,
  "caseId"              TEXT NOT NULL,
  CONSTRAINT "CourtProcess_caseId_fkey"
    FOREIGN KEY ("caseId") REFERENCES "Case"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CourtProcess_caseId_idx"
  ON "CourtProcess"("caseId");

CREATE UNIQUE INDEX IF NOT EXISTS "CourtProcess_caseId_tribunal_numeroProcesso_key"
  ON "CourtProcess"("caseId", "tribunal", "numeroProcesso");

CREATE TABLE IF NOT EXISTS "CourtProcessSnapshot" (
  "id"             TEXT PRIMARY KEY,
  "fetchedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "total"          INTEGER NOT NULL,
  "timedOut"       BOOLEAN NOT NULL DEFAULT false,
  "tookMs"         INTEGER,
  "payload"        JSONB NOT NULL,
  "courtProcessId" TEXT NOT NULL,
  CONSTRAINT "CourtProcessSnapshot_courtProcessId_fkey"
    FOREIGN KEY ("courtProcessId") REFERENCES "CourtProcess"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CourtProcessSnapshot_courtProcessId_idx"
  ON "CourtProcessSnapshot"("courtProcessId");

COMMIT;
