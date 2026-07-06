"use server";

import { revalidatePath } from "next/cache";
import { getAccessibleCase } from "@/lib/access";
import {
  getLlmRuntimeState,
  classifyLlmError,
  generateDraftWithClaude,
  type DraftGenerationInput,
  type LlmFailureStatus,
} from "@/lib/llm";
import { CASE_TYPE_LABEL, DOMAIN_LABEL } from "@/lib/case-labels";
import { prisma } from "@/lib/prisma";
import type { DraftType } from "@prisma/client";

type DraftGenerationActionResult =
  | { ok: true; draftId: string; version: number }
  | { ok: false; status: LlmFailureStatus; message?: string };

const DRAFT_TYPE_OPTIONS = [
  "NOTIFICACAO_EXTRAJUDICIAL",
  "RESPOSTA_EXTRAJUDICIAL",
  "PETICAO_INICIAL",
  "CONTESTACAO",
  "RECONVENCAO",
  "ACORDO",
  "PARECER",
  "OUTRO",
] as const;

const DRAFT_TYPE_LABELS: Record<(typeof DRAFT_TYPE_OPTIONS)[number], string> = {
  NOTIFICACAO_EXTRAJUDICIAL: "Notificação extrajudicial",
  RESPOSTA_EXTRAJUDICIAL: "Resposta extrajudicial",
  PETICAO_INICIAL: "Petição inicial",
  CONTESTACAO: "Contestação",
  RECONVENCAO: "Reconvenção",
  ACORDO: "Acordo",
  PARECER: "Parecer",
  OUTRO: "Outro",
};

const DRAFT_ERROR_MESSAGE =
  "Não foi possível gerar o rascunho agora. Tente novamente em alguns instantes.";

function isDraftType(value: string): value is DraftType {
  return (DRAFT_TYPE_OPTIONS as readonly string[]).includes(value);
}

function buildDraftPrompt(input: DraftGenerationInput) {
  return {
    title: input.title,
    draftTypeLabel: input.draftTypeLabel,
    domainLabel: input.domainLabel,
    caseTypeLabel: input.caseTypeLabel,
    workspaceName: input.workspaceName,
    summary: input.summary,
    instructions: input.instructions,
    clientName: input.clientName,
    evidence: input.evidence,
    timeline: input.timeline,
    gaps: input.gaps,
    parties: input.parties,
  };
}

export async function generateCaseDraft(
  caseId: string,
  formData: FormData,
): Promise<DraftGenerationActionResult> {
  const caso = await getAccessibleCase(caseId);
  if (!caso) {
    throw new Error("Caso não encontrado");
  }

  const runtimeState = await getLlmRuntimeState();
  if (runtimeState.status !== "ready") {
    return { ok: false, status: runtimeState.status };
  }

  const typeInput = String(formData.get("type") || "").trim();
  if (!isDraftType(typeInput)) {
    throw new Error("Selecione um tipo de peça válido.");
  }

  const instructions = String(formData.get("instructions") || "").trim();
  const workspace = await prisma.workspace.findUnique({
    where: { id: caso.workspaceId },
    select: { name: true },
  });

  if (!workspace) {
    throw new Error("Escritório do caso não encontrado.");
  }

  const type = typeInput as DraftType;
  const typeLabel = DRAFT_TYPE_LABELS[type];
  const latestDraft = await prisma.draft.findFirst({
    where: { caseId: caso.id, type },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  type DraftGenerationOutput = Awaited<ReturnType<typeof generateDraftWithClaude>>;
  let generation: DraftGenerationOutput["result"] | null = null;
  let model = "";
  try {
    const response = await generateDraftWithClaude(
      buildDraftPrompt({
        title: caso.title,
        draftTypeLabel: typeLabel,
        domainLabel: DOMAIN_LABEL[caso.domain] ?? caso.domain,
        caseTypeLabel: CASE_TYPE_LABEL[caso.type] ?? caso.type,
        workspaceName: workspace.name,
        summary: caso.summary,
        instructions: instructions || null,
        clientName:
          caso.client?.name ?? caso.clientName ?? "Cliente não informado",
        evidence: caso.evidence.map((e) => ({
          label: e.label,
          description: e.description ?? null,
          analysis: e.analysis ?? null,
        })),
        timeline: caso.timeline.map((item) => ({
          description: item.description,
          certainty: item.certainty,
        })),
        gaps: caso.gaps.map((gap) => ({
          type: gap.type,
          description: gap.description,
          resolved: gap.resolved,
        })),
        parties: caso.parties.map((party) => ({
          name: party.name,
          role: party.role,
          kind: party.kind,
          notes: party.notes ?? null,
        })),
      }),
    );
    generation = response.result;
    model = response.model;
  } catch (error) {
    const status = classifyLlmError(error);
    return {
      ok: false,
      status,
      message:
        status === "unavailable"
          ? DRAFT_ERROR_MESSAGE
          : undefined,
    };
  }

  if (!generation) {
    return {
      ok: false,
      status: "unavailable",
      message: DRAFT_ERROR_MESSAGE,
    };
  }

  const version = (latestDraft?.version ?? 0) + 1;
  const fallbackTitle = `${typeLabel} · ${caso.title}`;
  const title = generation.title.trim() || fallbackTitle;
  const content = generation.content.trim();

  if (!content) {
    return {
      ok: false,
      status: "unavailable",
      message: DRAFT_ERROR_MESSAGE,
    };
  }

  const created = await prisma.$transaction(async (tx) => {
    const draft = await tx.draft.create({
      data: {
        caseId: caso.id,
        type,
        title,
        content,
        version,
      },
      select: { id: true },
    });

    await tx.auditEntry.create({
      data: {
        action: "GENERATE_DRAFT",
        model,
        groundedOn: generation.groundedOn,
        confidence: generation.confidence,
        unresolvedGaps: generation.unresolvedGaps,
        caseId: caso.id,
        reviewedById: null,
      },
    });

    return draft;
  });

  revalidatePath(`/casos/${caseId}`);
  revalidatePath("/workspace");

  return {
    ok: true,
    draftId: created.id,
    version,
  };
}
