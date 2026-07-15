import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAccessibleCase } from "@/lib/access";
import {
  EvidenceFileValidationError,
  validateEvidenceFile,
} from "@/lib/evidence-files";
import { enqueueIngestionJob } from "@/lib/ingestion-queue";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import {
  isMalwareScanningConfigured,
  removeStoredUpload,
  storeUpload,
} from "@/lib/uploads";

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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return uploadError(request, id, "Não foi possível ler o arquivo enviado.");
  }

  const file = formData.get("file");
  const label = String(formData.get("label") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!(file instanceof File)) {
    return uploadError(request, id, "Selecione um arquivo para a prova.");
  }

  if (!label) {
    return uploadError(request, id, "O título da prova é obrigatório.");
  }
  if (label.length > 160) {
    return uploadError(request, id, "O título deve ter até 160 caracteres.");
  }
  if (description.length > 2_000) {
    return uploadError(request, id, "A descrição deve ter até 2.000 caracteres.");
  }

  let mediaType: string;
  try {
    ({ mediaType } = await validateEvidenceFile(file));
  } catch (error) {
    if (error instanceof EvidenceFileValidationError) {
      return uploadError(request, id, error.message);
    }
    throw error;
  }

  const stored = await storeUpload(file, id);
  const ingestionJobId = randomUUID();
  const scanPending = isMalwareScanningConfigured();
  try {
    await prisma.$transaction(async (tx) => {
      const evidence = await tx.evidence.create({
        data: {
          label,
          description: description || null,
          storagePath: stored.storagePath,
          mimeType: mediaType,
          strength: "NAO_AVALIADA",
          scanStatus: scanPending ? "PENDING" : "CLEAN",
          scannedAt: scanPending ? null : new Date(),
          caseId: caso.id,
        },
      });

      await tx.ingestionJob.create({
        data: {
          id: ingestionJobId,
          status: "PENDENTE",
          sourceFileName: file.name || "arquivo",
          sourceMimeType: mediaType,
          storagePath: stored.storagePath,
          caseId: caso.id,
          evidenceId: evidence.id,
        },
      });
    });
  } catch (error) {
    await removeStoredUpload(stored.uploadPath);
    throw error;
  }

  let uploadState = "queued";
  try {
    const queued = await enqueueIngestionJob(ingestionJobId);
    if (queued.queued) uploadState = "processing";
  } catch (error) {
    // O arquivo e o job permanecem disponíveis para processamento manual.
    console.error("[JuriAI evidence upload] falha ao enfileirar ingestão", {
      caseId: caso.id,
      ingestionJobId,
      error,
    });
  }

  const target = new URL(`/casos/${id}`, request.url);
  target.searchParams.set("upload", uploadState);
  return NextResponse.redirect(target, 303);
}

function uploadError(request: NextRequest, caseId: string, message: string) {
  const target = new URL(`/casos/${caseId}`, request.url);
  target.searchParams.set("uploadError", message);
  return NextResponse.redirect(target, 303);
}
