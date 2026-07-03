"use server";

import { revalidatePath } from "next/cache";
import { getAccessibleCase } from "@/lib/access";
import { analyzeCaseWithClaude, isLlmConfigured } from "@/lib/llm";
import { prisma } from "@/lib/prisma";
import { CASE_TYPE_LABEL, DOMAIN_LABEL } from "@/lib/case-labels";

// Mensagem única e segura para o client: nunca expõe provider, chave, modelo
// ou região. O detalhe técnico fica só no log do servidor.
const SAFE_ANALYSIS_ERROR =
  "Análise indisponível neste workspace. Verifique a configuração de IA ou tente novamente mais tarde.";

export async function analyzeCase(caseId: string) {
  if (!(await isLlmConfigured())) {
    throw new Error(SAFE_ANALYSIS_ERROR);
  }

  const caso = await getAccessibleCase(caseId);
  if (!caso) throw new Error("Caso não encontrado");

  const { result, model } = await analyzeCaseWithClaude({
    title: caso.title,
    domainLabel: DOMAIN_LABEL[caso.domain] ?? caso.domain,
    typeLabel: CASE_TYPE_LABEL[caso.type] ?? caso.type,
    summary: caso.summary,
    evidenceLabels: caso.evidence.map((e) => e.label),
  }).catch((error) => {
    console.error("[JuriAI analyzeCase] falha na análise", { caseId, error });
    throw new Error(SAFE_ANALYSIS_ERROR);
  });

  await prisma.$transaction(async (tx) => {
    // Limpa análises anteriores geradas por IA (re-análise idempotente).
    await tx.$executeRawUnsafe(
      `DELETE FROM "TimelineEvent" WHERE "caseId" = $1 AND "source" = 'IA'`,
      caseId,
    );

    for (const ev of result.timeline) {
      const certainty = ev.certainty === "COMPROVADO" ? "COMPROVADO" : "ALEGADO";
      await tx.$executeRawUnsafe(
        `INSERT INTO "TimelineEvent"
           ("id","occurredAt","description","certainty","source","needsValidation","createdAt","caseId")
         VALUES (gen_random_uuid()::text, NULL, $1, $2::"FactCertainty", 'IA', true, NOW(), $3)`,
        ev.description,
        certainty,
        caseId,
      );
    }

    for (const g of result.gaps) {
      await tx.$executeRawUnsafe(
        `INSERT INTO "Gap" ("id","type","description","resolved","createdAt","caseId")
         VALUES (gen_random_uuid()::text, $1::"GapType", $2, false, NOW(), $3)`,
        g.type,
        g.description,
        caseId,
      );
    }

    // Regra anti-alucinação #5: toda saída de IA cria um AuditEntry.
    await tx.$executeRawUnsafe(
      `INSERT INTO "AuditEntry"
         ("id","action","model","groundedOn","confidence","unresolvedGaps","createdAt","caseId","reviewedById")
       VALUES (gen_random_uuid()::text, 'ANALYZE'::"AuditAction", $1, $2::jsonb, $3::"AuditConfidence", $4::jsonb, NOW(), $5, NULL)`,
      model,
      JSON.stringify(result.groundedOn),
      result.confidence,
      JSON.stringify(result.unresolvedGaps),
      caseId,
    );

    // TRIAGEM → ANALISE (não força REDAÇÃO; isso exige revisão humana + gate de lacunas).
    await tx.$executeRawUnsafe(
      `UPDATE "Case" SET "status" = 'ANALISE'::"CaseStatus", "updatedAt" = NOW()
       WHERE "id" = $1 AND "status" = 'TRIAGEM'`,
      caseId,
    );
  });

  revalidatePath(`/casos/${caseId}`);
  revalidatePath("/workspace");
}
