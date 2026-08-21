/**
 * DEV ONLY — recria caso [SMOKE] Almeida para testes.
 * NÃO é recuperação do dossiê histórico apagado.
 * NÃO reutiliza o caseId antigo 6b4e1f0e-7063-4c3b-8159-71fbebb6440f.
 *
 * Uso (só com autorização explícita):
 *   node scripts/dev-recreate-almeida-smoke.mjs
 */
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();

const WORKSPACE_ID = "d763f367-a9a9-4997-adda-1120156a9125";
const CLIENT_ID = "5188c6d7-970b-42b5-9958-6db2925f79cf";
const OWNER_ID = "ac2d945c-d48a-4d41-acc9-bd44810e7254"; // giulliano@usefunnels.io
const ADMIN_EMAIL = "admin@juriai.local";
const FORBIDDEN_OLD_CASE_ID = "6b4e1f0e-7063-4c3b-8159-71fbebb6440f";

const SMOKE_FILE = "[SMOKE] contrato-ficticio-contexto-mismatch.txt";
const SMOKE_STORAGE = "/tmp/juriai-smoke-safe.txt";

async function main() {
  const ws = await prisma.workspace.findUnique({ where: { id: WORKSPACE_ID } });
  const client = await prisma.client.findUnique({ where: { id: CLIENT_ID } });
  const owner = await prisma.user.findUnique({ where: { id: OWNER_ID } });
  const admin = await prisma.user.findFirst({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true },
  });

  if (!ws || ws.name !== "Almeida Dias") {
    throw new Error("Workspace Almeida Dias não encontrado — abort");
  }
  if (!client || client.workspaceId !== WORKSPACE_ID) {
    throw new Error("Client Almeida Comércio inválido/workspace mismatch — abort");
  }
  if (!owner) throw new Error("Owner ausente — abort");
  if (!admin) throw new Error("admin@juriai.local ausente — abort");

  const old = await prisma.case.findUnique({
    where: { id: FORBIDDEN_OLD_CASE_ID },
    select: { id: true },
  });
  if (old) {
    throw new Error("Caso antigo ainda existe; este script é só para smoke novo — abort");
  }

  // Garante arquivo sintético local (sem dado sensível)
  writeFileSync(
    SMOKE_STORAGE,
    [
      "SMOKE TEST JuriAI",
      "Documento sintético sem dados sensíveis.",
      "Partes fictícias no texto: ASAAS PAGAMENTOS S.A. e REVHACKERS TECNOLOGIA LTDA.",
      "CASO DE SMOKE/DEV. Não é o dossiê histórico apagado.",
      "",
    ].join("\n"),
    "utf8",
  );

  const caseId = randomUUID();
  const evidenceId = randomUUID();
  const jobId = randomUUID();

  if (
    caseId === FORBIDDEN_OLD_CASE_ID ||
    evidenceId === FORBIDDEN_OLD_CASE_ID ||
    jobId === FORBIDDEN_OLD_CASE_ID
  ) {
    throw new Error("UUID colidiu com ID proibido — abort");
  }

  const extractionResult = {
    mode: "smoke",
    documentType: "contrato_ficticio",
    sourceFileName: SMOKE_FILE,
    parties: [
      { name: "ASAAS PAGAMENTOS S.A." },
      { name: "REVHACKERS TECNOLOGIA LTDA" },
    ],
    contextCheck: {
      matched: false,
      caseNames: ["Almeida Comércio Ltda"],
      extractedNames: ["ASAAS PAGAMENTOS S.A.", "REVHACKERS TECNOLOGIA LTDA"],
    },
    timelineEvents: [],
    suggestedGaps: [],
  };

  const created = await prisma.$transaction(async (tx) => {
    const caso = await tx.case.create({
      data: {
        id: caseId,
        title: "[SMOKE] Cobrança indevida — Almeida Comércio",
        clientName: "Almeida Comércio Ltda",
        domain: "CONSUMIDOR",
        type: "EXTRAJUDICIAL",
        status: "ANALISE",
        summary:
          "CASO DE SMOKE/DEV. Não é o dossiê histórico apagado. Dados fictícios para teste de UI (contextCheck, draft, copilot). Cliente fictício recebeu cobrança extrajudicial de R$ 5.000 por compra não reconhecida.",
        workspaceId: WORKSPACE_ID,
        ownerId: OWNER_ID,
        clientId: CLIENT_ID,
      },
    });

    await tx.caseMember.createMany({
      data: [
        { caseId, userId: OWNER_ID },
        { caseId, userId: admin.id },
      ],
      skipDuplicates: true,
    });

    await tx.party.createMany({
      data: [
        {
          caseId,
          name: "Almeida Comércio Ltda",
          role: "CLIENTE",
          kind: "PJ",
          notes: "SMOKE/DEV",
        },
        {
          caseId,
          name: "Empresa Cobra Fictícia SA",
          role: "CONTRAPARTE",
          kind: "PJ",
          notes: "SMOKE/DEV — contraparte fictícia",
        },
      ],
    });

    await tx.evidence.create({
      data: {
        id: evidenceId,
        caseId,
        label: SMOKE_FILE,
        description:
          "Arquivo sintético SMOKE/DEV para contextCheck.matched=false. Sem dado real.",
        mimeType: "text/plain",
        strength: "NAO_AVALIADA",
        storagePath: SMOKE_STORAGE,
      },
    });

    await tx.ingestionJob.create({
      data: {
        id: jobId,
        caseId,
        evidenceId,
        status: "CONCLUIDO",
        sourceFileName: SMOKE_FILE,
        sourceMimeType: "text/plain",
        storagePath: SMOKE_STORAGE,
        extractionResult,
      },
    });

    await tx.timelineEvent.create({
      data: {
        caseId,
        description:
          "Cliente alega cobrança indevida de R$ 5.000 (SMOKE/DEV — fato alegado de teste).",
        certainty: "ALEGADO",
        source: "SMOKE",
      },
    });

    await tx.gap.create({
      data: {
        caseId,
        type: "PROVA_NECESSARIA",
        description:
          "Confirmar se o documento de cobrança está anexado e se as partes batem (SMOKE/DEV).",
        resolved: false,
      },
    });

    return caso;
  });

  const counts = {
    Case: await prisma.case.count({ where: { id: caseId } }),
    CaseMember: await prisma.caseMember.count({ where: { caseId } }),
    Party: await prisma.party.count({ where: { caseId } }),
    Evidence: await prisma.evidence.count({ where: { caseId } }),
    IngestionJob: await prisma.ingestionJob.count({ where: { caseId } }),
    TimelineEvent: await prisma.timelineEvent.count({ where: { caseId } }),
    Gap: await prisma.gap.count({ where: { caseId } }),
    ChatMessage: await prisma.chatMessage.count({ where: { caseId } }),
    Draft: await prisma.draft.count({ where: { caseId } }),
  };

  const job = await prisma.ingestionJob.findFirst({
    where: { caseId },
    select: { extractionResult: true },
  });
  const er = job?.extractionResult;
  const cc =
    er && typeof er === "object" && !Array.isArray(er) ? er.contextCheck : null;

  console.log(
    JSON.stringify(
      {
        ok: true,
        note: "SMOKE/DEV only — not historical recovery",
        caseId: created.id,
        title: created.title,
        reusedOldId: created.id === FORBIDDEN_OLD_CASE_ID,
        counts,
        contextCheck: cc,
        extractionMode:
          er && typeof er === "object" && !Array.isArray(er) ? er.mode : null,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(String(e?.stack || e).slice(0, 800));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
