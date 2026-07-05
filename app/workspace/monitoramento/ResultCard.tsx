"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { NormalizedItem } from "@/lib/legal-monitoring/types";
import { LinkToCaseDialog } from "./LinkToCaseDialog";

export function ResultCard({ item }: { item: NormalizedItem }) {
  const [showRaw, setShowRaw] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showLink, setShowLink] = useState(false);

  // Sanitização rigorosa: apenas whitelist de campos normalizados
  const sanitizedJson = {
    source: item.source,
    externalId: item.externalId,
    sourceUrl: item.sourceUrl,
    tribunal: item.tribunal,
    numeroProcesso: item.numeroProcesso,
    dataDisponibilizacao: item.dataDisponibilizacao,
    dataPublicacao: item.dataPublicacao,
    tipo: item.tipo,
    destinatarios: item.destinatarios,
    advogados: item.advogados,
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-start justify-between border-b border-[var(--border)] bg-[var(--background)] px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded bg-[var(--foreground)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--surface)]">
            {item.tribunal}
          </span>
          <span className="font-mono text-sm font-semibold tracking-tight text-[var(--foreground)]">
            {item.numeroProcesso || "Nº não informado"}
          </span>
          <span className="text-xs text-[var(--muted)]">•</span>
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            {item.tipo}
          </span>
        </div>
        <div className="text-right text-xs text-[var(--muted)]">
          {item.dataPublicacao || item.dataDisponibilizacao}
        </div>
      </div>

      <div className="px-5 py-4">
        <div 
          className={`whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--foreground)] ${!expanded ? "line-clamp-4" : ""}`}
        >
          {item.texto}
        </div>
        
        {item.texto.length > 300 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            {expanded ? "Recolher texto ↑" : "Ler texto completo ↓"}
          </button>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {item.destinatarios.map((d, i) => (
            <span key={i} className="rounded-full bg-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]">
              Partes: {d}
            </span>
          ))}
          {item.advogados.map((a, i) => (
            <span key={i} className="rounded-full border border-[var(--primary)] px-2.5 py-1 text-[11px] font-medium text-[var(--primary)]">
              Adv: {a}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--background)]/50 px-5 py-2">
        <a 
          href={item.sourceUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[11px] text-[var(--muted)] hover:text-[var(--primary)]"
        >
          Fonte Original ↗
        </a>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLink(true)}
            className="text-[10px] font-semibold uppercase tracking-widest text-[var(--primary)] hover:underline"
          >
            Vincular ao caso
          </button>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {showRaw ? "Ocultar JSON" : "Ver JSON Sanitizado"}
          </button>
        </div>
      </div>

      {showRaw && (
        <div className="border-t border-[var(--border)] bg-zinc-900 p-4 text-[10px] text-zinc-400 overflow-x-auto">
          <pre>{JSON.stringify(sanitizedJson, null, 2)}</pre>
        </div>
      )}

      {showLink && (
        <LinkToCaseDialog item={item} onClose={() => setShowLink(false)} />
      )}
    </Card>
  );
}
