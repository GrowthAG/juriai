import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAccessibleCase } from "@/lib/access";
import { processIngestionJob } from "@/lib/ingestion";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { storeUpload } from "@/lib/uploads";

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

  const { id } = await context.params;
  const caso = await getAccessibleCase(id);

  if (!caso) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const label = String(formData.get("label") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  }

  if (!label) {
    return NextResponse.json({ error: "Título da prova é obrigatório" }, {
      status: 400,
    });
  }

  const stored = await storeUpload(file, id);

  const evidence = await prisma.evidence.create({
    data: {
      label,
      description: description || null,
      storagePath: stored.storagePath,
      mimeType: file.type || null,
      strength: "NAO_AVALIADA",
      caseId: caso.id,
    },
  });

  const ingestionJobId = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "IngestionJob" (
      "id",
      "status",
      "sourceFileName",
      "sourceMimeType",
      "storagePath",
      "caseId",
      "evidenceId"
    ) VALUES (
      ${ingestionJobId},
      'PENDENTE',
      ${file.name || "arquivo"},
      ${file.type || null},
      ${stored.storagePath},
      ${caso.id},
      ${evidence.id}
    )
  `;

  await processIngestionJob(ingestionJobId);

  return NextResponse.redirect(new URL(`/casos/${id}`, request.url), 303);
}
