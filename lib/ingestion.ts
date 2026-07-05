import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/prisma";

function extractText(buffer: Buffer) {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  let nonPrintable = 0;

  for (const char of text) {
    const code = char.charCodeAt(0);
    const printable =
      code === 9 ||
      code === 10 ||
      code === 13 ||
      (code >= 32 && code <= 126) ||
      (code >= 160 && code <= 255);

    if (!printable) nonPrintable += 1;
  }

  const nonPrintableRatio = text.length === 0 ? 0 : nonPrintable / text.length;

  return nonPrintableRatio < 0.35 ? text : "";
}

function detectTimeline(text: string) {
  const pattern = /\b(\d{2}\/\d{2}\/\d{4})\b/g;
  const timeline: Array<{ occurredAt: string; description: string }> = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((line) => {
    const matches = [...line.matchAll(pattern)];
    matches.forEach((match) => {
      timeline.push({
        occurredAt: match[1],
        description: line.trim().slice(0, 180),
      });
    });
  });

  return timeline;
}

function detectGaps(text: string) {
  const gaps: Array<{
    type: "PERGUNTA_PENDENTE" | "PROVA_NECESSARIA" | "RISCO";
    description: string;
  }> = [];
  const lower = text.toLowerCase();

  if (!/(contrat|acordo|instrumento)/.test(lower)) {
    gaps.push({
      type: "PROVA_NECESSARIA",
      description: "Localizar o contrato ou documento base da relação jurídica.",
    });
  }

  if (!/(pagament|transfer|pix|boleto|nota fiscal)/.test(lower)) {
    gaps.push({
      type: "PROVA_NECESSARIA",
      description: "Confirmar comprovantes de pagamento ou inadimplemento.",
    });
  }

  if (!/(parte contr|contraparte|fornecedor|prestador|cliente)/.test(lower)) {
    gaps.push({
      type: "PERGUNTA_PENDENTE",
      description: "Identificar a contraparte formal indicada no documento.",
    });
  }

  return gaps;
}

function parseDateFromBrazilian(dateText: string) {
  const [day, month, year] = dateText.split("/");
  const parsed = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function processIngestionJob(jobId: string) {
  const jobs = await prisma.$queryRaw<
    Array<{
      id: string;
      status: string;
      sourceFileName: string;
      sourceMimeType: string | null;
      storagePath: string;
      extractionResult: unknown | null;
      error: string | null;
      caseId: string;
      clientName: string | null;
      clientKind: string | null;
      clientDocument: string | null;
    }>
  >`
    SELECT
      j."id",
      j."status"::text AS "status",
      j."sourceFileName",
      j."sourceMimeType",
      j."storagePath",
      j."extractionResult",
      j."error",
      j."caseId",
      c."clientName",
      cl."kind"::text AS "clientKind",
      cl."document" AS "clientDocument"
    FROM "IngestionJob" j
    JOIN "Case" c ON c."id" = j."caseId"
    LEFT JOIN "Client" cl ON cl."id" = c."clientId"
    WHERE j."id" = ${jobId}
    LIMIT 1
  `;

  const job = jobs[0];

  if (!job) {
    return { ok: false as const, error: "Job not found" };
  }

  if (job.status === "CONCLUIDO" && job.extractionResult) {
    return {
      ok: true as const,
      jobId: job.id,
      caseId: job.caseId,
      extractionResult: job.extractionResult,
    };
  }

  await prisma.$executeRaw`
    UPDATE "IngestionJob"
    SET "status" = 'PROCESSANDO',
        "updatedAt" = NOW()
    WHERE "id" = ${job.id}
  `;

  try {
    const buffer = await readFile(job.storagePath);
    const text = extractText(buffer);
    const timeline = text ? detectTimeline(text) : [];
    const gaps = text ? detectGaps(text) : [];
    const extractionResult = await prisma.$transaction(async (tx) => {
      const existingClientParty = await tx.party.findFirst({
        where: {
          caseId: job.caseId,
          role: "CLIENTE",
        },
      });

      const clientParty = existingClientParty
        ? await tx.party.update({
            where: { id: existingClientParty.id },
            data: {
              name: job.clientName ?? "Cliente não informado",
              kind: (job.clientKind as "PF" | "PJ" | null) ?? "PJ",
              document: job.clientDocument,
            },
          })
        : await tx.party.create({
            data: {
              name: job.clientName ?? "Cliente não informado",
              role: "CLIENTE",
              kind: (job.clientKind as "PF" | "PJ" | null) ?? "PJ",
              document: job.clientDocument,
              caseId: job.caseId,
            },
          });

      for (const item of timeline) {
        const occurredAt = parseDateFromBrazilian(item.occurredAt);
        await tx.timelineEvent.create({
          data: {
            caseId: job.caseId,
            occurredAt,
            description: item.description,
            certainty: "ALEGADO",
          },
        });
      }

      for (const gap of gaps) {
        await tx.gap.create({
          data: {
            caseId: job.caseId,
            type: gap.type,
            description: gap.description,
          },
        });
      }

      const result = {
        sourceFileName: job.sourceFileName,
        textExtracted: Boolean(text),
        parties: [
          {
            name: clientParty.name,
            role: clientParty.role,
            kind: clientParty.kind,
          },
        ],
        timelineEvents: timeline,
        suggestedGaps: gaps,
      };

      await tx.$executeRaw`
        UPDATE "IngestionJob"
        SET
          "status" = 'CONCLUIDO',
          "extractionResult" = ${JSON.stringify(result)}::jsonb,
          "error" = NULL,
          "updatedAt" = NOW()
        WHERE "id" = ${job.id}
      `;

      return result;
    });

    return { ok: true as const, jobId: job.id, caseId: job.caseId, extractionResult };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao processar arquivo";

    await prisma.$executeRaw`
      UPDATE "IngestionJob"
      SET
        "status" = 'FALHOU',
        "error" = ${message},
        "updatedAt" = NOW()
      WHERE "id" = ${job.id}
    `;

    return { ok: false as const, error: message, jobId: job.id, caseId: job.caseId };
  }
}
