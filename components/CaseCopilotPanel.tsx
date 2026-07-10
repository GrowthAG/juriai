"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CaseType, DraftType } from "@prisma/client";
import { analyzeCase } from "@/app/actions/analyze";
import { generateCaseDraft } from "@/app/actions/drafts";
import { appendChatMessage, generateCopilotReply } from "@/app/actions/chat";
import { AI_STATUS_MESSAGES } from "@/components/AnalisarCasoButton";
import { Button } from "@/components/ui";
import type { LlmRuntimeStatus } from "@/lib/llm";

type CopilotMessage = {
  role: "assistant" | "user";
  text: string;
};

const DRAFT_TYPE_LABELS: Record<DraftType, string> = {
  NOTIFICACAO_EXTRAJUDICIAL: "Notificação extrajudicial",
  RESPOSTA_EXTRAJUDICIAL: "Resposta extrajudicial",
  PETICAO_INICIAL: "Petição inicial",
  CONTESTACAO: "Contestação",
  RECONVENCAO: "Reconvenção",
  ACORDO: "Acordo",
  PARECER: "Parecer",
  OUTRO: "Outro",
};

const CASE_DRAFT_OPTIONS: DraftType[] = [
  "CONTESTACAO",
  "RECONVENCAO",
  "RESPOSTA_EXTRAJUDICIAL",
  "PETICAO_INICIAL",
  "ACORDO",
  "PARECER",
];

function defaultDraftTypeForCase(caseType: CaseType): DraftType {
  switch (caseType) {
    case "EXTRAJUDICIAL":
      return "RESPOSTA_EXTRAJUDICIAL";
    case "JUDICIAL_ATIVO":
      return "PETICAO_INICIAL";
    case "JUDICIAL_PASSIVO":
      return "CONTESTACAO";
    case "CONSULTIVO":
    default:
      return "PARECER";
  }
}

