"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { appendChatMessage, generateCopilotReply } from "@/app/actions/chat";
import { AI_STATUS_MESSAGES } from "@/components/AnalisarCasoButton";
import { Button } from "@/components/ui";
import { hasMinimumDraftContext } from "@/lib/draft-context";
import type { LlmRuntimeStatus } from "@/lib/llm";

type CopilotMessage = {
  role: "assistant" | "user";
  text: string;
};

export function CaseCopilotPanel({
  caseId,
  caseTitle,
  clientName,
  actorName,
  initialStatus,
  timelineCount,
  gapCount,
  gapPrompts,
  evidenceCount,
  isJudicial,
  courtProcessCount,
  draftCount,
  pendingDraftCount,
  initialMessages,
  compact = false,
}: {
  caseId: string;
  caseTitle: string;
  clientName: string | null;
  actorName: string;
  initialStatus: LlmRuntimeStatus;
  timelineCount: number;
  gapCount: number;
  gapPrompts: string[];
  evidenceCount: number;
  isJudicial: boolean;
  courtProcessCount: number;
  draftCount: number;
  pendingDraftCount: number;
  initialMessages: { role: string; content: string }[];
  /** Layout denso para coluna lateral do dossiê */
  compact?: boolean;
}) {
  const [command, setCommand] = useState("");
  const [conversationNotes, setConversationNotes] = useState<string[]>([]);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const greetingPersistedRef = useRef(false);
  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    if (initialMessages.length > 0) {
      return initialMessages.map((message) => ({
        role: message.role === "user" ? "user" : "assistant",
        text: message.content,
      }));
    }

    const greeting = buildInitialMessage({
      caseTitle,
      clientName,
      actorName,
      status: initialStatus,
      timelineCount,
      gapCount,
      gapPrompts,
      evidenceCount,
      isJudicial,
      courtProcessCount,
      draftCount,
      pendingDraftCount,
    });
    return [{ role: "assistant", text: greeting }];
  });
  const [isPending, startTransition] = useTransition();

  // Só persiste a saudação inicial (quando o caso ainda não tem histórico).
  // Fica num efeito com trava em ref, não no useState acima, porque o modo
  // estrito do React chama a função de estado inicial mais de uma vez em
  // desenvolvimento — sem a trava, isso duplicava a primeira mensagem no banco.
  useEffect(() => {
    if (initialMessages.length > 0) return;
    if (greetingPersistedRef.current) return;
    greetingPersistedRef.current = true;
    const greeting = messages[0]?.text;
    if (greeting) {
      void appendChatMessage(caseId, "assistant", greeting);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isReady = initialStatus === "ready";

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function appendMessages(nextMessages: CopilotMessage[]) {
    setMessages((current) => [...current, ...nextMessages].slice(-40));
    for (const message of nextMessages) {
      void appendChatMessage(caseId, message.role, message.text);
    }
  }

  function scriptedReply(text: string, notes: string[]) {
    return buildNextQuestion({
      input: text,
      notes,
      isReady,
      evidenceCount,
      timelineCount,
      gapCount,
      gapPrompts,
      pendingDraftCount,
      isJudicial,
      courtProcessCount,
    });
  }

  function sendMessage() {
    const text = command.trim();
    if (!text) return;

    const nextNotes = [...conversationNotes, text].slice(-6);
    const historyForReply = messages.map((m) => ({ role: m.role, text: m.text }));
    setConversationNotes(nextNotes);
    setCommand("");
    appendMessages([{ role: "user", text }]);

    if (!isReady) {
      appendMessages([{ role: "assistant", text: scriptedReply(text, nextNotes) }]);
      return;
    }

    setBusyAction("chat");
    startTransition(async () => {
      try {
        const response = await generateCopilotReply(caseId, text, historyForReply);
        appendMessages([
          {
            role: "assistant",
            text: response.ok ? response.reply : scriptedReply(text, nextNotes),
          },
        ]);
      } finally {
        setBusyAction(null);
      }
    });
  }

  function handleComposerKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    sendMessage();
  }

  const padX = compact ? "px-3" : "px-6";
  const padY = compact ? "py-3" : "py-6";
  const bubbleMax = compact ? "max-w-[92%]" : "max-w-[82%]";

  return (
    <section
      className={[
        "flex h-full min-h-[20rem] w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]",
        compact ? "lg:min-h-[28rem]" : "mx-auto max-w-4xl",
      ].join(" ")}
      aria-label="Conversa com assistente jurídico"
    >
      <div className={["min-h-0 flex-1 overflow-y-auto", padX, padY].join(" ")}>
        <div className="flex w-full flex-col gap-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.text.slice(0, 48)}`}
              className={[
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              ].join(" ")}
            >
              <div
                className={[
                  bubbleMax,
                  "rounded-[var(--radius-card)] px-3 py-2 text-sm leading-relaxed",
                  message.role === "assistant"
                    ? "bg-[var(--background)] text-[var(--foreground)] ring-1 ring-[var(--border)]"
                    : "bg-[var(--background)] text-[var(--foreground)] ring-1 ring-[var(--border)]",
                ].join(" ")}
              >
                {message.text}
              </div>
            </div>
          ))}
          {busyAction && (
            <div className="flex justify-start">
              <div className="rounded-[var(--radius-card)] bg-[var(--background)] px-3 py-2 ring-1 ring-[var(--border)]">
                <span className="inline-flex items-center gap-1 text-[var(--muted)]">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                </span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      <footer
        className={[
          "shrink-0 border-t border-[var(--border)] bg-[var(--surface)]",
          compact ? "px-3 py-2.5" : "px-6 py-3",
        ].join(" ")}
      >
        <div
          className={[
            "case-copilot-frame w-full",
            isPending ? "case-copilot-frame-active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="relative rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-2.5">
            <textarea
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={compact ? 2 : 2}
              placeholder="Pergunte ou oriente a estratégia do caso..."
              className="max-h-32 min-h-10 w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-[var(--muted)]"
            />
            <div className="mt-1.5 flex items-center justify-end border-t border-[var(--border)] pt-2">
              <Button
                type="button"
                size="md"
                variant="secondary"
                onClick={sendMessage}
                disabled={!command.trim() || isPending}
                className="whitespace-nowrap"
              >
                {busyAction === "chat" ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}

function buildInitialMessage({
  caseTitle,
  clientName,
  actorName,
  status,
  timelineCount,
  gapCount,
  gapPrompts,
  evidenceCount,
  isJudicial,
  courtProcessCount,
  draftCount,
  pendingDraftCount,
}: {
  caseTitle: string;
  clientName: string | null;
  actorName: string;
  status: LlmRuntimeStatus;
  timelineCount: number;
  gapCount: number;
  gapPrompts: string[];
  evidenceCount: number;
  isJudicial: boolean;
  courtProcessCount: number;
  draftCount: number;
  pendingDraftCount: number;
}) {
  const clientLabel =
    clientName && !caseTitle.toLowerCase().includes(clientName.toLowerCase())
      ? `, de ${clientName}`
      : "";
  const greeting = `Olá, Dr. ${firstName(actorName)}. Vamos atuar no caso ${caseTitle}${clientLabel}.`;

  if (status !== "ready") {
    return `${greeting} ${AI_STATUS_MESSAGES[status]}`;
  }

  if (evidenceCount === 0) {
    return `${greeting} Use o chat para orientar a estratégia. Anexe provas no dossiê e, quando houver base, use Gerar análise. Rascunhos ficam em Rascunhos e redação.`;
  }

  if (isJudicial && courtProcessCount === 0) {
    return `${greeting} Qual documento ou informação vamos trabalhar primeiro? Se houver número CNJ, vincule o processo no dossiê.`;
  }

  if (timelineCount === 0 && gapCount === 0) {
    return `Vi ${evidenceCount} documento${evidenceCount !== 1 ? "s" : ""} no caso. Próximo passo: Gerar análise (acima) para mapear fatos, riscos e lacunas.`;
  }

  if (draftCount > 0) {
    return `Há ${draftCount} rascunho${draftCount > 1 ? "s" : ""} no dossiê${pendingDraftCount > 0 ? ` (${pendingDraftCount} para revisão)` : ""}. Continue a conversa ou refine a minuta em Rascunhos e redação.`;
  }

  if (timelineCount > 0 || gapCount > 0) {
    const firstGap = gapPrompts[0];
    if (firstGap) {
      return `A análise tem ${timelineCount} fato${timelineCount !== 1 ? "s" : ""} e ${gapCount} lacuna${gapCount !== 1 ? "s" : ""}. Primeira pergunta: ${firstGap}`;
    }
    return `A análise tem ${timelineCount} fato${timelineCount !== 1 ? "s" : ""}. Para peça formal, use Rascunhos e redação.`;
  }

  return "Posso ajudar a organizar a estratégia. Use Gerar análise no painel e Rascunhos e redação para a minuta.";
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || "Advogado";
}

function buildNextQuestion({
  input,
  notes,
  isReady,
  evidenceCount,
  timelineCount,
  gapCount,
  gapPrompts,
  pendingDraftCount,
  isJudicial,
  courtProcessCount,
}: {
  input: string;
  notes: string[];
  isReady: boolean;
  evidenceCount: number;
  timelineCount: number;
  gapCount: number;
  gapPrompts: string[];
  pendingDraftCount: number;
  isJudicial: boolean;
  courtProcessCount: number;
}) {
  if (!isReady) {
    return "A IA ainda não está disponível para executar ações. Quando a configuração estiver pronta, eu conduzo a análise e a minuta por aqui.";
  }

  const normalized = input.toLowerCase();
  const noteCount = notes.filter((note) => note.trim().length > 8).length;

  if (
    looksLikeDraftRequest(input) &&
    !hasMinimumDraftContext({
      conversationNotes: notes,
      evidenceCount,
      timelineCount,
      gapCount,
    })
  ) {
    return "Eu consigo orientar a redação, mas ainda falta base. Me diga primeiro: qual documento chegou, qual prazo existe e qual é o pedido ou acusação da outra parte? Depois use Rascunhos e redação para gerar a minuta.";
  }

  if (looksLikeDraftRequest(input)) {
    return "Para gerar a peça formal, use a seção Rascunhos e redação no dossiê (tipo de peça + Gerar rascunho). Aqui no chat podemos refinar a estratégia e as instruções.";
  }

  if (noteCount <= 1) {
    if (mentionsDocument(normalized)) {
      return "Entendi. Qual é o prazo ou risco imediato desse documento, e o que a outra parte está pedindo ou alegando?";
    }
    return "Certo. Qual documento ou comunicação chegou ao escritório, e existe algum prazo correndo?";
  }

  if (noteCount === 2) {
    return "Quais provas já temos para sustentar a versão do cliente? Pode citar contrato, mensagens, e-mails, comprovantes ou testemunhas.";
  }

  if (isJudicial && courtProcessCount === 0 && normalized.includes("process")) {
    return "Se tiver número CNJ, vincule o processo no dossiê. Se ainda não tiver, sigo com a narrativa documental e marco essa ausência como lacuna.";
  }

  if (gapCount > 0) {
    const nextQuestion = gapPrompts[0];
    if (nextQuestion && noteCount < 4) {
      return `Boa. Antes de redigir, preciso validar uma lacuna importante: ${nextQuestion}`;
    }
  }

  if (pendingDraftCount > 0) {
    return "Há rascunho no dossiê para revisão. Use Rascunhos e redação para gerar nova versão com instruções específicas, ou continue aqui para refinar a estratégia.";
  }

  return "Tenho contexto suficiente para avançar. Use Rascunhos e redação para a minuta, ou continue a conversa para refinar a estratégia.";
}

function mentionsDocument(value: string) {
  return (
    value.includes("document") ||
    value.includes("prova") ||
    value.includes("contrato") ||
    value.includes("notifica") ||
    value.includes("cita") ||
    value.includes("arquivo") ||
    value.includes("email") ||
    value.includes("mensagem")
  );
}

function looksLikeDraftRequest(value: string) {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("gerar") ||
    normalized.includes("redigir") ||
    normalized.includes("criar") ||
    normalized.includes("fazer") ||
    normalized.includes("peça") ||
    normalized.includes("peca") ||
    normalized.includes("contestação") ||
    normalized.includes("contestacao") ||
    normalized.includes("petição") ||
    normalized.includes("peticao")
  );
}
