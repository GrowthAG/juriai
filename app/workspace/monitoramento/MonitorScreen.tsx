"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { ProbeResult, ProbeParams } from "@/lib/legal-monitoring/types";
import { ResultCard } from "./ResultCard";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--primary)] disabled:opacity-50";

export function MonitorScreen() {
  const [source, setSource] = useState<"djen" | "datajud">("djen");
  const [oab, setOab] = useState("");
  const [ufOab, setUfOab] = useState("");
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [limit, setLimit] = useState("10");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProbeResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload: ProbeParams = {
      source,
      oab: oab.trim() || undefined,
      ufOab: ufOab.trim().toUpperCase() || undefined,
      numeroProcesso: numeroProcesso.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: parseInt(limit) || 10,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout total

    try {
      const resp = await fetch("/api/monitoring/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await resp.json();

      if (!resp.ok) {
        if (resp.status === 401 || resp.status === 403) {
          setError("Você não tem permissão para realizar esta consulta ou sua sessão expirou.");
        } else if (resp.status === 400) {
          setError(data.error || "Dados de consulta inválidos. Verifique os campos.");
        } else if (resp.status >= 500) {
          setError(data.error || "O serviço de consulta (DJEN/DataJud) está lento ou com instabilidade. Tente reduzir o período para 1 dia.");
        } else {
          setError(data.error || "Falha ao realizar consulta.");
        }
      } else {
        setResult(data);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("O DJEN demorou para responder. Tente consultar 1 dia por vez ou reduzir o limite.");
      } else {
        setError("Erro de rede ou servidor ao consultar API.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8">
      <Card className="p-6">
        <form onSubmit={handleSearch} className="grid gap-6">
          <div className="flex gap-2 border-b border-[var(--border)] pb-4">
            <button
              type="button"
              onClick={() => setSource("djen")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                source === "djen"
                  ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Publicações (DJEN)
            </button>
            <button
              type="button"
              onClick={() => setSource("datajud")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                source === "datajud"
                  ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Processos (DataJud)
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {source === "djen" ? (
              <>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">OAB</label>
                  <input
                    value={oab}
                    onChange={(e) => setOab(e.target.value)}
                    placeholder="Ex: 123456"
                    className={inputClass}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">UF</label>
                  <input
                    value={ufOab}
                    onChange={(e) => setUfOab(e.target.value)}
                    placeholder="Ex: SP"
                    maxLength={2}
                    className={inputClass}
                  />
                </div>
              </>
            ) : null}
            <div className={source === "djen" ? "col-span-1" : "col-span-3"}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Nº Processo (CNJ)</label>
              <input
                value={numeroProcesso}
                onChange={(e) => setNumeroProcesso(e.target.value)}
                placeholder="0000000-00.0000.0.00.0000"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Data Início</label>
              <input
                type="date"
                required
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Data Fim</label>
              <input
                type="date"
                required
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Limite (Máx 20)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button disabled={loading} className="w-full sm:w-auto">
              {loading ? "Consultando..." : "Consultar Fonte"}
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <div className="rounded-lg border border-[var(--danger)] bg-red-50 p-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {result?.items.map((item) => (
          <ResultCard key={item.externalId} item={item} />
        ))}

        {result && result.items.length === 0 && !loading && (
          <div className="py-12 text-center text-[var(--muted)]">
            Nenhum resultado encontrado para os critérios informados.
          </div>
        )}
        
        {result && (
          <div className="mt-4 flex flex-col gap-2">
             {result.warnings.map((w, i) => (
               <p key={i} className="text-xs text-[var(--warning)] italic">⚠️ {w}</p>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
