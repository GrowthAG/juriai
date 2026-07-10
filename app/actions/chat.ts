"use server";

import { prisma } from "@/lib/prisma";
import { getAccessibleCase } from "@/lib/access";

const CHAT_ROLES = new Set(["user", "assistant"]);

// Persistência mínima da conversa do Copiloto na tabela ChatMessage (já no
// schema). Falha em silêncio: o painel mantém estado local no React; isto
// só permite sobreviver a reload, sem travar a UI.
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

/* Contrato do CaseCopilotPanel: resposta conversacional. Nesta PR baseline
   NÃO chama LLM (craftCopilotReply / lib/llm ficam no PR #2). Devolve
   ok:false para o painel usar o roteiro determinístico (scriptedReply). */
export async function generateCopilotReply(
  caseId: string,
  message: string,
  history: Array<{ role: string; text: string }>,
): Promise<{ ok: true; reply: string } | { ok: false }> {
  void caseId;
  void message;
  void history;
  return { ok: false };
}
