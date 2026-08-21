"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAccessibleCase } from "@/lib/access";
import { getActorContext } from "@/lib/actor-context";
import { prisma } from "@/lib/prisma";

export async function reviewAuditEntry(
  caseId: string,
  auditId: string,
  formData: FormData,
) {
  void formData;
  const caso = await getAccessibleCase(caseId);
  if (!caso) throw new Error("Caso não encontrado.");

  const actor = await getActorContext();
  await prisma.auditEntry.updateMany({
    where: {
      id: auditId,
      caseId: caso.id,
      reviewedById: null,
    },
    data: { reviewedById: actor.actorId },
  });

  revalidatePath(`/casos/${caseId}`);
  redirect(`/casos/${caseId}`);
}