export function CaseCopilotPanel({
  caseId,
  caseTitle,
  clientName,
  actorName,
  caseType,
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
}: {
  caseId: string;
  caseTitle: string;
  clientName: string | null;
  actorName: string;
  caseType: CaseType;
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
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LlmRuntimeStatus>(initialStatus);
  const [selectedDraftType, setSelectedDraftType] = useState<DraftType>(
    defaultDraftTypeForCase(caseType),
  );
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

  const isReady = status === "ready";
  const draftTypeLabel = DRAFT_TYPE_LABELS[selectedDraftType];
  const needsAnalysis = evidenceCount > 0 && timelineCount === 0 && gapCount === 0;
  const hasEnoughContext = hasMinimumDraftContext({
    conversationNotes,
    evidenceCount,
    timelineCount,
    gapCount,
  });

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
      draftTypeLabel,
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

    if (looksLikeDraftRequest(text) && hasMinimumDraftContext({
      conversationNotes: nextNotes,
      evidenceCount,
      timelineCount,
      gapCount,
    })) {
      createDraftFromNotes(nextNotes);
      return;
    }

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

  function runAnalysis() {
    if (!isReady || isPending) return;
    setBusyAction("analysis");
    appendMessages([
      { role: "user", text: "Gerar análise para revisão." },
      { role: "assistant", text: "Vou atualizar a linha do tempo e as lacunas." },
    ]);

    startTransition(async () => {
      try {
        const result = await analyzeCase(caseId);
        if (result.ok) {
          appendMessages([
            {
              role: "assistant",
              text: "Análise salva. Revise os fatos, lacunas e riscos mapeados.",
            },
          ]);
          router.refresh();
          return;
        }
        setStatus(result.status);
        appendMessages([
          { role: "assistant", text: AI_STATUS_MESSAGES[result.status] },
        ]);
      } catch {
        setStatus("unavailable");
        appendMessages([
          {
            role: "assistant",
            text: AI_STATUS_MESSAGES.unavailable,
          },
        ]);
      } finally {
        setBusyAction(null);
      }
    });
  }

  function generateDraft() {
    if (!isReady || isPending) return;
    const text = command.trim();
    const nextNotes = text ? [...conversationNotes, text].slice(-6) : conversationNotes;

    if (text) {
      setConversationNotes(nextNotes);
      setCommand("");
      appendMessages([{ role: "user", text }]);
    }

    if (!hasMinimumDraftContext({
      conversationNotes: nextNotes,
      evidenceCount,
      timelineCount,
      gapCount,
    })) {
      appendMessages([
        {
          role: "assistant",
          text: "Antes de redigir, preciso de um pouco mais de contexto: qual documento chegou, qual é o pedido da outra parte e qual resultado você quer buscar?",
        },
      ]);
      return;
    }

    createDraftFromNotes(nextNotes);
  }

  function createDraftFromNotes(notes: string[]) {
    if (!isReady || isPending) return;
    const instructions = notes.filter(Boolean).join("\n");
    const formData = new FormData();
    formData.set("type", selectedDraftType);
    formData.set("instructions", instructions);

    setBusyAction("draft");
    appendMessages([
      {
        role: "assistant",
        text: `Vou redigir uma ${draftTypeLabel.toLowerCase()} com base no que conversamos e salvar como rascunho pendente de revisão humana.`,
      },
    ]);

    startTransition(async () => {
      try {
        const result = await generateCaseDraft(caseId, formData);
        if (result.ok) {
          setCommand("");
          appendMessages([
            {
              role: "assistant",
              text: `Rascunho v${result.version} criado. Revise antes de aprovar.`,
            },
          ]);
          router.refresh();
          return;
        }
        setStatus(result.status);
        appendMessages([
          {
            role: "assistant",
            text: result.message ?? AI_STATUS_MESSAGES[result.status],
          },
        ]);
      } catch {
        setStatus("unavailable");
        appendMessages([
          {
            role: "assistant",
            text: "Não foi possível gerar a minuta agora. Tente novamente em instantes.",
          },
        ]);
      } finally {
        setBusyAction(null);
      }
    });
  }

  return (
    <section
      className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col overflow-hidden bg-[var(--background)]"
      aria-label="Conversa com assistente jurídico"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.text}`}
              className={[
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              ].join(" ")}
            >
              <div
                className={[
                  "max-w-[82%] rounded-[var(--radius-card)] px-4 py-3 text-sm leading-relaxed",
                  message.role === "assistant"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
                    : "bg-[var(--primary)] text-[var(--primary-foreground)]",
                ].join(" ")}
              >
                {message.text}
              </div>
            </div>
          ))}
          {busyAction && (
            <div className="flex justify-start">
              <div className="rounded-[var(--radius-card)] bg-[var(--surface)] px-4 py-3 shadow-sm ring-1 ring-[var(--border)]">
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

      <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--background)] px-6 py-3">
        <div
          className={[
            "case-copilot-frame mx-auto w-full max-w-3xl",
            isPending ? "case-copilot-frame-active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="relative rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
            <textarea
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={1}
              placeholder="Escreva o que você quer fazer neste caso..."
              className="max-h-40 min-h-12 w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-[var(--muted)]"
            />
            <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--border)] pt-2">
              {needsAnalysis && (
                <Button
                  type="button"
                  size="md"
                  variant="ghost"
                  disabled={!isReady || isPending}
                  onClick={runAnalysis}
                >
                  {busyAction === "analysis" ? "Analisando..." : "Gerar análise"}
                </Button>
              )}
              {hasEnoughContext && (
                <>
                  <select
                    value={selectedDraftType}
                    onChange={(event) =>
                      setSelectedDraftType(event.target.value as DraftType)
                    }
                    aria-label="Tipo de peça"
                    disabled={isPending}
                    className="h-9 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)]"
                  >
                    {CASE_DRAFT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {DRAFT_TYPE_LABELS[option]}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="md"
                    variant="secondary"
                    disabled={!isReady || isPending}
                    onClick={generateDraft}
                  >
                    {busyAction === "draft"
                      ? "Redigindo..."
                      : `Redigir ${DRAFT_TYPE_LABELS[selectedDraftType].toLowerCase()}`}
                  </Button>
                </>
              )}
              <Button
                type="button"
                size="md"
                variant="primary"
                onClick={sendMessage}
                disabled={!command.trim() || isPending}
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
    return `${greeting} Me diga o que você quer fazer neste caso: analisar os fatos, organizar a estratégia ou redigir uma peça. Se já houver um documento-base, descreva o que chegou.`;
  }

  if (isJudicial && courtProcessCount === 0) {
    return `${greeting} Qual documento ou informação vamos trabalhar primeiro? Se houver número CNJ, podemos vincular o processo depois.`;
  }

  if (timelineCount === 0 && gapCount === 0) {
    return `Vi ${evidenceCount} documento${evidenceCount !== 1 ? "s" : ""} no caso. O próximo passo é gerar a análise para mapear fatos, riscos e lacunas.`;
  }

  if (draftCount > 0) {
    return `Há ${draftCount} rascunho${draftCount > 1 ? "s" : ""} no caso, ${pendingDraftCount} pendente${pendingDraftCount !== 1 ? "s" : ""} de revisão.`;
  }

  if (timelineCount > 0 || gapCount > 0) {
    const firstGap = gapPrompts[0];
    if (firstGap) {
      return `A análise tem ${timelineCount} fato${timelineCount !== 1 ? "s" : ""} e ${gapCount} lacuna${gapCount !== 1 ? "s" : ""}. Primeira pergunta: ${firstGap}`;
    }
    return `A análise tem ${timelineCount} fato${timelineCount !== 1 ? "s" : ""}. Posso gerar uma minuta para revisão humana.`;
  }

  return "Posso organizar a análise ou gerar uma primeira minuta para revisão.";
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
  draftTypeLabel,
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
  draftTypeLabel: string;
}) {
  if (!isReady) {
    return "A IA ainda não está disponível para executar ações. Quando a configuração estiver pronta, eu conduzo a análise e a minuta por aqui.";
  }

  const normalized = input.toLowerCase();
  const noteCount = notes.filter((note) => note.trim().length > 8).length;

  if (looksLikeDraftRequest(input) && !hasMinimumDraftContext({
    conversationNotes: notes,
    evidenceCount,
    timelineCount,
    gapCount,
  })) {
    return "Eu consigo redigir, mas ainda falta base. Me diga primeiro: qual documento chegou, qual prazo existe e qual é o pedido ou acusação da outra parte?";
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
    return `Tenho contexto suficiente para uma ${draftTypeLabel.toLowerCase()}. Já há minuta pendente de revisão; posso gerar nova versão se você quiser ajustar a estratégia.`;
  }

  return `Tenho contexto suficiente para preparar uma ${draftTypeLabel.toLowerCase()}. Se quiser, escreva “gerar peça” ou clique em Gerar peça; ela ficará como rascunho pendente de revisão humana.`;
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

function hasMinimumDraftContext({
  conversationNotes,
  evidenceCount,
  timelineCount,
  gapCount,
}: {
  conversationNotes: string[];
  evidenceCount: number;
  timelineCount: number;
  gapCount: number;
}) {
  const notes = conversationNotes
    .map((note) => note.trim())
    .filter((note) => note.length > 8);
  const combinedLength = notes.join(" ").length;

  if (notes.length >= 3) return true;
  if (combinedLength >= 180) return true;
  if (evidenceCount > 0 && notes.length >= 1) return true;
  if ((timelineCount > 0 || gapCount > 0) && notes.length >= 1) return true;
  return false;
}
