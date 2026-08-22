"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession, clearImpersonator } from "@/lib/session";
import type { LegalDomain } from "@prisma/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignUpResult =
  | { ok: true; workspaceId: string }
  | { ok: false; message: string };

export async function registerClientAccount(formData: FormData): Promise<SignUpResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();

  if (name.length < 2 || name.length > 120) {
    return { ok: false, message: "Informe seu nome completo." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "Informe um e-mail corporativo válido." };
  }
  if (phone.length < 8) {
    return { ok: false, message: "Informe um número de WhatsApp ou telefone válido." };
  }

  const defaultFirmName = `Advocacia ${name}`;
  const contactInfo = `WhatsApp: ${phone}`;

  try {
    const created = await prisma.$transaction(async (tx) => {
      // Check if user already exists
      const existing = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "User" WHERE LOWER("email") = ${email} LIMIT 1
      `;
      if (existing.length > 0) {
        throw new Error("Este e-mail já possui cadastro. Faça login diretamente.");
      }

      // Create Workspace (SUBCONTA under master)
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
          '2-5', 'software', $2,
          NOW(), NOW()
        ) RETURNING "id"`,
        defaultFirmName, contactInfo
      );
      const workspaceId = wsRows[0]?.id;
      if (!workspaceId) throw new Error("Falha ao inicializar o escritório.");

      // Create User (WORKSPACE_ADMIN, isSuperAdmin: false)
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
        email, name, workspaceId
      );
      const userId = userRows[0]?.id;
      if (!userId) throw new Error("Falha ao criar credencial de acesso.");

      // Create Membership as OWNER
      await tx.$executeRawUnsafe(
        `INSERT INTO "Membership" ("workspaceId", "userId", "role", "createdAt", "updatedAt")
         VALUES ($1, $2, 'OWNER'::"MembershipRole", NOW(), NOW())`,
        workspaceId, userId
      );

      // Create Subscription
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

      return { workspaceId, userId };
    });

    // Automatically set the new user session
    await setSession(created.userId);
    await clearImpersonator();

    return { ok: true, workspaceId: created.workspaceId };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Erro ao processar criação de conta.",
    };
  }
}

