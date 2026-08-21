"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession, clearImpersonator } from "@/lib/session";
import type { LegalDomain } from "@prisma/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ONBOARDING_DOMAINS = [
  "CIVIL",
  "TRABALHISTA",
  "PENAL",
  "CONSUMIDOR",
  "TRIBUTARIO",
  "FAMILIA",
] as const;

export type SignUpResult =
  | { ok: true; workspaceId: string }
  | { ok: false; message: string };

export async function registerClientTrial(formData: FormData): Promise<SignUpResult> {
  const firmName = String(formData.get("firmName") || "").trim();
  const adminName = String(formData.get("adminName") || "").trim();
  const adminEmail = String(formData.get("adminEmail") || "").trim().toLowerCase();
  const firmSize = String(formData.get("firmSize") || "2-5").trim();
  const deadlineControl = String(formData.get("deadlineControl") || "software").trim();
  const mainBottleneck = String(formData.get("mainBottleneck") || "Organização e montagem de dossiês").trim();

  const allowedDomains = new Set<string>(ONBOARDING_DOMAINS);
  const selectedDomains = formData
    .getAll("domains")
    .map((d) => String(d).trim().toUpperCase())
    .filter((d) => allowedDomains.has(d));
  
  const domains: LegalDomain[] = (selectedDomains.length > 0 ? selectedDomains : ["CIVIL"]) as LegalDomain[];
  const domainsArrayLiteral = `ARRAY[${domains.map((d) => `'${d}'`).join(",")}]::"LegalDomain"[]`;

  if (firmName.length < 2 || firmName.length > 120) {
    return { ok: false, message: "O nome do escritório deve ter entre 2 e 120 caracteres." };
  }
  if (adminName.length < 2 || adminName.length > 120) {
    return { ok: false, message: "Informe o nome do advogado responsável." };
  }
  if (!EMAIL_PATTERN.test(adminEmail)) {
    return { ok: false, message: "Informe um e-mail corporativo válido." };
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      // Check if user already exists
      const existing = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "User" WHERE LOWER("email") = ${adminEmail} LIMIT 1
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
          ${domainsArrayLiteral},
          'master-control-plane',
          $2, $3, $4,
          NOW(), NOW()
        ) RETURNING "id"`,
        firmName, firmSize, deadlineControl, mainBottleneck
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
        adminEmail, adminName, workspaceId
      );
      const userId = userRows[0]?.id;
      if (!userId) throw new Error("Falha ao criar credencial de acesso.");

      // Create Membership as OWNER
      await tx.$executeRawUnsafe(
        `INSERT INTO "Membership" ("workspaceId", "userId", "role", "createdAt", "updatedAt")
         VALUES ($1, $2, 'OWNER'::"MembershipRole", NOW(), NOW())`,
        workspaceId, userId
      );

      // Create Trial Workspace Subscription (30 days)
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
      message: error instanceof Error ? error.message : "Erro ao processar cadastro de trial.",
    };
  }
}
