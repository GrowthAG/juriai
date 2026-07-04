-- Patch incremental: painel admin, subcontas e planos Stripe.

BEGIN;

CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
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

CREATE TABLE IF NOT EXISTS "WorkspaceSubscription" (
  "id"                   TEXT PRIMARY KEY,
  "status"               TEXT NOT NULL DEFAULT 'trialing',
  "stripeCustomerId"     TEXT,
  "stripeSubscriptionId" TEXT,
  "currentPeriodEnd"     TIMESTAMP(3),
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,
  "workspaceId"          TEXT NOT NULL,
  "planId"               TEXT,
  CONSTRAINT "WorkspaceSubscription_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WorkspaceSubscription_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceSubscription_workspaceId_key"
  ON "WorkspaceSubscription"("workspaceId");

CREATE INDEX IF NOT EXISTS "WorkspaceSubscription_planId_idx"
  ON "WorkspaceSubscription"("planId");

COMMIT;
