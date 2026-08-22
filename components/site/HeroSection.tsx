"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-[var(--border)] bg-white"
    >
      <div className="grid lg:min-h-[min(90vh,54rem)] lg:grid-cols-12">
        {/* Coluna de Conteúdo (6 colunas) */}
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:col-span-6 lg:px-14 lg:py-24 xl:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          <div className="max-w-xl">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              Inteligência Operacional Cível B2B
            </div>

            {/* Headline de Alto Impacto */}
            <h1 className="mt-5 font-serif text-[2.15rem] font-semibold leading-[1.12] tracking-tight text-[var(--foreground)] sm:text-[2.75rem] lg:text-[3rem]">
              Elimine o custo e o retrabalho de estagiário no seu contencioso cível.
            </h1>

            {/* Subtítulo Sóbrio */}
            <p className="mt-5 text-[1.05rem] leading-relaxed text-[var(--muted)] sm:text-lg">
              Uma esteira que estrutura a linha do tempo fática, cruza provas e redige minutas no papel timbrado oficial do seu escritório. Sem inventar fatos, sem citar jurisprudência falsa.
            </p>

            {/* Ações / CTAs Duplos */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/cadastro"
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)] shadow-md shadow-blue-600/15"
              >
                Criar conta do escritório →
              </Link>
              <Link
                href="/demo/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius)] border border-[var(--border-strong)] bg-white px-5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background)]"
              >
                Ver demonstração do cockpit
              </Link>
            </div>

            {/* Garantia / Ancoragem de Valor */}
            <div className="mt-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1 text-emerald-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-xs text-[var(--muted)] leading-relaxed">
                  <span className="font-semibold text-[var(--foreground)]">Garantia Operacional:</span> Se em 30 dias a montagem de um dossiê real não for mais rápida e segura que o processo atual da sua equipe, estendemos o suporte gratuitamente.
                </div>
              </div>
            </div>

            {/* Ancoragem de Custo vs Folha */}
            <div className="mt-6 flex items-center gap-6 text-xs text-[var(--muted)] font-mono">
              <div>
                <span className="font-bold text-[var(--foreground)]">Piso R$ 497/mês</span> vs Analista ~R$ 4.200
              </div>
              <div className="h-3 w-px bg-[var(--border-strong)]" />
              <div>
                <span className="font-bold text-emerald-600">Economia real de até 95%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Visual: Imagem Documental Editorial (6 colunas) */}
        <div className="relative hidden lg:col-span-6 lg:block border-l border-[var(--border)] overflow-hidden bg-slate-900">
          <Image
            src="/site/hero-human-desk.jpg"
            alt="Mesa de trabalho com documentos jurídicos em luz natural"
            fill
            priority
            className="object-cover object-center opacity-85 mix-blend-luminosity filter contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          
          {/* Card Editorial Overlay */}
          <div className="absolute bottom-8 left-8 right-8 z-10 rounded-[var(--radius)] border border-white/10 bg-slate-950/80 backdrop-blur-md p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400">
                Padrão Forense Auditado
              </span>
              <span className="text-[10px] rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-400 font-mono">
                100% Grounded
              </span>
            </div>
            <p className="font-serif text-lg font-medium leading-snug">
              "A IA sugere a estrutura fática e as lacunas. O advogado titular valida e aprova. Toda saída possui cadeia de custódia rastreável."
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
              <span>Isolamento por Subconta</span>
              <span>Conforme com Sigilo OAB</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

