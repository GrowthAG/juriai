import { NextRequest, NextResponse } from "next/server";
import { getAccessibleCase } from "@/lib/access";
import { processIngestionJob } from "@/lib/ingestion";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return NextResponse.json(
      { error: "Sessão expirada ou inexistente." },
      { status: 401 },
    );
  }

  const { id: jobId } = await context.params;

  // Isolamento de tenant: o job só pode ser processado por quem já tem
  // acesso ao caso dono dele (mesmo padrão de app/api/cases/[id]/evidence).
  const job = await prisma.ingestionJob.findUnique({
    where: { id: jobId },
    select: { caseId: true },
  });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const caso = await getAccessibleCase(job.caseId);
  if (!caso) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const result = await processIngestionJob(jobId);

  if (!result.ok) {
    if (!result.caseId) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.redirect(new URL(`/casos/${result.caseId}`, request.url), 303);
  }
  return NextResponse.redirect(new URL(`/casos/${result.caseId}`, request.url), 303);
}
