import { readFile, stat } from "node:fs/promises";
import { extname } from "node:path";
import { prisma } from "@/lib/prisma";
import {
  extractDocumentFacts,
  type DocumentExtractionResult,
} from "@/lib/llm";
import { DOMAIN_LABEL } from "@/lib/case-labels";
import { getMalwareScanStorageState } from "@/lib/uploads";

// Teto de tamanho para mandar o arquivo ao modelo. Acima disso, cai para o
// caminho ingênuo (texto), para não estourar custo/limite da API.
const MAX_EXTRACTION_BYTES = 20 * 1024 * 1024;

// ── Caminho ingênuo (fallback) ───────────────────────────────────────────
// Mantido para arquivos que não dá para ler pelo modelo (muito grandes) ou
// quando a extração falha. Faz o melhor esforço com texto puro.

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
  const match = /(\d{2})\/(\d{2})\/(\d{4})/.exec(dateText);
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveMediaType(mimeType: string | null, fileName: string): string {
  const declared = mimeType?.trim().toLowerCase();
  if (declared) return declared;

  const ext = extname(fileName).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".txt") return "text/plain";
  if (ext === ".md") return "text/markdown";
  return "application/octet-stream";
}

function canModelRead(mediaType: string): boolean {
  return (
    mediaType === "application/pdf" ||
    mediaType.startsWith("image/") ||
    mediaType.startsWith("text/")
  );
}

// Monta o texto de Evidence.analysis a partir do mapa extraído. Texto corrido
// e legível, que é o que o prompt de redação lê no bloco [PROVAS].
function composeAnalysis(ex: DocumentExtractionResult): string {
  const parts: string[] = [];
  if (ex.documentType.trim()) {
    parts.push(`Tipo de documento: ${ex.documentType.trim()}`);
  }
  if (ex.summary.trim()) parts.push(ex.summary.trim());

  if (ex.parties.length > 0) {
    parts.push(
      "Partes identificadas no documento:\n" +
        ex.parties.map((p) => `- ${p.name} (${p.role})`).join("\n"),
    );
  }
  if (ex.keyClauses.length > 0) {
    parts.push(
      "Cláusulas relevantes:\n" +
        ex.keyClauses.map((c) => `- ${c.reference}: ${c.content}`).join("\n"),
    );
  }
  if (ex.values.length > 0) {
    parts.push(
      "Valores:\n" +
        ex.values.map((v) => `- ${v.amount}: ${v.description}`).join("\n"),
    );
  }
  return parts.join("\n\n");
}

// ── Context check (partes do documento vs partes do caso) ─────────────────
// Aviso não bloqueante: só sinaliza possível prova de outro contexto.

const NAME_TOKEN_STOPWORDS = new Set([
  "ltda",
  "ltd",
  "me",
  "epp",
  "eireli",
  "sa",
  "s/a",
  "cia",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "the",
  "inc",
  "corp",
]);

export type ContextCheck = {
  matched: boolean;
  extractedNames: string[];
  caseNames: string[];
};

export function nameTokens(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !NAME_TOKEN_STOPWORDS.has(token));
}

export function hasNameTokenOverlap(
  extractedNames: string[],
  caseNames: string[],
): boolean {
  const caseTokens = new Set<string>();
  for (const name of caseNames) {
    for (const token of nameTokens(name)) {
      caseTokens.add(token);
    }
  }
  if (caseTokens.size === 0) return false;

  for (const name of extractedNames) {
    for (const token of nameTokens(name)) {
      if (caseTokens.has(token)) return true;
    }
  }
  return false;
}

export function buildContextCheck(
  extractedParties: Array<{ name: string }>,
  caseParties: Array<{ name: string }>,
): ContextCheck | null {
  if (extractedParties.length === 0) return null;
  if (caseParties.length === 0) return null;

  const extractedNames = extractedParties.map((party) => party.name);
  const caseNames = caseParties.map((party) => party.name);
  return {
    matched: hasNameTokenOverlap(extractedNames, caseNames),
    extractedNames,
    caseNames,
  };
}

// ── Processamento ────────────────────────────────────────────────────────

