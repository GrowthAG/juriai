"use client";

import Link from "next/link";
import { useState } from "react";

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="precos" className="border-b border-[var(--border)] bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
            Planos &amp; Investimento
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Preço fixo por escritório. Sem cobrança por caso.
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] leading-relaxed">
            Uma fração do custo de um estagiário ou analista júnior, com capacidade operacional contínua e isolamento seguro de dados.
          </p>

          {/* Toggle Mensal / Anual */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${!annual ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
              Mensal
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-900 transition-colors focus:outline-none"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  annual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-medium ${annual ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
              Anual <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">2 meses grátis</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {/* Card 1: Plano Pro */}
          <div className="flex flex-col justify-between rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] p-8 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold text-[var(--foreground)]">Plano Pro</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 font-mono">
                  Boutique / Pequeno Porte
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Para escritórios boutique com 1 a 3 advogados focados em agilidade processual.
              </p>

              <div className="mt-6 flex items-baseline gap-1 border-y border-[var(--border)] py-4">
                <span className="text-sm font-medium text-[var(--muted)]">R$</span>
                <span className="text-4xl font-bold tracking-tight text-[var(--foreground)] font-mono">
                  {annual ? "497" : "597"}
                </span>
                <span className="text-xs text-[var(--muted)]">/mês no plano {annual ? "anual" : "mensal"}</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-[var(--foreground)]">
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span> Até 50 casos ativos simultâneos
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span> Até 3 advogados no workspace
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span> Extração de fatos e linha do tempo com IA
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span> Geração de minutas com pedidos em 3 níveis
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span> Consulta DataJud em 90+ tribunais
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--border)]">
              <Link
                href="/cadastro"
                className="flex h-11 w-full items-center justify-center rounded-[var(--radius)] border border-[var(--border-strong)] bg-white text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--background)] shadow-sm"
              >
                Criar conta no Plano Pro →
              </Link>
            </div>
          </div>

          {/* Card 2: Plano Gold (Destaque) */}
          <div className="relative flex flex-col justify-between rounded-[var(--radius)] border-2 border-[var(--primary)] bg-[var(--surface)] p-8 shadow-lg shadow-blue-600/10">
            <div className="absolute -top-3 right-6 rounded-full bg-[var(--primary)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Mais Escolhido
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold text-[var(--foreground)]">Plano Gold</h3>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[var(--primary)] font-mono">
                  Média &amp; Grande Banca
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Para bancas que precisam de volume ilimitado, copiloto de estratégia e controle de equipe.
              </p>

              <div className="mt-6 flex items-baseline gap-1 border-y border-[var(--border)] py-4">
                <span className="text-sm font-medium text-[var(--muted)]">R$</span>
                <span className="text-4xl font-bold tracking-tight text-[var(--primary)] font-mono">
                  {annual ? "697" : "797"}
                </span>
                <span className="text-xs text-[var(--muted)]">/mês no plano {annual ? "anual" : "mensal"}</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-[var(--foreground)]">
                <li className="flex items-center gap-2.5 font-medium">
                  <span className="text-emerald-600 font-bold">✓</span> Casos ativos ilimitados
                </li>
                <li className="flex items-center gap-2.5 font-medium">
                  <span className="text-emerald-600 font-bold">✓</span> Membros e estagiários ilimitados
                </li>
                <li className="flex items-center gap-2.5 font-medium">
                  <span className="text-emerald-600 font-bold">✓</span> Copilot conversacional dedicado no caso
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span> Auditoria obrigatória de conformidade OAB
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span> Papel timbrado e identidade visual personalizada
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span> Suporte prioritário via WhatsApp com time técnico
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--border)]">
              <Link
                href="/cadastro"
                className="flex h-11 w-full items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] text-xs font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)] shadow-md shadow-blue-600/20"
              >
                Criar conta no Plano Gold →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
