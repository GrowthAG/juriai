import { NextResponse } from "next/server";
import { getAccessibleCase } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { readStoredUpload } from "@/lib/uploads";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) return notFound();

  const { id } = await context.params;
  const evidence = await prisma.evidence.findUnique({
    where: { id },
    select: {
      caseId: true,
      label: true,
      mimeType: true,
      storagePath: true,
      scanStatus: true,
      ingestionJob: { select: { sourceFileName: true } },
    },
  });

  if (!evidence?.storagePath || evidence.scanStatus !== "CLEAN") {
    return notFound();
  }

  const caso = await getAccessibleCase(evidence.caseId);
  if (!caso) return notFound();

  let body: Buffer;
  try {
    body = await readStoredUpload(evidence.storagePath);
  } catch (error) {
    console.error("[JuriAI evidence download] arquivo indisponível", {
      evidenceId: id,
      error,
    });
    return notFound();
  }

  const originalName = evidence.ingestionJob?.sourceFileName || evidence.label;
  const filename = safeFilename(originalName);

  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      "Content-Type": evidence.mimeType || "application/octet-stream",
      "Content-Disposition": contentDisposition(filename),
      "Cache-Control": "private, no-store",
      "Content-Length": String(body.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function notFound() {
  return NextResponse.json({ error: "Prova não encontrada" }, { status: 404 });
}

function safeFilename(value: string) {
  const normalized = value
    .replace(/[\r\n]/g, " ")
    .replace(/[\\/]+/g, "-")
    .trim()
    .slice(0, 180);
  return normalized || "prova";
}

function contentDisposition(filename: string) {
  const ascii = filename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "prova";

  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
