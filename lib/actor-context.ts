import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { isDevBypassEnabled } from "@/lib/dev-bypass";
import type { MembershipRole, Role, WorkspaceKind } from "@prisma/client";

type ActorContext = {
  workspaceId: string;
  workspaceName: string;
  workspaceKind: WorkspaceKind;
  actorId: string;
  actorEmail: string;
  actorName: string;
  workspaceRole: Role;
  membershipRole: MembershipRole;
  isSuperAdmin: boolean;
};

const DEFAULT_CONTEXT: ActorContext | null =
  isDevBypassEnabled()
    ? {
        workspaceId: process.env.JURIAI_WORKSPACE_ID ?? "dev-workspace",
        workspaceName:
          process.env.JURIAI_WORKSPACE_NAME ?? "Escritório Dev",
        workspaceKind:
          (process.env.JURIAI_WORKSPACE_KIND as
            | WorkspaceKind
            | undefined) ?? "MASTER",
        actorId: process.env.JURIAI_ACTOR_ID ?? "dev-user",
        actorEmail: process.env.JURIAI_ACTOR_EMAIL ?? "dev@juriai.local",
        actorName: process.env.JURIAI_ACTOR_NAME ?? "Advogado(a)",
        workspaceRole:
          (process.env.JURIAI_WORKSPACE_ROLE as Role | undefined) ??
          "WORKSPACE_ADMIN",
        membershipRole:
          (process.env.JURIAI_MEMBERSHIP_ROLE as
            | MembershipRole
            | undefined) ?? "OWNER",
        isSuperAdmin: process.env.JURIAI_IS_SUPER_ADMIN
          ? process.env.JURIAI_IS_SUPER_ADMIN === "true"
          : true,
      }
    : null;

async function seedActorContext(context: ActorContext) {
  if (!isDevBypassEnabled()) {
    throw new Error(
      "Seed de contexto disponível apenas com bypass de dev explicitamente autorizado.",
    );
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO "Workspace" ("id", "name", "kind", "createdAt", "updatedAt", "activeDomains")
    VALUES (
      $1,
      $2,
      $3::"WorkspaceKind",
      NOW(),
      NOW(),
      ARRAY['CIVIL']::"LegalDomain"[]
    )
    ON CONFLICT ("id") DO UPDATE SET
      "name" = EXCLUDED."name",
      "kind" = EXCLUDED."kind",
      "updatedAt" = NOW()`,
    context.workspaceId,
    context.workspaceName,
    context.workspaceKind,
  );

  await prisma.$executeRawUnsafe(
    `INSERT INTO "User" ("id", "email", "name", "role", "isSuperAdmin", "createdAt", "updatedAt", "workspaceId")
     VALUES ($1, $2, $3, $4::"Role", $5, NOW(), NOW(), $6)
     ON CONFLICT ("id") DO UPDATE SET
       "email" = EXCLUDED."email",
       "name" = EXCLUDED."name",
       "role" = EXCLUDED."role",
       "isSuperAdmin" = EXCLUDED."isSuperAdmin",
       "workspaceId" = EXCLUDED."workspaceId",
       "updatedAt" = NOW()`,
    context.actorId,
    context.actorEmail,
    context.actorName,
    context.workspaceRole,
    context.isSuperAdmin,
    context.workspaceId,
  );

  await prisma.$executeRawUnsafe(
    `INSERT INTO "Membership" ("workspaceId", "userId", "role", "createdAt", "updatedAt")
     VALUES ($1, $2, $3::"MembershipRole", NOW(), NOW())
     ON CONFLICT ("workspaceId", "userId") DO UPDATE SET
       "role" = EXCLUDED."role",
       "updatedAt" = NOW()`,
    context.workspaceId,
    context.actorId,
    context.membershipRole,
  );
}

type SessionUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isSuperAdmin: boolean;
  workspaceId: string;
  workspaceName: string;
  workspaceKind: WorkspaceKind;
  membershipRole: MembershipRole | null;
};

async function loadContextForUser(userId: string): Promise<ActorContext | null> {
  const rows = await prisma.$queryRawUnsafe<SessionUserRow[]>(
    `SELECT
       u."id",
       u."email",
       u."name",
       u."role"            AS "role",
       u."isSuperAdmin",
       u."workspaceId",
       w."name"            AS "workspaceName",
       w."kind"            AS "workspaceKind",
       m."role"            AS "membershipRole"
     FROM "User" u
     JOIN "Workspace" w ON w."id" = u."workspaceId"
     LEFT JOIN "Membership" m
       ON m."userId" = u."id" AND m."workspaceId" = u."workspaceId"
     WHERE u."id" = $1
     LIMIT 1`,
    userId,
  );

  const row = rows[0];
  if (!row) return null;

  return {
    workspaceId: row.workspaceId,
    workspaceName: row.workspaceName,
    workspaceKind: row.workspaceKind,
    actorId: row.id,
    actorEmail: row.email,
    actorName: row.name ?? row.email,
    workspaceRole: row.role,
    membershipRole: row.membershipRole ?? "VIEWER",
    isSuperAdmin: row.isSuperAdmin,
  };
}

export async function getActorContext() {
  // Se há sessão válida, o contexto vem do usuário logado (RBAC real).
  const sessionUserId = await getSessionUserId();
  if (sessionUserId) {
    const sessionContext = await loadContextForUser(sessionUserId);
    if (sessionContext) return sessionContext;
  }

  if (DEFAULT_CONTEXT) {
    await seedActorContext(DEFAULT_CONTEXT);
    return DEFAULT_CONTEXT;
  }

  throw new Error("Sessão inválida ou ausente.");
}
