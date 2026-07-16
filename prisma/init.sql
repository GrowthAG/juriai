-- JuriAI — DDL v6 (espelha prisma/schema.prisma v6).
-- Hierarquia de contas, RBAC, Super Admin, multi-área.
-- Aplicado via pg porque o schema-engine do Prisma trava neste ambiente.
-- CUIDADO: este script DESTROI todos os dados existentes.

BEGIN;

-- ── Limpar schema existente ───────────────────────────
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- ── Enums ──────────────────────────────────────────────
CREATE TYPE "LegalDomain" AS ENUM ('CIVIL','TRABALHISTA','PENAL','CONSUMIDOR','TRIBUTARIO','FAMILIA','ADMINISTRATIVO');
CREATE TYPE "WorkspaceKind" AS ENUM ('MASTER','SUBCONTA');
CREATE TYPE "Role" AS ENUM ('WORKSPACE_ADMIN','CASE_MANAGER','LIMITED_USER');
CREATE TYPE "MembershipRole" AS ENUM ('OWNER','LAWYER','INTERN','FINANCE','VIEWER');
CREATE TYPE "CaseStatus" AS ENUM ('TRIAGEM','ANALISE','ESTRATEGIA','REDACAO','CONCLUIDO','ARQUIVADO');
CREATE TYPE "CaseType" AS ENUM ('EXTRAJUDICIAL','JUDICIAL_ATIVO','JUDICIAL_PASSIVO','CONSULTIVO');
CREATE TYPE "PartyRole" AS ENUM ('CLIENTE','CONTRAPARTE','TERCEIRO');
CREATE TYPE "PartyKind" AS ENUM ('PF','PJ');
CREATE TYPE "EvidenceStrength" AS ENUM ('FORTE','MEDIA','FRACA','NAO_AVALIADA');
CREATE TYPE "MalwareScanStatus" AS ENUM ('PENDING','CLEAN','INFECTED','FAILED');
CREATE TYPE "FactCertainty" AS ENUM ('COMPROVADO','ALEGADO');
CREATE TYPE "GapType" AS ENUM ('PERGUNTA_PENDENTE','PROVA_NECESSARIA','RISCO');
CREATE TYPE "DraftType" AS ENUM ('NOTIFICACAO_EXTRAJUDICIAL','RESPOSTA_EXTRAJUDICIAL','PETICAO_INICIAL','CONTESTACAO','RECONVENCAO','ACORDO','PARECER','OUTRO');
CREATE TYPE "TemplateType" AS ENUM ('PROPOSTA','CONTRATO_SERVICOS','PROCURACAO','ONBOARDING_CASO');
CREATE TYPE "ProposalStatus" AS ENUM ('RASCUNHO','ENVIADA','ACEITA','REJEITADA');
CREATE TYPE "IngestionJobStatus" AS ENUM ('PENDENTE','PROCESSANDO','CONCLUIDO','FALHOU');
CREATE TYPE "AuditAction" AS ENUM ('ANALYZE','GENERATE_DRAFT','SUGGEST_STRATEGY','EXTRACT_EVIDENCE');
CREATE TYPE "AuditConfidence" AS ENUM ('ALTA','MEDIA','BAIXA');
CREATE TYPE "TaskStatus" AS ENUM ('PENDENTE','EM_ANDAMENTO','CONCLUIDA');

