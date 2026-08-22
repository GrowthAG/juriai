import { prisma } from "@/lib/prisma";

export type AuthUserLookup = {
  id: string;
  isSuperAdmin: boolean;
  workspaceKind: "MASTER" | "SUBCONTA";
  isNewUser?: boolean;
};

export async function findAuthUserByEmail(
  email: string,
): Promise<AuthUserLookup | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const rows = await prisma.$queryRaw<AuthUserLookup[]>`
    SELECT
      u."id",
      u."isSuperAdmin",
      w."kind" AS "workspaceKind"
    FROM "User" u
    JOIN "Workspace" w ON w."id" = u."workspaceId"
    WHERE LOWER(u."email") = ${normalized}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/**
 * Encontra o usuário existente ou cria automaticamente um novo Workspace (SUBCONTA)
 * e o usuário como WORKSPACE_ADMIN quando loga/cadastra via Google.
 */
export async function findOrCreateAuthUserByGoogle(user: {
  email?: string | null;
  name?: string | null;
}): Promise<AuthUserLookup | null> {
  const email = user.email?.trim().toLowerCase();
  if (!email) return null;

  // 1. Se já existe, retorna o usuário existente
  const existing = await findAuthUserByEmail(email);
  if (existing) return { ...existing, isNewUser: false };

  // 2. Se não existe, cria o Workspace e o Usuário como Admin do Escritório
  const firmName = user.name
    ? `Advocacia ${user.name}`
    : `Escritório ${email.split("@")[0]}`;

  return await prisma.$transaction(async (tx) => {
    // Cria Workspace Subconta
    const wsRows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "Workspace" (
        "id", "name", "kind", "activeDomains", "parentWorkspaceId",
        "firmSize", "deadlineControl", "mainBottleneck",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        $1,
        'SUBCONTA'::"WorkspaceKind",
        ARRAY['CIVIL', 'CONSUMIDOR']::"LegalDomain"[],
        'master-control-plane',
        '2-5', 'software', 'Organização de dossiês e prazos',
        NOW(), NOW()
      ) RETURNING "id"`,
      firmName
    );
    const workspaceId = wsRows[0]?.id;
    if (!workspaceId) throw new Error("Falha ao inicializar o workspace.");

    // Cria Usuário do Escritório
    const userRows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "User" (
        "id", "email", "name", "role", "isSuperAdmin",
        "workspaceId", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        $1, $2,
        'WORKSPACE_ADMIN'::"Role",
        false,
        $3, NOW(), NOW()
      ) RETURNING "id"`,
      email, user.name || email, workspaceId
    );
    const userId = userRows[0]?.id;
    if (!userId) throw new Error("Falha ao criar usuário.");

    // Cria Membership como OWNER
    await tx.$executeRawUnsafe(
      `INSERT INTO "Membership" ("workspaceId", "userId", "role", "createdAt", "updatedAt")
       VALUES ($1, $2, 'OWNER'::"MembershipRole", NOW(), NOW())`,
      workspaceId, userId
    );

    // Cria assinatura
    await tx.$executeRawUnsafe(
      `INSERT INTO "WorkspaceSubscription" (
        "id", "status", "workspaceId", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        'trialing',
        $1,
        NOW(), NOW()
      )`,
      workspaceId
    );

    return {
      id: userId,
      isSuperAdmin: false,
      workspaceKind: "SUBCONTA" as const,
      isNewUser: true,
    };
  });
}

export function resolvePostLoginPath(
  user: Pick<AuthUserLookup, "isSuperAdmin" | "workspaceKind" | "isNewUser">,
): "/admin" | "/workspace" | "/onboarding" {
  if (user.isSuperAdmin || user.workspaceKind === "MASTER") {
    return "/admin";
  }
  if (user.isNewUser) {
    return "/onboarding";
  }
  return "/workspace";
}
