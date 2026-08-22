"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { storeUpload } from "@/lib/uploads";
import type { LegalDomain } from "@prisma/client";

const ONBOARDING_DOMAINS = [
  "CIVIL",
  "TRABALHISTA",
  "PENAL",
  "CONSUMIDOR",
  "TRIBUTARIO",
  "FAMILIA",
  "ADMINISTRATIVO",
] as const;

export type OnboardingResult =
  | { ok: true; warning?: string | null }
  | { ok: false; message: string };

export async function completeOnboarding(formData: FormData): Promise<OnboardingResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, message: "Sessão não autenticada." };
  }

  const firmName = String(formData.get("firmName") || "").trim();
  const firmSize = String(formData.get("firmSize") || "2-5").trim();
  const deadlineControl = String(formData.get("deadlineControl") || "software").trim();
  const mainBottleneck = String(formData.get("mainBottleneck") || "").trim();
  const brandPrimaryColor = String(formData.get("brandPrimaryColor") || "").trim() || null;
  const brandSecondaryColor = String(formData.get("brandSecondaryColor") || "").trim() || null;

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

    const workspaceId = user.workspaceId;

    // Handle optional file uploads
    let logoPath: string | null = null;
    let letterheadPath: string | null = null;
    const warnings: string[] = [];

    const logoFile = formData.get("logo") as File | null;
    if (logoFile && logoFile.size > 0) {
      try {
        const storedLogo = await storeUpload(logoFile, workspaceId);
        logoPath = storedLogo.storagePath;
      } catch (err) {
        console.error("Falha ao salvar logo do escritório", err);
        warnings.push("Não foi possível processar o arquivo de logo.");
      }
    }

    const letterheadFile = formData.get("letterhead") as File | null;
    if (letterheadFile && letterheadFile.size > 0) {
      try {
        const storedLetterhead = await storeUpload(letterheadFile, workspaceId);
        letterheadPath = storedLetterhead.storagePath;
      } catch (err) {
        console.error("Falha ao salvar papel timbrado", err);
        warnings.push("Não foi possível processar o papel timbrado.");
      }
    }

    // Dynamic update query
    const updates: string[] = [
      `"name" = $1`,
      `"activeDomains" = ${domainsArrayLiteral}`,
      `"firmSize" = $2`,
      `"deadlineControl" = $3`,
      `"mainBottleneck" = $4`,
      `"brandPrimaryColor" = $5`,
      `"brandSecondaryColor" = $6`,
      `"updatedAt" = NOW()`,
    ];
    const params: (string | null)[] = [
      firmName,
      firmSize,
      deadlineControl,
      mainBottleneck || "Organização e montagem de dossiês",
      brandPrimaryColor,
      brandSecondaryColor,
    ];

    if (logoPath) {
      params.push(logoPath);
      updates.push(`"logoPath" = $${params.length}`);
    }
    if (letterheadPath) {
      params.push(letterheadPath);
      updates.push(`"letterheadPath" = $${params.length}`);
    }

    params.push(workspaceId);
    await prisma.$executeRawUnsafe(
      `UPDATE "Workspace" 
       SET ${updates.join(", ")} 
       WHERE "id" = $${params.length}`,
      ...params
    );

    revalidatePath("/workspace");
    revalidatePath("/configuracoes");

    return { ok: true, warning: warnings.length > 0 ? warnings.join(" ") : null };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Erro ao atualizar dados do escritório.",
    };
  }
}
