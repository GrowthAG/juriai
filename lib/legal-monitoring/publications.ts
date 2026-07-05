import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

/* Fase 3: helpers de vínculo de publicação ao caso.
 *
 * O payload chega do browser (a Inbox de monitoramento é read-only e o item já
 * está no cliente). NÃO se confia nesse payload: aqui fazemos whitelist estrita
 * dos campos, cortamos o texto num teto seguro e recalculamos o hash. Nunca
 * guardamos o `raw` da fonte. */

// Teto de texto persistido. Publicações do DJEN cabem folgado; o corte é só uma
// barreira contra payload adulterado/gigante vindo do cliente.
export const MAX_TEXTO_LEN = 50_000;

// Fontes aceitas para persistência nesta fase.
const ALLOWED_SOURCES = new Set(["djen", "datajud"]);

// Formato de entrada, do jeito que o frontend serializa o item sanitizado.
export interface RawPublicationInput {
  source?: unknown;
  externalId?: unknown;
  sourceUrl?: unknown;
  tribunal?: unknown;
  numeroProcesso?: unknown;
  tipo?: unknown;
  texto?: unknown;
  dataDisponibilizacao?: unknown;
  dataPublicacao?: unknown;
  destinatarios?: unknown;
  advogados?: unknown;
}

// Formato limpo, pronto para persistência.
export interface CleanPublication {
  source: string;
  externalId: string;
  sourceUrl: string;
  tribunal: string;
  numeroProcesso: string;
  tipo: string;
  texto: string;
  dataDisponibilizacao: Date | null;
  dataPublicacao: Date | null;
  destinatarios: string[];
  advogados: string[];
  contentHash: string;
}

export class PublicationInputError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "PublicationInputError";
  }
}

function toStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStrArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0)
    .slice(0, 100); // teto defensivo
}

// Aceita "YYYY-MM-DD" (formato que o djen normaliza) ou ISO; devolve Date | null.
export function parsePublicationDate(value: unknown): Date | null {
  const str = toStr(value);
  if (!str) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(str) ? `${str}T00:00:00.000Z` : str;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Hash estável do conteúdo, calculado no servidor (fallback de dedup).
export function computeContentHash(input: {
  source: string;
  externalId: string;
  numeroProcesso: string;
  texto: string;
}): string {
  return createHash("sha256")
    .update(`${input.source}|${input.externalId}|${input.numeroProcesso}|${input.texto}`)
    .digest("hex");
}

export type PersistPublicationResult = {
  id: string;
  created: boolean;
};

/* Persiste a publicação validada e cria o reflexo cronológico no caso.
 * Tudo numa transação. Regras da Fase 3:
 * - dedup forte por (workspaceId, source, externalId);
 * - o TimelineEvent é só reflexo, com needsValidation=true e prefixo
 *   [VALIDAR NOS AUTOS] (o humano ainda precisa validar nos autos);
 * - nunca inventa data (occurredAt fica null se a fonte não trouxe);
 * - sem Task, sem prazo, sem IA. */
export async function persistPublication(
  clean: CleanPublication,
  caseId: string,
  workspaceId: string,
  userId: string,
): Promise<PersistPublicationResult> {
  const source = clean.source.toUpperCase();
  const sourceRef = clean.externalId;
  const tribunalPart = clean.tribunal ? ` (${clean.tribunal})` : "";
  const description = `[VALIDAR NOS AUTOS] Publicação ${source}: ${clean.tipo}${tribunalPart}`;
  const occurredAt = clean.dataPublicacao ?? clean.dataDisponibilizacao ?? null;

  return prisma.$transaction(async (tx) => {
    const previous = await tx.legalPublication.findUnique({
      where: {
        workspaceId_source_externalId: { workspaceId, source, externalId: sourceRef },
      },
      select: { id: true },
    });

    const pub = await tx.legalPublication.upsert({
      where: {
        workspaceId_source_externalId: { workspaceId, source, externalId: sourceRef },
      },
      update: {
        caseId,
        linkedById: userId,
        linkedAt: new Date(),
        contentHash: clean.contentHash,
      },
      create: {
        workspaceId,
        caseId,
        source,
        externalId: sourceRef,
        sourceUrl: clean.sourceUrl,
        tribunal: clean.tribunal,
        numeroProcesso: clean.numeroProcesso,
        tipo: clean.tipo,
        texto: clean.texto,
        dataDisponibilizacao: clean.dataDisponibilizacao,
        dataPublicacao: clean.dataPublicacao,
        destinatarios: clean.destinatarios,
        advogados: clean.advogados,
        contentHash: clean.contentHash,
        linkedById: userId,
      },
      select: { id: true },
    });

    // Reflexo cronológico no caso, dedup por (caseId, source, sourceRef).
    const existingEvent = await tx.timelineEvent.findFirst({
      where: { caseId, source, sourceRef },
      select: { id: true },
    });

    if (!existingEvent) {
      await tx.timelineEvent.create({
        data: {
          caseId,
          occurredAt,
          description,
          certainty: "COMPROVADO",
          source,
          sourceRef,
          needsValidation: true,
        },
      });
    }

    return { id: pub.id, created: previous === null };
  });
}

export async function listCaseOptions(
  workspaceId: string,
): Promise<Array<{ id: string; title: string }>> {
  return prisma.$queryRaw<Array<{ id: string; title: string }>>`
    SELECT "id", "title"
    FROM "Case"
    WHERE "workspaceId" = ${workspaceId}
      AND "status"::text NOT IN ('CONCLUIDO', 'ARQUIVADO')
    ORDER BY "updatedAt" DESC
    LIMIT 50
  `;
}

// Whitelist + validação mínima. Lança PublicationInputError se faltar o essencial.
export function sanitizePublicationInput(raw: RawPublicationInput): CleanPublication {
  const source = toStr(raw.source).toLowerCase();
  if (!ALLOWED_SOURCES.has(source)) {
    throw new PublicationInputError("Fonte inválida para vínculo de publicação.");
  }

  const externalId = toStr(raw.externalId);
  if (!externalId) {
    throw new PublicationInputError("Publicação sem identificador de origem (externalId).");
  }

  const numeroProcesso = toStr(raw.numeroProcesso);
  const texto = toStr(raw.texto).slice(0, MAX_TEXTO_LEN);

  const clean: Omit<CleanPublication, "contentHash"> = {
    source,
    externalId,
    sourceUrl: toStr(raw.sourceUrl),
    tribunal: toStr(raw.tribunal),
    numeroProcesso,
    tipo: toStr(raw.tipo) || "Publicação",
    texto,
    dataDisponibilizacao: parsePublicationDate(raw.dataDisponibilizacao),
    dataPublicacao: parsePublicationDate(raw.dataPublicacao),
    destinatarios: toStrArray(raw.destinatarios),
    advogados: toStrArray(raw.advogados),
  };

  return {
    ...clean,
    contentHash: computeContentHash({ source, externalId, numeroProcesso, texto }),
  };
}
