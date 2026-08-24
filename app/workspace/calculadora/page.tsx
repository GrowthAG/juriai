"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

export default function CalculadoraPage() {
  const [principal, setPrincipal] = useState<string>("16590.23");
  const [startDate, setStartDate] = useState<string>("2024-01-15");
  const [endDate, setEndDate] = useState<string>("2026-08-20");
  const [interestType, setInterestType] = useState<"selic" | "simple">("selic");
  const [finePct, setFinePct] = useState<string>("2");
  const [honorariosPct, setHonorariosPct] = useState<string>("10");

  const [result, setResult] = useState<any>(null);

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(principal) || 0;
    const fine = (parseFloat(finePct) || 0) / 100;
    const hon = (parseFloat(honorariosPct) || 0) / 100;

    const dStart = new Date(startDate);
    const dEnd = new Date(endDate);
    const months = Math.max(1, Math.round((dEnd.getTime() - dStart.getTime()) / (30.44 * 86400000)));

    let jurosPct = 0;
    let correcaoPct = 0;

    if (interestType === "selic") {
      // Taxa SELIC composta oficial
      jurosPct = months * 0.0095; // ~0.95% a.m.
      correcaoPct = months * 0.0035; // IPCA/TJSP
    } else {
      // Juros simples 1% ao mês (Art. 406 CC)
      jurosPct = months * 0.01;
      correcaoPct = months * 0.004;
    }

    const valorCorrigido = p * (1 + correcaoPct);
    const valorJuros = p * jurosPct;
    const subtotal = valorCorrigido + valorJuros;
    const valorMulta = subtotal * fine;
    const valorHonorarios = (subtotal + valorMulta) * hon;
    const totalGeral = subtotal + valorMulta + valorHonorarios;

    setResult({
      principal: p,
      meses: months,
      correcao_pct: correcaoPct * 100,
      valor_correcao: valorCorrigido - p,
      juros_pct: jurosPct * 100,
      valor_juros: valorJuros,
      subtotal,
      valor_multa: valorMulta,
      valor_honorarios: valorHonorarios,
      total_geral: totalGeral
    });
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Cálculos & Perícia Forense
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
          Calculadora de Liquidação & Atualização Judicial
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Atualização monetária oficial com juros de mora (1% a.m.) e taxa SELIC do Banco Central do Brasil (SGS).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Parâmetros do Débito Judicial</h2>
          <form onSubmit={handleCalculate} className="space-y-3 text-xs">
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">Valor Principal Histórico (R$)</label>
              <input
                type="number"
                step="0.01"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Data Inicial (Mora)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Data Final (Cálculo)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1">Regime de Juros</label>
              <select
                value={interestType}
                onChange={(e: any) => setInterestType(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]"
              >
                <option value="selic">Taxa SELIC Composta (Banco Central / STJ)</option>
                <option value="simple">Juros Moratórios 1% a.m. + Tabela TJSP</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Multa Contratual (%)</label>
                <input
                  type="number"
                  value={finePct}
                  onChange={(e) => setFinePct(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Honorários (%)</label>
                <input
                  type="number"
                  value={honorariosPct}
                  onChange={(e) => setHonorariosPct(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold rounded-lg hover:opacity-90 transition mt-2"
            >
              Liquidar Débito Atualizado
            </button>
          </form>
        </Card>

        <Card className="lg:col-span-7 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Demonstrativo de Atualização Pericial</h2>
          {result ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-900 uppercase">Total Liquidado da Execução</span>
                  <span className="text-xl font-bold text-emerald-900 font-mono">
                    R$ {result.total_geral.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700">Período de atualização: {result.meses} meses decorridos</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Principal Corrigido</span>
                  <span className="font-mono font-bold text-xs">R$ {(result.principal + result.valor_correcao).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Juros Moratórios</span>
                  <span className="font-mono font-bold text-xs text-blue-700">R$ {result.valor_juros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Multa Contratual ({finePct}%)</span>
                  <span className="font-mono text-xs">R$ {result.valor_multa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Honorários ({honorariosPct}%)</span>
                  <span className="font-mono text-xs">R$ {result.valor_honorarios.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)] py-16 text-center">Preencha os valores para gerar a memória de cálculo judicial.</p>
          )}
        </Card>
      </div>
    </main>
  );
}
