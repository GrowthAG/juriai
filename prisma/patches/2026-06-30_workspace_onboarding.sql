-- Patch incremental: identidade visual e qualificação do escritório.
-- Aplicar no banco existente sem destruir dados.

BEGIN;

ALTER TABLE "Workspace"
  ADD COLUMN IF NOT EXISTS "brandPrimaryColor" TEXT,
  ADD COLUMN IF NOT EXISTS "brandSecondaryColor" TEXT,
  ADD COLUMN IF NOT EXISTS "logoPath" TEXT,
  ADD COLUMN IF NOT EXISTS "letterheadPath" TEXT,
  ADD COLUMN IF NOT EXISTS "firmSize" TEXT,
  ADD COLUMN IF NOT EXISTS "deadlineControl" TEXT,
  ADD COLUMN IF NOT EXISTS "mainBottleneck" TEXT;

COMMIT;
