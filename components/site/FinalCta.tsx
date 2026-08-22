"use client";

import Link from "next/link";

export function FinalCta() {
  return (
    <section className="bg-slate-950 py-20 sm:py-28 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
        <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-400/20 px-3.5 py-1 text-xs font-semibold text-blue-300">
          Operação Inteligente &amp; Rigor Forense
        </span>
        <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
          Assuma o controle operacional do seu contencioso hoje.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-slate-400 leading-relaxed">
          Estruture seu primeiro caso real em minutos. Crie a conta do seu escritório e experimente a velocidade e a precisão do JuriAI na prática.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/cadastro"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] px-8 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] shadow-lg shadow-blue-600/30"
          >
            Criar conta do escritório →
          </Link>
          <Link
            href="/demo/dashboard"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-[var(--radius)] border border-slate-700 bg-slate-900 px-6 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            Ver demonstração interativa
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-500 font-mono">
          Sem necessidade de cartão de crédito. Acesso imediato ao Cockpit.
        </p>
      </div>
    </section>
  );
}

