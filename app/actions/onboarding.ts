"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import type { LegalDomain } from "@prisma/client";

const ONBOARDING_DOMAINS = [
  "CIVIL",
  "TRABALHISTA",
  "PENAL",
  "CONSUMIDOR",
  "TRIBUTARIO",
  "FAMILIA",
] as const;

export type OnboardingResult =
  | { ok: true }
  | { ok: false; message: string };

export async function completeOnboarding(formData: FormData): Promise<OnboardingResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, message: "Sessão não autenticada." };
  }

  const firmName = String(formData.get("firmName") || "").trim();
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

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { workspaceId: true },
    });

    if (!user?.workspaceId) {
      return { ok: false, message: "Workspace não encontrado." };
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "Workspace" 
       SET "name" = $1, "activeDomains" = ${domainsArrayLiteral}, "updatedAt" = NOW() 
       WHERE "id" = $2`,
      firmName,
      user.workspaceId
    );

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Erro ao atualizar dados do escritório.",
    };
  }
}
