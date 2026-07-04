-- JuriAI — patch incremental para configuração de IA por workspace.
-- Adiciona campos de provider/modelo ao Workspace sem recriar o banco.

ALTER TABLE "Workspace"
  ADD COLUMN IF NOT EXISTS "llmProvider" TEXT,
  ADD COLUMN IF NOT EXISTS "llmRegion" TEXT,
  ADD COLUMN IF NOT EXISTS "llmProjectId" TEXT,
  ADD COLUMN IF NOT EXISTS "llmModel" TEXT;
