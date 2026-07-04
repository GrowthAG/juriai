import { prisma } from "@/lib/prisma";

export type AuthUserLookup = {
  id: string;
  isSuperAdmin: boolean;
  workspaceKind: "MASTER" | "SUBCONTA";
};

// Resolve usuário existente por e-mail (nunca cria conta nova). Compartilhado
// entre o login de dev (loginAsEmail) e o callback de sign-in do Google, para
// manter a mesma política: só entra quem já foi convidado por um admin.
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

export function resolvePostLoginPath(
  user: Pick<AuthUserLookup, "isSuperAdmin" | "workspaceKind">,
): "/admin" | "/workspace" {
  return user.isSuperAdmin || user.workspaceKind === "MASTER"
    ? "/admin"
    : "/workspace";
}