export async function processIngestionJob(jobId: string) {
  const job = await prisma.ingestionJob.findUnique({
    where: { id: jobId },
    include: {
      case: { include: { client: true, parties: true } },
      evidence: true,
    },
  });

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

  if (job.evidence?.scanStatus === "INFECTED") {
    await prisma.ingestionJob.update({
      where: { id: job.id },
      data: {
        status: "FALHOU",
        error: "Arquivo bloqueado pela verificação de segurança.",
      },
    });
    return {
      ok: false as const,
      terminal: true as const,
      error: "Arquivo bloqueado pela verificação de segurança.",
      jobId: job.id,
      caseId: job.caseId,
    };
  }

  if (job.evidence?.scanStatus === "FAILED") {
    await prisma.ingestionJob.update({
      where: { id: job.id },
      data: {
        status: "FALHOU",
        error: "A verificação de segurança do arquivo falhou.",
      },
    });
    return {
      ok: false as const,
      terminal: true as const,
      error: "A verificação de segurança do arquivo falhou.",
      jobId: job.id,
      caseId: job.caseId,
    };
  }

  if (job.evidence?.scanStatus === "PENDING") {
    let storageState: Awaited<
      ReturnType<typeof getMalwareScanStorageState>
    >;
    try {
      storageState = await getMalwareScanStorageState(job.storagePath);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Falha ao consultar a verificação de segurança.";
      return {
        ok: false as const,
        terminal: false as const,
        error: message,
        jobId: job.id,
        caseId: job.caseId,
      };
    }

    if (storageState === "pending") {
      return {
        ok: false as const,
        terminal: false as const,
        error: "Verificação de segurança em andamento.",
        jobId: job.id,
        caseId: job.caseId,
      };
    }

    if (storageState === "infected") {
      const message = "Arquivo bloqueado pela verificação de segurança.";
      await prisma.$transaction([
        prisma.evidence.update({
          where: { id: job.evidence.id },
          data: {
            scanStatus: "INFECTED",
            scanMessage: message,
            scannedAt: new Date(),
          },
        }),
        prisma.ingestionJob.update({
          where: { id: job.id },
          data: { status: "FALHOU", error: message },
        }),
      ]);
      return {
        ok: false as const,
        terminal: true as const,
        error: message,
        jobId: job.id,
        caseId: job.caseId,
      };
    }

    await prisma.evidence.update({
      where: { id: job.evidence.id },
      data: {
        scanStatus: "CLEAN",
        scanMessage: null,
        scannedAt: new Date(),
      },
    });
  }

  // Claim atômico: impede que o clique manual e o Cloud Tasks processem o
  // mesmo documento em paralelo. O lease libera jobs presos por crash.
  const staleLease = new Date(Date.now() - 20 * 60 * 1000);
  const claim = await prisma.ingestionJob.updateMany({
    where: {
      id: job.id,
      OR: [
        { status: { in: ["PENDENTE", "FALHOU"] } },
        { status: "PROCESSANDO", updatedAt: { lt: staleLease } },
      ],
    },
    data: { status: "PROCESSANDO", error: null },
  });

  if (claim.count === 0) {
    return {
      ok: false as const,
      error: "Job já está em processamento",
      jobId: job.id,
      caseId: job.caseId,
    };
  }

  try {
    const mediaType = resolveMediaType(job.sourceMimeType, job.sourceFileName);
    const fileStat = await stat(job.storagePath);

    // Tenta a leitura real pelo modelo (PDF, imagem, texto). Se não der,
    // usa o caminho ingênuo como rede de segurança.
    let extraction: DocumentExtractionResult | null = null;
    let model = "";
    if (canModelRead(mediaType) && fileStat.size <= MAX_EXTRACTION_BYTES) {
      try {
        const buffer = await readFile(job.storagePath);
        const response = await extractDocumentFacts({
          fileBase64: buffer.toString("base64"),
          mediaType,
          fileName: job.sourceFileName,
          label: job.evidence?.label ?? job.sourceFileName,
          description: job.evidence?.description ?? null,
          caseTitle: job.case.title,
          domainLabel: DOMAIN_LABEL[job.case.domain] ?? job.case.domain,
        });
        if (!response.result.unreadable) {
          extraction = response.result;
          model = response.model;
        }
      } catch (error) {
        console.error(
          "[JuriAI] Extração pelo modelo falhou, tentando caminho ingênuo:",
          error,
        );
      }
    }

    const extractionResult = await prisma.$transaction(async (tx) => {
      // Mantém a parte CLIENTE do caso atualizada (comportamento anterior).
      const existingClientParty = await tx.party.findFirst({
        where: { caseId: job.caseId, role: "CLIENTE" },
      });
      const clientName = job.case.clientName ?? job.case.client?.name ?? null;
      const clientKind = job.case.client?.kind ?? null;
      const clientDocument = job.case.client?.document ?? null;

      const clientParty = existingClientParty
        ? await tx.party.update({
            where: { id: existingClientParty.id },
            data: {
              name: clientName ?? "Cliente não informado",
              kind: clientKind ?? "PJ",
              document: clientDocument,
            },
          })
        : await tx.party.create({
            data: {
              name: clientName ?? "Cliente não informado",
              role: "CLIENTE",
              kind: clientKind ?? "PJ",
              document: clientDocument,
              caseId: job.caseId,
            },
          });

      let timelineForResult: Array<{ date: string; description: string }> = [];
      let gapsForResult: Array<{ type: string; description: string }> = [];

      if (extraction) {
        // Caminho rico: preenche a análise da prova e usa timeline/gaps reais.
        if (job.evidenceId) {
          await tx.evidence.update({
            where: { id: job.evidenceId },
            data: {
              analysis: composeAnalysis(extraction) || null,
              strength: extraction.suggestedStrength,
            },
          });
        }

        for (const item of extraction.timeline) {
          await tx.timelineEvent.create({
            data: {
              caseId: job.caseId,
              occurredAt: parseDateFromBrazilian(item.date),
              description: item.description.slice(0, 500),
              certainty: item.certainty,
            },
          });
        }

        for (const gap of extraction.gaps) {
          await tx.gap.create({
            data: {
              caseId: job.caseId,
              type: gap.type,
              description: gap.description,
            },
          });
        }

        await tx.auditEntry.create({
          data: {
            action: "EXTRACT_EVIDENCE",
            model: model || "desconhecido",
            groundedOn: extraction.groundedOn,
            confidence: extraction.confidence,
            unresolvedGaps: extraction.gaps.map((g) => g.description),
            caseId: job.caseId,
            reviewedById: null,
          },
        });

        timelineForResult = extraction.timeline.map((t) => ({
          date: t.date,
          description: t.description,
        }));
        gapsForResult = extraction.gaps;
      } else {
        // Caminho ingênuo (fallback): texto puro + heurísticas.
        const buffer = await readFile(job.storagePath);
        const text = extractText(buffer);
        const timeline = text ? detectTimeline(text) : [];
        const gaps = text ? detectGaps(text) : [];

        for (const item of timeline) {
          await tx.timelineEvent.create({
            data: {
              caseId: job.caseId,
              occurredAt: parseDateFromBrazilian(item.occurredAt),
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
        timelineForResult = timeline.map((t) => ({
          date: t.occurredAt,
          description: t.description,
        }));
        gapsForResult = gaps;
      }

      // Partes do caso para comparar: cadastradas + CLIENTE desta execução.
      const casePartiesForCheck: Array<{ name: string }> = [];
      const seen = new Set<string>();
      for (const party of job.case.parties) {
        if (!seen.has(party.name)) {
          seen.add(party.name);
          casePartiesForCheck.push({ name: party.name });
        }
      }
      if (!seen.has(clientParty.name)) {
        casePartiesForCheck.push({ name: clientParty.name });
      }

      const contextCheck = extraction
        ? buildContextCheck(extraction.parties, casePartiesForCheck)
        : null;

      // extractionResult: modo + mapa útil.
      // parties aqui continua sendo a CLIENTE do caso (legado), não as partes
      // extraídas do documento (essas vão em Evidence.analysis via composeAnalysis).
      const result = {
        sourceFileName: job.sourceFileName,
        mode: extraction ? "modelo" : "texto",
        documentType: extraction?.documentType ?? null,
        parties: [
          {
            name: clientParty.name,
            role: clientParty.role,
            kind: clientParty.kind,
          },
        ],
        extractedParties: extraction?.parties ?? [],
        timelineEvents: timelineForResult,
        suggestedGaps: gapsForResult,
        ...(contextCheck ? { contextCheck } : {}),
      };

      await tx.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: "CONCLUIDO",
          extractionResult: result,
          error: null,
        },
      });

      return result;
    });

    return {
      ok: true as const,
      jobId: job.id,
      caseId: job.caseId,
      extractionResult,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao processar arquivo";

    await prisma.ingestionJob.update({
      where: { id: job.id },
      data: { status: "FALHOU", error: message },
    });

    return {
      ok: false as const,
      error: message,
      jobId: job.id,
      caseId: job.caseId,
    };
  }
}
