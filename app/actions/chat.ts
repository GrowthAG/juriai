"use server";

import { prisma } from "@/lib/prisma";
import { getAccessibleCase } from "@/lib/access";
import { craftCopilotReply } from "@/lib/llm";
import { CASE_STATUS, CASE_TYPE_LABEL, DOMAIN_LABEL } from "@/lib/case-labels";

const CHAT_ROLES = new Set(["user", "assistant"]);

// Persistência da conversa do Copiloto: tabela ChatMessage já no schema.
// Falha em silêncio: o chat funciona em estado local do React; isto só
// sobrevive a reload. Não pode travar a UI.
export async function appendChatMessage(
  caseId: string,
  role: string,
  content: string,
): Promise<void> {
  if (!CHAT_ROLES.has(role) || !content.trim()) return;

  try {
    const caso = await getAccessibleCase(caseId);
    if (!caso) return;

    await prisma.chatMessage.create({
      data: { caseId, role, content },
    });
  } catch (error) {
    console.error("[JuriAI] Falha ao persistir mensagem do chat:", error);
  }
}

/* Resposta conversacional via LLM com contexto do caso e histórico.
   Quem decide analisar/redigir continua no CaseCopilotPanel. Em falha
   (IA indisponível etc.) devolve ok:false e o painel cai no roteiro fixo.
   Sem attachChatEvidence/ingest (W2) e sem auth/session. */
export async function generateCopilotReply(
  caseId: string,
  message: string,
  history: Array<{ role: string; text: string }>,
): Promise<{ ok: true; reply: string } | { ok: false }> {
  const caso = await getAccessibleCase(caseId);
  if (!caso) return { ok: false };

  try {
    const { result } = await craftCopilotReply({
      caseTitle: caso.title,
      domainLabel: DOMAIN_LABEL[caso.domain] ?? caso.domain,
      typeLabel: CASE_TYPE_LABEL[caso.type] ?? caso.type,
      statusLabel: CASE_STATUS[caso.status]?.label ?? caso.status,
      evidenceCount: caso.evidence.length,
      timelineCount: caso.timeline.length,
      gapCount: caso.gaps.length,
      gapPrompts: caso.gaps.slice(0, 3).map((gap) => gap.description),
      history: history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-12)
        .map((m) => ({ role: m.role as "user" | "assistant", text: m.text })),
      latestMessage: message,
    });
    return { ok: true, reply: result.reply };
  } catch (error) {
    console.error("[JuriAI] Falha ao gerar resposta do copiloto via IA:", error);
    return { ok: false };
  }
}
