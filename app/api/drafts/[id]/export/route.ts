import { NextResponse } from "next/server";
import { getAccessibleCase } from "@/lib/access";
import { renderDraftPdf } from "@/lib/pdf/draft-pdf";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Exporta uma minuta em PDF.
 * Segurança: a minuta só é servida se o caso pai passar por getAccessibleCase
 * (workspace do ator + papel/owner/CaseMember). Draft isolado sem caso acessível
 * retorna 404 — nunca vaza conteúdo cross-workspace.
 */
export async function GET(_request: Request, context: RouteContext) {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return NextResponse.json({ error: "Minuta não encontrada" }, { status: 404 });
  }

  const { id } = await context.params;
  const draftId = String(id || "").trim();
  if (!draftId) {
    return NextResponse.json({ error: "Minuta não encontrada" }, { status: 404 });
  }

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    select: {
      id: true,
      title: true,
      content: true,
      version: true,
      caseId: true,
    },
  });

  if (!draft) {
    return NextResponse.json({ error: "Minuta não encontrada" }, { status: 404 });
  }

  // Guard de caso/workspace — ponto crítico anti-vazamento.
  const caso = await getAccessibleCase(draft.caseId);
  if (!caso || caso.id !== draft.caseId) {
    return NextResponse.json({ error: "Minuta não encontrada" }, { status: 404 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: caso.workspaceId },
    select: { letterheadPath: true },
  });

  const pdf = await renderDraftPdf({
    title: draft.title,
    content: draft.content,
    caseTitle: caso.title,
    clientName: caso.clientName,
    letterheadPath: workspace?.letterheadPath ?? null,
  });

  const filename = buildPdfFilename(draft.title, draft.version);
  // Body precisa ser Buffer/Uint8Array copiado: Next Response aceita Uint8Array.
  const body = Buffer.from(pdf.bytes);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "Content-Length": String(body.byteLength),
    },
  });
}

function buildPdfFilename(title: string, version: number): string {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  const safe = base || "minuta";
  return `${safe}-v${version}.pdf`;
}
