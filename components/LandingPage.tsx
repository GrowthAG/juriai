"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/* ================================================================
   LANDING PAGE - JuriAI
   Design System: Editorial Forense / Clean SaaS (Shadcn)
   Paleta: #FFFFFF / #F8FAFC / #0F2B48 / #145AFF / #059669 / #D97706
   Tipografia: Serif (H1/H2) + Inter (corpo) + Roboto Mono (dados)
   Proibicoes: ZERO emojis | ZERO travessoes | ZERO foto generica
   ================================================================ */

export function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);

  const steps = [
    {
      num: "01",
      title: "Custodia de Provas",
      desc: "Upload de contratos, e-mails, boletos, audios e prints. Cada arquivo recebe hash SHA-256 para garantir integridade e rastreabilidade forense.",
    },
    {
      num: "02",
      title: "Matriz Fato x Prova",
      desc: "A IA extrai cada fato alegado e o vincula automaticamente ao documento de origem. Fatos sem prova recebem a marca [FATO ALEGADO].",
    },
    {
      num: "03",
      title: "Auditoria de Lacunas",
      desc: "O sistema identifica automaticamente o que falta para cada tese prosperar. O advogado sabe exatamente o que precisa antes de ajuizar.",
    },
    {
      num: "04",
      title: "Minuta em Papel Timbrado",
      desc: "Peticao inicial ou contestacao exportada no papel timbrado oficial da advocacia. Revisao do socio titular em minutos, nao em horas.",
    },
  ];

  const problems = [
    {
      num: "01",
      title: "Releitura eterna da documentacao",
      desc: "O socio titular passa 3 a 4 horas relendo e-mails, contratos e autos para entender o caso. Esse tempo nao cobra hora. E puro custo operacional.",
    },
    {
      num: "02",
      title: "Modelos de Word desatualizados",
      desc: "A peticao pronta comeca a ficar defasada no dia em que e escrita. Jurisprudencia muda, tese evolui e o modelo do Word nao acompanha.",
    },
    {
      num: "03",
      title: "IAs genericas que inventam fatos",
      desc: "ChatGPT nao sabe a diferenca entre fato e alegacao. Comeca a citar jurisprudencia que nao existe. O nome do escritorio sai em uma peca com cites falsos.",
    },
  ];

  const trustPillars = [
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      label: "Sigilo Profissional",
      sub: "Dados nunca saem do escritorio",
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      label: "Anti-Alucinacao",
      sub: "[FATO ALEGADO] para o que nao tem prova",
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
      label: "DataJud CJF",
      sub: "90+ tribunais integrados",
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      label: "Papel Timbrado",
      sub: "Exportacao automatica no timbre da banca",
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      label: "Conformidade LGPD",
      sub: "Base legal contrato Art. 7 V",
    },
  ];

  const faqs = [
    {
      q: "O advogado pode ser punido pela OAB por usar IA juridica?",
      a: "A OAB, atraves da Recomendacao 001/2024 e do TED da OAB SP (parecer de abril/2026), permite o uso de IA desde que a saida seja revisada integralmente antes de uso em processo. O advogado permanece responsavel. O JuriAI nunca substitui o julgamento profissional: reduz o trabalho braçal de organizacao factual para que o socio titular dedique mais tempo a estrategia.",
    },
    {
      q: "Onde os dados dos meus clientes sao armazenados?",
      a: "Todos os dados sao processados em infraestrutura em territorio brasileiro. A base legal e o contrato de prestacao de servicos (Art. 7, V da LGPD). Os arquivos recebe hash SHA-256 no momento do upload e nunca sao compartilhados com terceiros.",
    },
    {
      q: "O JuriAI garante que nao vai inventar jurisprudencia?",
      a: "O mecanismo de Anti-Alucinacao do JuriAI marca todo fato sem documento comprobatorio como [FATO ALEGADO]. A IA nao gera minuta final sem que o socio titular revise. O sistema nunca gera citacao de norma ou precedente: isso e responsabilidade do advogado, como determina o Codigo de Etica da OAB.",
    },
    {
      q: "Em quanto tempo consigo ver resultado apos criar a conta?",
      a: "O primeiro caso pode ser estruturado em menos de 15 minutos apos o upload dos documentos. A matriz Fato x Prova e gerada automaticamente. A primeira minuta e exportada em minutos.",
    },
    {
      q: "Preciso ter experiencia com tecnologia para usar?",
      a: "Nao. O JuriAI foi desenhado para o advogado que quer resultado sem aprender comandos ou engenharia de prompt. Sao 3 etapas: upload de documentos, revisao da matriz e exportacao da minuta.",
    },
    {
      q: "Posso testar antes de assinar um plano?",
      a: "Sim. O periodo de teste gratuito de 14 dias nao exige cartao de credito upfront. Voce tem acesso completo ao Plano Pro durante o trial.",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/gavel-tile.svg" width={28} height={28} alt="JuriAI" unoptimized />
            <span className="font-serif text-lg font-semibold tracking-tight text-slate-950">
              Juri<span className="text-blue-600 font-bold">AI</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#produto" className="text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors">Produto</a>
            <a href="#esteira" className="text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors">Esteira Forense</a>
            <a href="#precos" className="text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors">Planos</a>
            <a href="#seguranca" className="text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors">Seguranca</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-2 transition-colors">Entrar</Link>
            <Link href="/cadastro" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors">Criar conta</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="produto" className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#145AFF" strokeWidth="0.5"/>
              </pattern>
              <radialGradient id="glow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#145AFF" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#145AFF" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
            <circle cx="50%" cy="50%" r="400" fill="url(#glow)"/>
            <circle cx="20%" cy="30%" r="4" fill="#145AFF" opacity="0.7"/>
            <circle cx="80%" cy="20%" r="3" fill="#145AFF" opacity="0.5"/>
            <circle cx="15%" cy="70%" r="3.5" fill="#145AFF" opacity="0.6"/>
            <circle cx="85%" cy="65%" r="4" fill="#145AFF" opacity="0.4"/>
            <circle cx="50%" cy="15%" r="3" fill="#145AFF" opacity="0.5"/>
            <circle cx="50%" cy="85%" r="3.5" fill="#145AFF" opacity="0.4"/>
            <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#145AFF" strokeWidth="0.8" opacity="0.4"/>
            <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="#145AFF" strokeWidth="0.8" opacity="0.4"/>
            <line x1="15%" y1="70%" x2="50%" y2="50%" stroke="#145AFF" strokeWidth="0.8" opacity="0.4"/>
            <line x1="85%" y1="65%" x2="50%" y2="50%" stroke="#145AFF" strokeWidth="0.8" opacity="0.4"/>
            <line x1="50%" y1="15%" x2="50%" y2="50%" stroke="#145AFF" strokeWidth="0.8" opacity="0.4"/>
            <line x1="50%" y1="85%" x2="50%" y2="50%" stroke="#145AFF" strokeWidth="0.8" opacity="0.4"/>
          </svg>
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Sigilo Profissional
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>Anti-Alucinacao
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>90+ Tribunais
                </span>
              </div>

              <h1 className="font-serif text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[2.75rem] xl:text-6xl leading-tight">
                Dobre a capacidade operativa do seu escritorio sem contratar mais um funcionario.
              </h1>

              <p className="mt-6 text-base text-slate-400 leading-relaxed max-w-lg">
                A esteira forense que estrutura fatos, audita lacunas probatorias e redige peticoes no seu papel timbrado. O que nao tem documento comprovado aparece como <strong className="text-white font-semibold">[FATO ALEGADO]</strong>. O que tem, entra na peca com rastreabilidade.
              </p>

              <div className="mt-8 rounded-lg border border-slate-700 bg-slate-900/80 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Analista juridico em CLT</p>
                    <p className="text-2xl font-semibold text-slate-400 mt-1">
                      <span className="text-sm font-normal text-slate-500">R$</span> 6.000
                      <span className="text-sm font-normal text-slate-500">/mes</span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Encargos, FGTS, INSS, VT, plano de saude</p>
                  </div>
                  <div className="text-slate-600 font-bold text-xl px-4">vs</div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400">JuriAI Pro</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      <span className="text-sm font-normal text-slate-400">R$</span> 497
                      <span className="text-sm font-normal text-slate-400">/mes</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Casos ilimitados, operacao 24h</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/cadastro" className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-colors">
                  Criar conta do escritorio
                </Link>
                <Link href="/demo/dashboard" className="inline-flex h-12 items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                  Ver demonstracao do cockpit
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <PipelineDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {trustPillars.map((p) => (
              <div key={p.label} className="flex items-start gap-3">
                <div className="mt-0.5 text-blue-600 shrink-0" dangerouslySetInnerHTML={{ __html: p.icon }} />
                <div>
                  <p className="text-xs font-semibold text-slate-950">{p.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">O diagnostico</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              O trabalho braçal que come o resultado do escritorio.
            </h2>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">
              Tres gargalos que custam caro ao socio titular em tempo, dinheiro e risco disciplinar.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {problems.map((p) => (
              <div key={p.num} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500">{p.num}</span>
                  <h3 className="font-semibold text-sm text-slate-950 leading-snug">{p.title}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESTEIRA FORENSE */}
      <section id="esteira" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">A esteira forense</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Quatro etapas que transformam documento em peca.
            </h2>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">
              De contratos e e-mails a uma minuta auditada, rastreavel e pronta para revisao do socio.
            </p>
          </div>

          <div className="mt-10">
            <div className="flex overflow-x-auto gap-1 border-b border-slate-200 mb-8">
              {steps.map((s, i) => (
                <button
                  key={s.num}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${
                    activeTab === i ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="font-mono text-[10px]">{s.num}</span>
                  {s.title}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500 mb-4">
                    <span className="font-mono">{steps[activeTab].num}</span>
                    Etapa {activeTab + 1} de 4
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-slate-950">{steps[activeTab].title}</h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{steps[activeTab].desc}</p>
                </div>
                <div className="w-full sm:w-56 shrink-0">
                  <StepDiagram step={activeTab} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">O cockpit</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              O produto que estrutura o dossiê probatorio.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300"/>
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300"/>
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300"/>
                </div>
                <span className="text-[11px] text-slate-500 font-mono ml-2">juriai.app / casos / novo</span>
              </div>
              <Image src="/site/juriai-wizard-real.png" width={1512} height={945} alt="Wizard de novo caso do JuriAI" className="w-full h-auto" unoptimized />
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300"/>
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300"/>
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300"/>
                </div>
                <span className="text-[11px] text-slate-500 font-mono ml-2">juriai.app / workspace</span>
              </div>
              <Image src="/site/juriai-dashboard-real.png" width={1512} height={945} alt="Dashboard operacional do JuriAI" className="w-full h-auto" unoptimized />
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/demo/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
              Ver cockpit operacional completo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">Precificacao</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Sem truque de primeiro mes baratex.
            </h2>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">Preco fixo, transparente. Voce sabe exatamente o que recebe.</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 max-w-3xl mx-auto">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">JuriAI Pro</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-4xl font-bold text-slate-950">R$ 497</span>
                  <span className="text-sm text-slate-500 mb-1">/mes</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Cobrado mensalmente. Cancele quando quiser.</p>
              </div>
              <ul className="mt-6 space-y-3">
                {["Casos ilimitados","Upload ilimitado de documentos","Matriz Fato x Prova automatica","Auditoria de lacunas probatorias","Exportacao em papel timbrado","90+ tribunais DataJud integrados","Sigilo SHA-256 por arquivo","Suporte por e-mail em 24h"].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <svg className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="mt-8 flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-50 transition-colors">Comecar teste gratis</Link>
              <p className="text-center text-[11px] text-slate-400 mt-3">14 dias gratis. Sem cartao de credito upfront.</p>
            </div>

            <div className="rounded-xl border-2 border-blue-600 bg-white p-8 shadow-md shadow-blue-600/10">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">JuriAI Gold</p>
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-600">Mais popular</span>
                </div>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-4xl font-bold text-slate-950">R$ 697</span>
                  <span className="text-sm text-slate-500 mb-1">/mes</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Cobrado mensalmente. Cancele quando quiser.</p>
              </div>
              <ul className="mt-6 space-y-3">
                {["Tudo do plano Pro","ate 5 subcontas (parceiros ou departamentos)","Pipeline de casos com visualizacao em grafico","Automacao de alertas de prazo processual","Historico de versoes de minutas","API de integracao com sistemas externos","Priority support (ate 4h)","Onboarding assistido por equipe JuriAI"].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <svg className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="mt-8 flex h-11 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors">Comecar teste gratis</Link>
              <p className="text-center text-[11px] text-slate-400 mt-3">14 dias gratis. Sem cartao de credito upfront.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Por que o JuriAI vence.</h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Caracteristica</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">JuriAI</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">Chatbot generico</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">Analista junior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { feat: "Custodia documental com hash", juriai: true, bot: false, analist: false },
                  { feat: "Matriz Fato x Prova automatica", juriai: true, bot: false, analist: false },
                  { feat: "Auditoria de lacunas antes da peca", juriai: true, bot: false, analist: false },
                  { feat: "[FATO ALEGADO] para o que nao tem prova", juriai: true, bot: false, analist: false },
                  { feat: "Exportacao em papel timbrado", juriai: true, bot: false, analist: false },
                  { feat: "Opera 24 horas / 7 dias", juriai: true, bot: true, analist: false },
                  { feat: "Custo mensal", juriai: "R$ 497", bot: "Gratuito ou R$ 127", analist: "R$ 6.000+" },
                  { feat: "Risco de erro por cansaco", juriai: false, bot: true, analist: true },
                  { feat: "Risco de jurisprudencia inventada", juriai: false, bot: true, analist: false },
                ].map((row, i) => (
                  <tr key={i} className="divide-x divide-slate-100">
                    <td className="px-6 py-4 text-slate-700">{row.feat}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.juriai === "boolean" ? (
                        row.juriai ? <span className="text-emerald-600 font-bold text-xs">Sim</span>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline text-slate-300"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      ) : <span className="font-semibold text-blue-700 text-xs">{row.juriai}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.bot === "boolean" ? (
                        row.bot ? <span className="text-emerald-600 font-bold text-xs">Sim</span>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline text-slate-300"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      ) : <span className="text-xs text-slate-500">{row.bot}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.analist === "boolean" ? (
                        row.analist ? <span className="text-amber-600 font-bold text-xs">Risco</span>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline text-slate-300"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      ) : <span className="text-xs text-slate-500">{row.analist}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="seguranca" className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">Perguntas frequentes</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              O que o socio titular precisa saber.
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq, i) => {
              const [open, setOpen] = useState(false);
              return (
                <div key={i} className="rounded-xl border border-slate-200 bg-white">
                  <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                    <span className="text-sm font-semibold text-slate-950 pr-4">{faq.q}</span>
                    <svg className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {open && (
                    <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Construa o dossiê do seu caso em minutos. Revise a peca em horas.
          </h2>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
            Comece com 14 dias gratis. Sem cartao de credito. Cancele quando quiser. O escritorio opera 24 horas enquanto voce dorme.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cadastro" className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-colors">
              Criar conta do escritorio
            </Link>
            <Link href="/demo/dashboard" className="inline-flex h-12 items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
              Ver demonstracao primeiro
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-500">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Image src="/brand/gavel-tile.svg" width={22} height={22} alt="JuriAI" unoptimized />
              <span className="font-serif text-sm font-semibold text-slate-300">Juri<span className="text-blue-400">AI</span></span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <a href="#" className="hover:text-slate-300 transition-colors">Politica de Privacidade</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Conformidade LGPD</a>
              <a href="mailto:contato@juriai.adv" className="hover:text-slate-300 transition-colors">contato@juriai.adv</a>
            </div>
          </div>
          <div className="mt-6 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-[11px] text-slate-600">JuriAI Solucoes Tecnologicas LTDA. CNPJ sob consulta. Todos os direitos reservados.</p>
            <p className="text-[11px] text-slate-600">Base legal: Contrato de Prestacao de Servicos Art. 7 V LGPD.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}

/* ================================================================
   HELPER COMPONENTS
   ================================================================ */

function PipelineDiagram() {
  return (
    <div className="relative rounded-2xl border border-slate-700 bg-slate-900/60 p-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="relative space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/80 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-[10px] font-mono font-bold text-slate-400">01</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">Contrato.pdf</p>
            <p className="text-[10px] text-slate-500 font-mono">sha256:a3f8c...</p>
          </div>
          <svg className="h-4 w-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div className="flex justify-center"><div className="h-4 w-px bg-slate-700" /></div>
        <div className="flex items-center gap-3 rounded-lg border border-amber-600/30 bg-amber-900/10 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-900/30 text-[10px] font-mono font-bold text-amber-400">02</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">[FATO ALEGADO]</p>
            <p className="text-[10px] text-amber-500">Clausula 4.2 sem prova</p>
          </div>
          <svg className="h-4 w-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div className="flex justify-center"><div className="h-4 w-px bg-slate-700" /></div>
        <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/80 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-[10px] font-mono font-bold text-slate-400">03</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">Fato vinculado</p>
            <p className="text-[10px] text-slate-500">Contrato.pdf / pagina 3</p>
          </div>
          <svg className="h-4 w-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div className="flex justify-center"><div className="h-4 w-px bg-slate-700" /></div>
        <div className="flex items-center gap-3 rounded-lg border border-blue-600/30 bg-blue-900/10 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-900/30 text-[10px] font-mono font-bold text-blue-400">04</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">Minuta pronta</p>
            <p className="text-[10px] text-blue-400">Exportar em papel timbrado</p>
          </div>
          <svg className="h-4 w-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
      </div>
      <p className="text-[10px] text-slate-600 text-center mt-4 font-mono">Demo ao vivo em /demo/dashboard</p>
    </div>
  );
}

function StepDiagram({ step }: { step: number }) {
  const diagrams = [
    <div key="s1" className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-6 px-4">
        <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p className="text-xs text-slate-500">Arraste arquivos aqui</p>
      </div>
      <div className="mt-2 flex gap-2 text-[10px] text-slate-400"><span>PDF</span><span>DOCX</span><span>E-mail</span><span>Imagens</span></div>
    </div>,

    <div key="s2" className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <table className="w-full text-[10px]">
        <thead><tr className="border-b border-slate-200"><th className="text-left py-1 text-slate-500 font-semibold">Fato</th><th className="text-center py-1 text-slate-500 font-semibold">Status</th></tr></thead>
        <tbody>
          <tr className="border-b border-slate-100"><td className="py-1 text-slate-700">Clausula 4.2...</td><td className="text-center py-1"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 font-semibold">[FATO ALEGADO]</span></td></tr>
          <tr className="border-b border-slate-100"><td className="py-1 text-slate-700">Pagamento dia 10</td><td className="text-center py-1"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 font-semibold">Vinculado</span></td></tr>
          <tr><td className="py-1 text-slate-700">Multa 2%...</td><td className="text-center py-1"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 font-semibold">Vinculado</span></td></tr>
        </tbody>
      </table>
    </div>,

    <div key="s3" className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <p className="text-[10px] font-semibold text-amber-700 mb-2 uppercase tracking-wider">Lacunas identificadas</p>
      <ul className="space-y-1.5">
        {["Comprovante de inadimplencia","E-mail de cobranca","Demonstrativos anteriores"].map((item) => (
          <li key={item} className="flex items-start gap-2 text-[11px] text-amber-800">
            <svg className="mt-0.5 h-3.5 w-3.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            {item}
          </li>
        ))}
      </ul>
    </div>,

    <div key="s4" className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
          <Image src="/brand/gavel-tile.svg" width={16} height={16} alt="" unoptimized />
          <span className="text-[10px] font-semibold text-slate-700">Escritorio Modelo Advocacia</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">Peticao Inicial... Clausula 4.2 nao comprovada. Requer-se [FATO ALEGADO]...</p>
      </div>
      <button className="mt-3 w-full rounded-md bg-blue-600 py-2 text-xs font-semibold text-white">Baixar PDF</button>
    </div>,
  ];
  return diagrams[step];
}