-- ── Workspace ─────────────────────────────────────────
CREATE TABLE "Workspace" (
  "id"                TEXT PRIMARY KEY,
  "name"              TEXT NOT NULL,
  "kind"              "WorkspaceKind" NOT NULL DEFAULT 'SUBCONTA',
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,
  "activeDomains"     "LegalDomain"[],
  "firmVoiceCorpus"   JSONB,
  "finetunedModelId"  TEXT,
  "llmProvider"       TEXT,
  "llmRegion"         TEXT,
  "llmProjectId"      TEXT,
  "llmModel"          TEXT,
  "brandPrimaryColor"   TEXT,
  "brandSecondaryColor" TEXT,
  "logoPath"            TEXT,
  "letterheadPath"      TEXT,
  "firmSize"            TEXT,
  "deadlineControl"     TEXT,
  "mainBottleneck"      TEXT,
  "parentWorkspaceId" TEXT,
  CONSTRAINT "Workspace_parentWorkspaceId_fkey" FOREIGN KEY ("parentWorkspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Workspace_parentWorkspaceId_name_key" ON "Workspace"("parentWorkspaceId", "name");

-- ── User ──────────────────────────────────────────────
CREATE TABLE "User" (
  "id"           TEXT PRIMARY KEY,
  "email"        TEXT NOT NULL,
  "name"         TEXT,
  "oab"          TEXT,
  "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
  "role"         "Role" NOT NULL DEFAULT 'LIMITED_USER',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  "workspaceId"  TEXT NOT NULL,
  CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_workspaceId_idx" ON "User"("workspaceId");

-- ── Membership ────────────────────────────────────────
CREATE TABLE "Membership" (
  "workspaceId" TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "role"        "MembershipRole" NOT NULL DEFAULT 'VIEWER',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("workspaceId", "userId")
);
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- ── Client ────────────────────────────────────────────
CREATE TABLE "Client" (
  "id"          TEXT PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "document"    TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "kind"        "PartyKind" NOT NULL DEFAULT 'PJ',
  "email"       TEXT,
  "phone"       TEXT,
  "address"     TEXT,
  "workspaceId" TEXT NOT NULL,
  CONSTRAINT "Client_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Client_workspaceId_idx" ON "Client"("workspaceId");
CREATE UNIQUE INDEX "Client_workspaceId_document_key" ON "Client"("workspaceId", "document");

-- ── ClientUser (Portal do Cliente) ────────────────────
CREATE TABLE "ClientUser" (
  "id"        TEXT PRIMARY KEY,
  "email"     TEXT NOT NULL,
  "name"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "clientId"  TEXT NOT NULL,
  CONSTRAINT "ClientUser_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ClientUser_email_key" ON "ClientUser"("email");
CREATE INDEX "ClientUser_clientId_idx" ON "ClientUser"("clientId");

-- ── Case ──────────────────────────────────────────────
CREATE TABLE "Case" (
  "id"          TEXT PRIMARY KEY,
  "title"       TEXT NOT NULL,
  "clientName"  TEXT,
  "domain"      "LegalDomain" NOT NULL,
  "type"        "CaseType" NOT NULL DEFAULT 'EXTRAJUDICIAL',
  "status"      "CaseStatus" NOT NULL DEFAULT 'TRIAGEM',
  "summary"     TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "ownerId"     TEXT NOT NULL,
  "clientId"    TEXT NOT NULL,
  CONSTRAINT "Case_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Case_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
CREATE INDEX "Case_workspaceId_clientId_idx" ON "Case"("workspaceId", "clientId");
CREATE INDEX "Case_ownerId_idx" ON "Case"("ownerId");

-- ── CaseMember (permissões por caso) ──────────────────
CREATE TABLE "CaseMember" (
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "caseId"    TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  CONSTRAINT "CaseMember_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CaseMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("caseId", "userId")
);
CREATE INDEX "CaseMember_userId_idx" ON "CaseMember"("userId");

-- ── Template ──────────────────────────────────────────
CREATE TABLE "Template" (
  "id"          TEXT PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "type"        "TemplateType" NOT NULL,
  "content"     TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  "workspaceId" TEXT NOT NULL,
  CONSTRAINT "Template_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Template_workspaceId_idx" ON "Template"("workspaceId");

-- ── Proposal ──────────────────────────────────────────
CREATE TABLE "Proposal" (
  "id"                  TEXT PRIMARY KEY,
  "title"               TEXT NOT NULL,
  "status"              "ProposalStatus" NOT NULL DEFAULT 'RASCUNHO',
  "value"               DECIMAL NOT NULL,
  "scope"               TEXT NOT NULL,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL,
  "workspaceId"         TEXT NOT NULL,
  "clientId"            TEXT NOT NULL,
  "generatedContractId" TEXT,
  CONSTRAINT "Proposal_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Proposal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Proposal_generatedContractId_key" ON "Proposal"("generatedContractId");
CREATE INDEX "Proposal_workspaceId_clientId_idx" ON "Proposal"("workspaceId", "clientId");

-- ── ServiceContract ───────────────────────────────────
CREATE TABLE "ServiceContract" (
  "id"             TEXT PRIMARY KEY,
  "title"          TEXT NOT NULL,
  "value"          DECIMAL NOT NULL,
  "paymentMethod"  TEXT NOT NULL,
  "signedAt"       TIMESTAMP(3),
  "filePath"       TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,
  "workspaceId"    TEXT NOT NULL,
  "clientId"       TEXT NOT NULL,
  "fromProposalId" TEXT,
  CONSTRAINT "ServiceContract_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ServiceContract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT "ServiceContract_fromProposalId_fkey" FOREIGN KEY ("fromProposalId") REFERENCES "Proposal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX "ServiceContract_fromProposalId_key" ON "ServiceContract"("fromProposalId");
CREATE INDEX "ServiceContract_workspaceId_clientId_idx" ON "ServiceContract"("workspaceId", "clientId");

-- ── SubscriptionPlan ──────────────────────────────────
CREATE TABLE "SubscriptionPlan" (
  "id"                   TEXT PRIMARY KEY,
  "name"                 TEXT NOT NULL,
  "description"          TEXT,
  "currency"             TEXT NOT NULL DEFAULT 'brl',
  "monthlyPriceCents"    INTEGER NOT NULL,
  "yearlyPriceCents"     INTEGER,
  "maxWorkspaces"        INTEGER,
  "maxUsers"             INTEGER,
  "maxCases"             INTEGER,
  "active"               BOOLEAN NOT NULL DEFAULT true,
  "stripeProductId"      TEXT,
  "stripeMonthlyPriceId" TEXT,
  "stripeYearlyPriceId"  TEXT,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL
);

-- ── WorkspaceSubscription ─────────────────────────────
CREATE TABLE "WorkspaceSubscription" (
  "id"                   TEXT PRIMARY KEY,
  "status"               TEXT NOT NULL DEFAULT 'trialing',
  "stripeCustomerId"     TEXT,
  "stripeSubscriptionId" TEXT,
  "currentPeriodEnd"     TIMESTAMP(3),
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,
  "workspaceId"          TEXT NOT NULL,
  "planId"               TEXT,
  CONSTRAINT "WorkspaceSubscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WorkspaceSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "WorkspaceSubscription_workspaceId_key" ON "WorkspaceSubscription"("workspaceId");
CREATE INDEX "WorkspaceSubscription_planId_idx" ON "WorkspaceSubscription"("planId");

-- ── Party ─────────────────────────────────────────────
CREATE TABLE "Party" (
  "id"       TEXT PRIMARY KEY,
  "name"     TEXT NOT NULL,
  "role"     "PartyRole" NOT NULL,
  "kind"     "PartyKind" NOT NULL DEFAULT 'PJ',
  "document" TEXT,
  "notes"    TEXT,
  "caseId"   TEXT NOT NULL,
  CONSTRAINT "Party_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Party_caseId_idx" ON "Party"("caseId");

-- ── Evidence ──────────────────────────────────────────
CREATE TABLE "Evidence" (
  "id"                 TEXT PRIMARY KEY,
  "label"              TEXT NOT NULL,
  "description"        TEXT,
  "storagePath"        TEXT,
  "mimeType"           TEXT,
  "strength"           "EvidenceStrength" NOT NULL DEFAULT 'NAO_AVALIADA',
  "analysis"           TEXT,
  "scanStatus"         "MalwareScanStatus" NOT NULL DEFAULT 'PENDING',
  "scanMessage"        TEXT,
  "scannedAt"          TIMESTAMP(3),
  "isSharedWithClient" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "caseId"             TEXT NOT NULL,
  CONSTRAINT "Evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Evidence_caseId_idx" ON "Evidence"("caseId");

-- ── IngestionJob ──────────────────────────────────────
CREATE TABLE "IngestionJob" (
  "id"               TEXT PRIMARY KEY,
  "status"           "IngestionJobStatus" NOT NULL DEFAULT 'PENDENTE',
  "sourceFileName"   TEXT NOT NULL,
  "sourceMimeType"   TEXT,
  "storagePath"      TEXT NOT NULL,
  "extractionResult" JSONB,
  "error"            TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,
  "caseId"           TEXT NOT NULL,
  "evidenceId"       TEXT UNIQUE,
  CONSTRAINT "IngestionJob_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "IngestionJob_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "IngestionJob_caseId_idx" ON "IngestionJob"("caseId");

-- ── TimelineEvent ─────────────────────────────────────
CREATE TABLE "TimelineEvent" (
  "id"                 TEXT PRIMARY KEY,
  "occurredAt"         TIMESTAMP(3),
  "description"        TEXT NOT NULL,
  "certainty"          "FactCertainty" NOT NULL DEFAULT 'ALEGADO',
  "source"             TEXT,
  "sourceRef"          TEXT,
  "needsValidation"    BOOLEAN NOT NULL DEFAULT false,
  "isSharedWithClient" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "caseId"             TEXT NOT NULL,
  CONSTRAINT "TimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "TimelineEvent_caseId_idx" ON "TimelineEvent"("caseId");
CREATE INDEX "TimelineEvent_caseId_source_sourceRef_idx" ON "TimelineEvent"("caseId", "source", "sourceRef");

-- ── CourtProcess (DataJud / metadados oficiais) ──────
CREATE TABLE "CourtProcess" (
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
  CONSTRAINT "CourtProcess_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CourtProcess_caseId_idx" ON "CourtProcess"("caseId");
CREATE UNIQUE INDEX "CourtProcess_caseId_tribunal_numeroProcesso_key" ON "CourtProcess"("caseId", "tribunal", "numeroProcesso");

-- ── CourtProcessSnapshot (resposta bruta DataJud) ─────
CREATE TABLE "CourtProcessSnapshot" (
  "id"             TEXT PRIMARY KEY,
  "fetchedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "total"          INTEGER NOT NULL,
  "timedOut"       BOOLEAN NOT NULL DEFAULT false,
  "tookMs"         INTEGER,
  "payload"        JSONB NOT NULL,
  "courtProcessId" TEXT NOT NULL,
  CONSTRAINT "CourtProcessSnapshot_courtProcessId_fkey" FOREIGN KEY ("courtProcessId") REFERENCES "CourtProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CourtProcessSnapshot_courtProcessId_idx" ON "CourtProcessSnapshot"("courtProcessId");

-- ── LegalPublication (publicação/intimação DJEN vinculada — Fase 3) ──
CREATE TABLE "LegalPublication" (
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
CREATE UNIQUE INDEX "LegalPublication_workspaceId_source_externalId_key" ON "LegalPublication"("workspaceId", "source", "externalId");
CREATE INDEX "LegalPublication_workspaceId_numeroProcesso_idx" ON "LegalPublication"("workspaceId", "numeroProcesso");
CREATE INDEX "LegalPublication_caseId_idx" ON "LegalPublication"("caseId");
CREATE INDEX "LegalPublication_workspaceId_dataDisponibilizacao_idx" ON "LegalPublication"("workspaceId", "dataDisponibilizacao");
CREATE INDEX "LegalPublication_workspaceId_contentHash_idx" ON "LegalPublication"("workspaceId", "contentHash");

-- ── Gap ───────────────────────────────────────────────
CREATE TABLE "Gap" (
  "id"          TEXT PRIMARY KEY,
  "type"        "GapType" NOT NULL,
  "description" TEXT NOT NULL,
  "resolved"    BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "caseId"      TEXT NOT NULL,
  CONSTRAINT "Gap_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Gap_caseId_idx" ON "Gap"("caseId");

-- ── AuditEntry (rastreabilidade de saída de IA — anti-alucinação) ──
CREATE TABLE "AuditEntry" (
  "id"             TEXT PRIMARY KEY,
  "action"         "AuditAction" NOT NULL,
  "model"          TEXT NOT NULL,
  "groundedOn"     JSONB NOT NULL,
  "confidence"     "AuditConfidence" NOT NULL,
  "unresolvedGaps" JSONB NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "caseId"         TEXT NOT NULL,
  "reviewedById"   TEXT,
  CONSTRAINT "AuditEntry_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AuditEntry_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
CREATE INDEX "AuditEntry_caseId_idx" ON "AuditEntry"("caseId");

-- ── Draft ─────────────────────────────────────────────
CREATE TABLE "Draft" (
  "id"                 TEXT PRIMARY KEY,
  "type"               "DraftType" NOT NULL DEFAULT 'OUTRO',
  "title"              TEXT NOT NULL,
  "version"            INTEGER NOT NULL DEFAULT 1,
  "content"            TEXT NOT NULL,
  "isSharedWithClient" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL,
  "caseId"             TEXT NOT NULL,
  CONSTRAINT "Draft_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Draft_caseId_idx" ON "Draft"("caseId");

-- ── ChatMessage ───────────────────────────────────────
CREATE TABLE "ChatMessage" (
  "id"        TEXT PRIMARY KEY,
  "role"      TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "caseId"    TEXT NOT NULL,
  CONSTRAINT "ChatMessage_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ChatMessage_caseId_idx" ON "ChatMessage"("caseId");

-- ── Task (tarefas/prazos do escritório) ───────────────
CREATE TABLE "Task" (
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
CREATE INDEX "Task_workspaceId_status_idx" ON "Task"("workspaceId", "status");
CREATE INDEX "Task_caseId_idx" ON "Task"("caseId");
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

COMMIT;
