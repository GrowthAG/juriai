import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import pg from "pg";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const email = String(process.argv[2] || "").trim().toLowerCase();
const name = String(process.argv[3] || "Administrador JuriAI").trim();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL ausente.");
  process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(
    "Uso: npm run db:bootstrap-admin -- admin@empresa.com \"Nome do admin\"",
  );
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
  query_timeout: 30_000,
});

await client.connect();

try {
  await client.query("BEGIN");

  const masterResult = await client.query(
    `SELECT "id" FROM "Workspace" WHERE "kind" = 'MASTER' ORDER BY "createdAt" LIMIT 1`,
  );
  let workspaceId = masterResult.rows[0]?.id;

  if (!workspaceId) {
    workspaceId = randomUUID();
    await client.query(
      `INSERT INTO "Workspace" (
        "id", "name", "kind", "activeDomains", "createdAt", "updatedAt"
      ) VALUES ($1, $2, 'MASTER', ARRAY[]::"LegalDomain"[], NOW(), NOW())`,
      [workspaceId, "JuriAI"],
    );
  }

  const existingUserResult = await client.query(
    `SELECT u."workspaceId", w."kind"
     FROM "User" u
     JOIN "Workspace" w ON w."id" = u."workspaceId"
     WHERE LOWER(u."email") = $1
     LIMIT 1`,
    [email],
  );
  const existingUser = existingUserResult.rows[0];
  if (existingUser && existingUser.workspaceId !== workspaceId) {
    throw new Error(
      "O e-mail já pertence a uma subconta. Use outro e-mail para o super-admin da conta mestre.",
    );
  }

  const userResult = await client.query(
    `INSERT INTO "User" (
      "id", "email", "name", "isSuperAdmin", "role",
      "workspaceId", "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, true, 'WORKSPACE_ADMIN', $4, NOW(), NOW())
    ON CONFLICT ("email") DO UPDATE SET
      "name" = EXCLUDED."name",
      "isSuperAdmin" = true,
      "role" = 'WORKSPACE_ADMIN',
      "updatedAt" = NOW()
    RETURNING "id", "workspaceId"`,
    [randomUUID(), email, name || "Administrador JuriAI", workspaceId],
  );

  const user = userResult.rows[0];
  await client.query(
    `INSERT INTO "Membership" (
      "workspaceId", "userId", "role", "createdAt", "updatedAt"
    ) VALUES ($1, $2, 'OWNER', NOW(), NOW())
    ON CONFLICT ("workspaceId", "userId") DO UPDATE SET
      "role" = 'OWNER',
      "updatedAt" = NOW()`,
    [user.workspaceId, user.id],
  );

  await client.query("COMMIT");
  console.log(`Super-admin pronto para login Google: ${email}`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
