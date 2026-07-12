"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { NormalizedItem } from "@/lib/legal-monitoring/types";
import {
  getPublicationLinkTargets,
  linkPublicationToCase,
  type CaseLinkOption,
} from "@/app/actions/monitoring";

/* Fase 3: seletor de caso para vincular uma publicação da Inbox.
 * A confirmação humana aqui é a aprovação: a IA não decide nada. */

type Phase = "loading" | "choosing" | "submitting" | "done" | "error";

export function LinkToCaseDialog({
  item,
  onClose,
}: {
  item: NormalizedItem;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [targets, setTargets] = useState<CaseLinkOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const options = await getPublicationLinkTargets(item.numeroProcesso);
        if (!active) return;
        setTargets(options);
        const suggested = options.find((o) => o.matchedByCnj);
        setSelectedId(suggested?.id ?? options[0]?.id ?? "");
        setPhase("choosing");
      } catch (err) {
        if (!active) return;
        setMessage(
          err instanceof Error ? err.message : "Falha ao carregar casos.",
        );
        setPhase("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [item.numeroProcesso]);

  async function handleConfirm() {
    if (!selectedId) return;
    setPhase("submitting");
    try {
      const result = await linkPublicationToCase(selectedId, {
        source: item.source,
        externalId: item.externalId,
        sourceUrl: item.sourceUrl,
        tribunal: item.tribunal,
        numeroProcesso: item.numeroProcesso,
        tipo: item.tipo,
        texto: item.texto,
        dataDisponibilizacao: item.dataDisponibilizacao,
        dataPublicacao: item.dataPublicacao,
        destinatarios: item.destinatarios,
        advogados: item.advogados,
      });
      setMessage(
        result.status === "created"
          ? "Publicação vinculada ao caso. Um evento foi criado na timeline para validação nos autos. Nenhum prazo automático foi criado."
          : "Esta publicação já estava vinculada a este workspace. Nada foi duplicado.",
      );
      setPhase("done");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Falha ao vincular publicação.",
      );
      setPhase("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Vincular publicação ao caso
          </h2>
          <button
            onClick={onClose}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Fechar ✕
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--muted)]">
            <span className="font-mono font-semibold text-[var(--foreground)]">
              {item.numeroProcesso || "Nº não informado"}
            </span>{" "}
            • {item.tribunal || "tribunal n/d"} • {item.tipo}
          </div>

          {phase === "loading" && (
            <p className="py-6 text-center text-sm text-[var(--muted)]">
              Carregando casos...
            </p>
          )}

          {(phase === "choosing" || phase === "submitting") && (
            <>
              {targets.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--muted)]">
                  Nenhum caso acessível para vincular.
                </p>
              ) : (
                <div className="grid max-h-64 gap-2 overflow-y-auto">
                  {targets.map((t) => (
                    <label
                      key={t.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                        selectedId === t.id
                          ? "border-[var(--primary)] bg-[var(--primary)]/5"
                          : "border-[var(--border)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="case"
                        value={t.id}
                        checked={selectedId === t.id}
                        onChange={() => setSelectedId(t.id)}
                      />
                      <span className="flex-1">
                        <span className="font-medium text-[var(--foreground)]">
                          {t.title}
                        </span>
                        <span className="block text-xs text-[var(--muted)]">
                          {t.clientName}
                        </span>
                      </span>
                      {t.matchedByCnj && (
                        <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          CNJ compatível
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Cancelar
                </button>
                <Button
                  onClick={handleConfirm}
                  disabled={phase === "submitting" || !selectedId}
                >
                  {phase === "submitting" ? "Vinculando..." : "Confirmar vínculo"}
                </Button>
              </div>
            </>
          )}

          {phase === "done" && (
            <div className="py-4">
              <p className="text-sm text-[var(--foreground)]">{message}</p>
              <div className="mt-4 flex justify-end">
                <Button onClick={onClose}>Concluir</Button>
              </div>
            </div>
          )}

          {phase === "error" && (
            <div className="py-4">
              <p className="text-sm text-[var(--danger)]">{message}</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
