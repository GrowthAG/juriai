"use client";
import Image from "next/image";
import Link from "next/link";

/* ================================================================
   JuriAI : Landing Page v4 Enterprise
   Design: Relate SaaS Enterprise Edition
   Container: 1320px max-width
   Section: 80px vertical padding
   Copy: $100M Offers / Hormozi
   Core Mechanism: [FATO ALEGADO]
   ================================================================ */

const containerStyle = {
  maxWidth: 1320,
  margin: "0 auto",
  padding: "0 32px",
} as const;

const sectionPadding = { padding: "80px 0" } as const;

const sectionWash = { background: "#f4f6fb" } as const;

const h1Style = {
  fontSize: "clamp(40px, 5vw, 68px)",
  fontWeight: 600,
  lineHeight: 1.05,
  letterSpacing: "-2px",
  color: "#020520",
  margin: 0,
} as const;

const h2Style = {
  fontSize: "clamp(28px, 3.6vw, 44px)",
  fontWeight: 600,
  lineHeight: 1.08,
  letterSpacing: "-1.6px",
  color: "#020520",
  margin: 0,
} as const;

const h3Style = {
  fontSize: 18,
  fontWeight: 600,
  lineHeight: 1.3,
  letterSpacing: "-0.4px",
  color: "#020520",
  margin: 0,
} as const;

const eyebrowStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#145aff",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  margin: 0,
} as const;

const bodyStyle = {
  fontSize: 17,
  lineHeight: 1.6,
  color: "#475569",
  margin: 0,
} as const;

const mutedStyle = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#64748b",
  margin: 0,
} as const;

const cardBase = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
} as const;

const ctaPrimary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "13px 24px",
  background: "#020520",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
  borderRadius: 8,
  border: "1px solid #020520",
} as const;

const ctaGhost = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "13px 24px",
  color: "#020520",
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
  borderRadius: 8,
  background: "transparent",
  border: "1px solid #e2e8f0",
} as const;

export function LandingPage() {
  return (
    <main style={{ background: "#fcfcfc", color: "#14141e", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", minHeight: "100vh", fontSize: 16, lineHeight: 1.6 }}>

      {/* NAV : enterprise, sticky */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(252, 252, 252, 0.85)", backdropFilter: "saturate(180%) blur(8px)", borderBottom: "1px solid #eef0f4" }}>
        <div style={{ ...containerStyle, height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/brand/gavel-tile.svg" width={28} height={28} alt="JuriAI" unoptimized />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", color: "#020520" }}>
              Juri<span style={{ color: "#145aff" }}>AI</span>
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <a href="#problema" style={{ fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none" }}>Problema</a>
            <a href="#mecanismo" style={{ fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none" }}>Mecanismo</a>
            <a href="#precos" style={{ fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none" }}>Preços</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/login" style={{ ...ctaGhost, padding: "9px 18px" }}>Entrar</Link>
            <Link href="/cadastro" style={{ ...ctaPrimary, padding: "9px 18px" }}>Criar conta</Link>
          </div>
        </div>
      </nav>

      {/* HERO : split enterprise, headline left + dashboard right */}
      <section style={{ background: "linear-gradient(180deg, #fcfcfc 0%, #fafbff 100%)", paddingTop: 64, paddingBottom: 80, borderBottom: "1px solid #eef0f4" }}>
        <div style={containerStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.05fr)", gap: 56, alignItems: "center" }}>
            {/* LEFT : Copy */}
            <div>
              <p style={{ ...eyebrowStyle, marginBottom: 16 }}>
                Inteligência forense para advocacia civil
              </p>
              <h1 style={{ ...h1Style, marginBottom: 20 }}>
                Todo escritório tem fatos que não conseguiu provar.
              </h1>
              <p style={{ ...bodyStyle, fontSize: 19, color: "#475569", maxWidth: 560, marginBottom: 32, lineHeight: 1.55 }}>
                O JuriAI conecta cada alegação da sua peça ao documento que a sustenta. Quando um fato não tem prova, você sabe antes do juiz perguntar.
              </p>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <Link href="/cadastro" style={ctaPrimary}>
                  Testar 14 dias grátis
                </Link>
                <Link href="/demo/dashboard" style={ctaGhost}>
                  Ver demonstração
                </Link>
              </div>
              <p style={{ ...mutedStyle, fontSize: 13 }}>
                Sem cartão de crédito upfront. Cancele quando quiser.
              </p>
              <div style={{ marginTop: 36, paddingTop: 28, borderTop: "1px solid #eef0f4", display: "flex", gap: 28, flexWrap: "wrap" }}>
                <Stat value="90+" label="tribunais DataJud" />
                <Stat value="14" label="dias grátis" />
                <Stat value="0" label="fatos inventados" />
              </div>
            </div>
            {/* RIGHT : Dashboard mockup */}
            <div style={{ position: "relative" }}>
              <DashboardMockup />
              <div style={{
                position: "absolute", top: -16, right: -16, padding: "10px 14px",
                background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px -8px rgba(20, 90, 255, 0.18)",
                display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500, color: "#020520"
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16ca2e", display: "inline-block" }} />
                Análise em tempo real
              </div>
              <div style={{
                position: "absolute", bottom: -12, left: -20, padding: "10px 14px",
                background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px -8px rgba(20, 90, 255, 0.18)",
                display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500, color: "#020520"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#145aff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                SHA-256 por arquivo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR : infraestrutura verificada */}
      <section style={{ padding: "36px 0", borderBottom: "1px solid #eef0f4", background: "#fcfcfc" }}>
        <div style={containerStyle}>
          <p style={{ ...eyebrowStyle, color: "#94a3b8", textAlign: "center", marginBottom: 24 }}>
            Infraestrutura e conformidade verificada
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 24, alignItems: "center" }}>
            {[
              { label: "DataJud", sub: "90+ tribunais" },
              { label: "OAB", sub: "Código de Ética" },
              { label: "LGPD", sub: "Art. 7, V" },
              { label: "CNJ", sub: "Conselho Nacional" },
              { label: "Google Cloud", sub: "São Paulo, BR" },
              { label: "Cloud SQL", sub: "PostgreSQL" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textAlign: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>{item.label}</span>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, letterSpacing: "0.02em" }}>{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEMA : a dor que o sócio sente */}
      <section id="problema" style={{ ...sectionPadding, ...sectionWash }}>
        <div style={containerStyle}>
          <div style={{ maxWidth: 760, marginBottom: 56 }}>
            <p style={{ ...eyebrowStyle, marginBottom: 14 }}>O problema</p>
            <h2 style={{ ...h2Style, marginBottom: 18 }}>
              O que você faz quando o juiz pergunta &ldquo;e onde está isso?&rdquo;
            </h2>
            <p style={{ ...bodyStyle, fontSize: 18 }}>
              Você tem 3 segundos para responder. Se não tiver o documento na mão : a cláusula, a data do e-mail, o valor do boleto : você perdeu o ponto. E talvez o caso.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 56 }}>
            {[
              {
                t: "O sócio não confia na pesquisa",
                d: "Associados produzem peças com fatos que não dão para provar. O sócio titular relê tudo antes de protocolar. São 3 horas de trabalho manual por peça.",
              },
              {
                t: "A lacuna aparece no tribunal",
                d: "O juiz pergunta pelo documento. O advogado não tem. Perde o ponto. O caso vira uma discussão sobre a ausência de prova : não sobre o mérito.",
              },
              {
                t: "O escritório não escala",
                d: "Para crescer, você precisa de mais gente. Mais gente significa mais custo fixo, mais gestão, mais risco. E você continua fazendo a mesma quantidade de trabalho estratégico.",
              },
            ].map((pain, i) => (
              <div key={pain.t} style={{ ...cardBase, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <span style={{ fontSize: 11, fontFamily: "'Roboto Mono', ui-monospace, monospace", fontWeight: 700, color: "#145aff" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>
                <h3 style={{ ...h3Style, marginBottom: 10 }}>{pain.t}</h3>
                <p style={mutedStyle}>{pain.d}</p>
              </div>
            ))}
          </div>

          <div style={{ maxWidth: 880, padding: "32px 36px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16 }}>
            <h2 style={{ ...h2Style, fontSize: "clamp(22px, 2.6vw, 30px)", letterSpacing: "-0.8px", marginBottom: 12 }}>
              O JuriAI mostra exatamente o que você tem antes de você ajuizar.
            </h2>
            <p style={{ ...bodyStyle, fontSize: 16, color: "#475569" }}>
              Transforma cada documento do seu escritório em um mapa navegável. Para cada fato alegado, ele mostra onde está provado, onde falta prova, e o que acontece se você ajuizar sem ela.
            </p>
          </div>
        </div>
      </section>

      {/* MECANISMO : [FATO ALEGADO] */}
      <section id="mecanismo" style={{ ...sectionPadding, background: "#fcfcfc" }}>
        <div style={containerStyle}>
          <div style={{ maxWidth: 800, marginBottom: 48 }}>
            <p style={{ ...eyebrowStyle, marginBottom: 14 }}>O mecanismo</p>
            <h2 style={{ ...h2Style, marginBottom: 16 }}>
              <span style={{ fontFamily: "'Roboto Mono', ui-monospace, monospace", fontWeight: 600, color: "#145aff" }}>[FATO ALEGADO]</span> não é um aviso. É uma proteção.
            </h2>
            <p style={{ ...bodyStyle, fontSize: 18 }}>
              Quando um fato não tem documento que o sustente, o JuriAI marca <strong style={{ color: "#020520", fontFamily: "'Roboto Mono', ui-monospace, monospace", fontWeight: 600 }}>[FATO ALEGADO]</strong>. Isso não é uma falha do sistema. É a função dele. A questão não é se a IA vai inventar jurisprudência. A questão é se <strong style={{ color: "#020520" }}>você sabe o que não conseguiu provar</strong> antes de ajuizar.
            </p>
          </div>

          <MatrizMockup />

          <p style={{ ...mutedStyle, textAlign: "center", marginTop: 24, maxWidth: 620, margin: "24px auto 0", fontSize: 13 }}>
            A questão não é se a IA vai inventar jurisprudência. A questão é se você sabe o que não conseguiu provar antes de ajuizar.
          </p>
        </div>
      </section>

      {/* ESTEIRA FORENSE : copy à esquerda + grid 2x2 à direita */}
      <section style={{ ...sectionPadding, ...sectionWash }}>
        <div style={containerStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.3fr)", gap: 56, alignItems: "flex-start" }}>
            <div>
              <p style={{ ...eyebrowStyle, marginBottom: 14 }}>Como funciona</p>
              <h2 style={{ ...h2Style, marginBottom: 18 }}>
                Quatro etapas. Do documento à peça auditada.
              </h2>
              <p style={{ ...bodyStyle, fontSize: 17 }}>
                De contratos a e-mails a uma minuta rastreável. Sem adivinhação. Sem <span style={{ fontFamily: "'Roboto Mono', ui-monospace, monospace", fontWeight: 600, color: "#020520" }}>[FATO ALEGADO]</span> que você não saiba explicar.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                {
                  n: "01",
                  t: "Upload de Documentos",
                  d: "Arraste contratos, e-mails, boletos e prints. Cada arquivo recebe hash SHA-256. A integridade do documento está garantida desde o primeiro segundo.",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#145aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  ),
                },
                {
                  n: "02",
                  t: "IA Extrai os Fatos",
                  d: "O JuriAI lê cada documento e extrai todos os fatos alegados. Vincula cada um ao trecho exato de origem. Quando não encontra prova, marca [FATO ALEGADO].",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#145aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  ),
                },
                {
                  n: "03",
                  t: "Auditoria de Lacunas",
                  d: "O sistema identifica automaticamente o que falta para cada tese prosperar. Se você ajuizar sem esse documento, o juiz vai perguntar. E você vai ter que responder.",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#145aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  ),
                },
                {
                  n: "04",
                  t: "Minuta Rastreável",
                  d: "Cada parágrafo da peça cita a prova de origem. Você revisa. Você aprova. Você protocola. Com certeza.",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#145aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  ),
                },
              ].map(step => (
                <div key={step.n} style={{ ...cardBase, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <span style={{ fontSize: 11, fontFamily: "'Roboto Mono', ui-monospace, monospace", fontWeight: 700, color: "#145aff" }}>{step.n}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f4f6fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {step.icon}
                    </div>
                  </div>
                  <h3 style={{ ...h3Style, fontSize: 16, marginBottom: 8 }}>{step.t}</h3>
                  <p style={{ ...mutedStyle, fontSize: 13 }}>{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA : 5 perguntas em grid 2 colunas */}
      <section id="para-quem-e" style={{ ...sectionPadding, background: "#fcfcfc" }}>
        <div style={containerStyle}>
          <div style={{ maxWidth: 800, marginBottom: 48 }}>
            <p style={{ ...eyebrowStyle, marginBottom: 14 }}>Para quem é</p>
            <h2 style={{ ...h2Style, marginBottom: 14 }}>
              5 perguntas que você precisa fazer antes de usar qualquer IA jurídica.
            </h2>
            <p style={{ ...bodyStyle, fontSize: 17, color: "#475569" }}>
              Respostas diretas. Sem promessa inflada. Sem letra miúda.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {[
              { q: "Onde os dados dos meus clientes ficam?", a: "No Brasil. Contrato de prestação de serviços (Art. 7, V da LGPD). Arquivos com hash SHA-256 no upload. Nunca compartilhados com terceiros." },
              { q: "A IA pode inventar jurisprudência ou norma?", a: "Não. [FATO ALEGADO] marca o que ela não encontra. O sistema nunca gera citação de precedente: isso é responsabilidade do advogado." },
              { q: "Se eu for punido pela OAB por usar a ferramenta, quem responde?", a: "Você. E por isso a minuta é rascunho, não peça final. O sócio titular revisa, aprova e protocola. Sempre." },
              { q: "Posso auditar o que a IA fez?", a: "Sim. Trilha de auditoria completa com timestamp e usuário para cada ação. Histórico de versões de cada minuta." },
              { q: "O que acontece se eu perder um prazo por culpa da ferramenta?", a: "Você responde. E por isso não substituímos decisão humana. O JuriAI organiza, mostra e alerta. A escolha de ajuizar é sempre sua." },
            ].map((item, i) => (
              <details key={i} style={{ ...cardBase, overflow: "hidden" }}>
                <summary style={{ padding: "20px 24px", fontSize: 15, fontWeight: 500, color: "#020520", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, fontFamily: "'Roboto Mono', ui-monospace, monospace", fontWeight: 700, color: "#145aff", opacity: 0.7, flexShrink: 0 }}>
                      0{i + 1}
                    </span>
                    {item.q}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div style={{ padding: "0 24px 20px", borderTop: "1px solid #eef0f4", paddingTop: 16 }}>
                  <p style={{ ...mutedStyle, color: "#475569" }}>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" style={{ ...sectionPadding, ...sectionWash }}>
        <div style={containerStyle}>
          <div style={{ maxWidth: 760, marginBottom: 56 }}>
            <p style={{ ...eyebrowStyle, marginBottom: 14 }}>Precificação</p>
            <h2 style={{ ...h2Style, marginBottom: 18 }}>
              R$ 497/mês. Menos que 1 hora de audiência por semana.
            </h2>
            <p style={{ ...bodyStyle, fontSize: 17 }}>
              Teste 14 dias. Sem cartão de crédito upfront. Cancele quando quiser.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, maxWidth: 980, margin: "0 auto" }}>
            {/* PRO */}
            <div style={{ ...cardBase, padding: 36 }}>
              <div style={{ borderBottom: "1px solid #eef0f4", paddingBottom: 24, marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
                  JuriAI Pro
                </p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 600, color: "#020520", letterSpacing: "-2px", lineHeight: 1 }}>R$ 497</span>
                  <span style={{ fontSize: 16, color: "#64748b", marginBottom: 6, fontWeight: 500 }}>/mês</span>
                </div>
                <p style={{ ...mutedStyle, fontSize: 13 }}>Cobrado mensalmente. Cancele quando quiser.</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  "Casos ilimitados",
                  "Upload ilimitado de documentos",
                  "Matriz Fato x Prova automática",
                  "Auditoria de lacunas probatórias",
                  "Exportação rastreável em timbre",
                  "90+ tribunais DataJud integrados",
                  "Sigilo SHA-256 por arquivo",
                  "Suporte em 24h",
                ].map(feat => (
                  <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#1e293b" }}>
                    <CheckIcon />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" style={{ ...ctaGhost, display: "flex", width: "100%" }}>
                Começar teste grátis
              </Link>
            </div>

            {/* GOLD */}
            <div style={{ ...cardBase, padding: 36, borderColor: "#145aff", borderWidth: 2, boxShadow: "0 12px 40px -12px rgba(20, 90, 255, 0.25)" }}>
              <div style={{ borderBottom: "1px solid #eef0f4", paddingBottom: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                    JuriAI Gold
                  </p>
                  <span style={{ fontSize: 10, fontWeight: 700, background: "#145aff", color: "#ffffff", padding: "4px 10px", borderRadius: 4, letterSpacing: "0.06em" }}>
                    POPULAR
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 600, color: "#020520", letterSpacing: "-2px", lineHeight: 1 }}>R$ 697</span>
                  <span style={{ fontSize: 16, color: "#64748b", marginBottom: 6, fontWeight: 500 }}>/mês</span>
                </div>
                <p style={{ ...mutedStyle, fontSize: 13 }}>Cobrado mensalmente. Cancele quando quiser.</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  "Tudo do plano Pro",
                  "até 5 subcontas",
                  "Pipeline de casos com gráficos",
                  "Automação de alertas de prazo",
                  "Histórico de versões de minutas",
                  "API de integração",
                  "Priority support até 4h",
                  "Onboarding assistido",
                ].map(feat => (
                  <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#1e293b" }}>
                    <CheckIcon />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" style={{ ...ctaPrimary, display: "flex", width: "100%" }}>
                Começar teste grátis
              </Link>
            </div>
          </div>

          {/* Price anchor */}
          <div style={{ maxWidth: 720, margin: "56px auto 0", padding: "28px 32px", background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", textAlign: "center" }}>
            <p style={{ ...bodyStyle, fontSize: 17, color: "#1e293b", lineHeight: 1.6, marginBottom: 8 }}>
              Um júnior CLT custa R$ 6.000 a R$ 7.000/mês com encargos. Ele faz pesquisa básica e organização de documentos. <strong style={{ color: "#020520" }}>O JuriAI faz o mesmo. Por R$ 497.</strong>
            </p>
            <p style={{ ...mutedStyle, fontSize: 14, color: "#145aff", fontWeight: 500 }}>A diferença de R$ 6.000/mês fica no seu escritório.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ ...sectionPadding, background: "#fcfcfc" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ ...eyebrowStyle, marginBottom: 14 }}>FAQ</p>
            <h2 style={{ ...h2Style }}>Perguntas frequentes.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQ_DATA.map((faq, i) => (
              <details key={i} style={{ ...cardBase, overflow: "hidden" }}>
                <summary style={{ padding: "20px 24px", fontSize: 15, fontWeight: 500, color: "#020520", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  {faq.q}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div style={{ padding: "0 24px 20px", borderTop: "1px solid #eef0f4", paddingTop: 16 }}>
                  <p style={{ ...mutedStyle, color: "#475569" }}>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: "#020520", padding: "80px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
          <p style={{ ...eyebrowStyle, color: "#145aff", marginBottom: 16 }}>Próximo passo</p>
          <h2 style={{ ...h2Style, color: "#ffffff", marginBottom: 18 }}>
            Da próxima vez que o juiz perguntar &ldquo;e onde está isso?&rdquo;, você vai querer ter a resposta.
          </h2>
          <p style={{ ...bodyStyle, color: "rgba(255, 255, 255, 0.65)", marginBottom: 36 }}>
            14 dias grátis. Sem cartão de crédito. O escritório opera 24 horas enquanto você dorme.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/cadastro" style={{ ...ctaPrimary, background: "#ffffff", color: "#020520", borderColor: "#ffffff" }}>
              Criar conta do escritório
            </Link>
            <Link href="/demo/dashboard" style={{ ...ctaGhost, color: "#ffffff", borderColor: "rgba(255,255,255,0.2)" }}>
              Ver demonstração
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER : enterprise 5 colunas */}
      <footer style={{ background: "#0a0e1a", color: "rgba(255,255,255,0.55)", padding: "64px 0 32px" }}>
        <div style={containerStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            {/* BRAND */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Image src="/brand/gavel-tile.svg" width={26} height={26} alt="JuriAI" unoptimized />
                <span style={{ fontSize: 17, fontWeight: 600, color: "#ffffff", letterSpacing: "-0.02em" }}>
                  Juri<span style={{ color: "#145aff" }}>AI</span>
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", marginBottom: 20, maxWidth: 280 }}>
                Inteligência forense para advocacia civil brasileira. Processamento em território nacional. Conforme OAB e LGPD.
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>
                Powered by<br />
                <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Google Cloud São Paulo</span>
              </p>
            </div>

            <FooterColumn title="Produto" links={["Mecanismo [FATO ALEGADO]", "Matriz Fato x Prova", "Auditoria de Lacunas", "Minuta Rastreável", "API de Integração"]} />
            <FooterColumn title="Recursos" links={["Documentação", "Casos de uso", "Segurança & LGPD", "Status do sistema", "Changelog"]} />
            <FooterColumn title="Empresa" links={["Sobre", "Manifesto", "Contato", "Imprensa"]} />
            <FooterColumn title="Legal" links={["Política de Privacidade", "Termos de Uso", "Conformidade LGPD", "Contrato de Prestação"]} />
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                JuriAI Soluções Tecnológicas LTDA. CNPJ sob consulta.
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                Base legal: Contrato de Prestação Art. 7, V LGPD.
              </p>
            </div>
            <a href="mailto:contato@juriai.adv" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 500 }}>
              contato@juriai.adv
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#020520", letterSpacing: "-1px", lineHeight: 1, marginBottom: 6, fontFamily: "'Roboto Mono', ui-monospace, monospace" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, letterSpacing: "0.01em" }}>
        {label}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16ca2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
        {title}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(link => (
          <li key={link}>
            <a href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 14,
      border: "1px solid #e2e8f0",
      boxShadow: "0 24px 80px -24px rgba(15, 23, 42, 0.12), 0 8px 24px -8px rgba(20, 90, 255, 0.08)",
      overflow: "hidden",
    }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #eef0f4", display: "flex", alignItems: "center", gap: 8, background: "#fafbfc" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fda4af" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fcd34d" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#86efac" }} />
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Roboto Mono', ui-monospace, monospace" }}>
            app.juriai.adv.br/caso/cobranca-alugueis-2024
          </span>
        </div>
      </div>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef0f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0, marginBottom: 6 }}>
            Caso ativo
          </p>
          <p style={{ fontSize: 17, fontWeight: 600, color: "#020520", margin: 0, letterSpacing: "-0.02em" }}>
            Cobrança de Aluguéis Inadimplidos
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 4, background: "#f0fdf4", color: "#16ca2e" }}>
            9 PROVADOS
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 4, background: "#fef2f2", color: "#f26052" }}>
            2 ALEGADOS
          </span>
        </div>
      </div>
      <div style={{ padding: "8px 0" }}>
        {[
          { f: "Contrato de locação firmado em 15/01/2023", d: "Contrato.pdf : Cláusula 1ª, pág. 1", s: "PROVADO" },
          { f: "Cláusula de reajuste de 5% ao ano", d: "Contrato.pdf : Cláusula 3ª, pág. 2", s: "PROVADO" },
          { f: "Inadimplemento a partir de 01/04/2024 (3 meses)", d: "Extrato Nubank PJ : fl. 14, linha 3", s: "PROVADO" },
          { f: "Valor de R$ 18.750,00 em aluguéis atrasados", d: "Planilha de cálculo : fl. 31", s: "PROVADO" },
          { f: "Notificação extrajudicial entregue em 10/05/2024", d: "AR digital : não verificado", s: "ALEGADO" },
        ].map((row, i) => (
          <div key={i} style={{
            padding: "12px 24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 90px",
            alignItems: "center",
            gap: 16,
            borderBottom: i < 4 ? "1px solid #f4f6fb" : "none",
          }}>
            <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{row.f}</span>
            <span style={{
              fontSize: 12,
              color: row.s === "ALEGADO" ? "#f26052" : "#64748b",
              fontStyle: row.s === "ALEGADO" ? "italic" : "normal",
            }}>
              {row.d}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 4,
              background: row.s === "PROVADO" ? "#f0fdf4" : "#fef2f2",
              color: row.s === "PROVADO" ? "#16ca2e" : "#f26052",
              textAlign: "center",
              letterSpacing: "0.04em",
            }}>
              {row.s}
            </span>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px 24px", background: "#fef2f2", borderTop: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f26052", display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#991b1b", fontWeight: 500 }}>
          2 fatos sem comprovação documental. Revise antes de ajuizar.
        </span>
      </div>
    </div>
  );
}

function MatrizMockup() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 12px 40px -16px rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef0f4", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16ca2e", display: "inline-block" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#020520", letterSpacing: "-0.01em" }}>
            MATRIZ FATO x PROVA
          </span>
          <span style={{ fontSize: 12, color: "#64748b", marginLeft: 4 }}>
            Caso: Cobrança de Aluguéis Inadimplidos
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 4, background: "#f0fdf4", color: "#16ca2e", letterSpacing: "0.04em" }}>
            9 PROVADOS
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 4, background: "#fef2f2", color: "#f26052", letterSpacing: "0.04em" }}>
            2 ALEGADOS
          </span>
        </div>
      </div>
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.3fr 110px", background: "#fafbfc", padding: "12px 24px", borderBottom: "1px solid #eef0f4" }}>
          {["Fato alegado", "Documento de origem", "Status"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {h}
            </span>
          ))}
        </div>
        {[
          { f: "Contrato de locação firmado em 15/01/2023", d: "Contrato.pdf : Cláusula 1ª, pág. 1", s: "PROVADO" },
          { f: "Cláusula de reajuste de 5% ao ano", d: "Contrato.pdf : Cláusula 3ª, pág. 2", s: "PROVADO" },
          { f: "Inadimplemento a partir de 01/04/2024 (3 meses)", d: "Extrato Nubank PJ : fl. 14, linha 3", s: "PROVADO" },
          { f: "Valor de R$ 18.750,00 em aluguéis atrasados", d: "Planilha de cálculo : fl. 31", s: "PROVADO" },
          { f: "Notificação extrajudicial entregue em 10/05/2024", d: "AR digital : não verificado", s: "ALEGADO" },
          { f: "Multa contratual de 2 meses de aluguel", d: "Não encontrado", s: "ALEGADO" },
        ].map((row, i) => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1.3fr 110px",
            padding: "14px 24px",
            borderBottom: i < 5 ? "1px solid #f4f6fb" : "none",
            background: "#ffffff",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, lineHeight: 1.4 }}>{row.f}</span>
            <span style={{
              fontSize: 12,
              color: row.s === "ALEGADO" ? "#f26052" : "#64748b",
              fontStyle: row.s === "ALEGADO" ? "italic" : "normal",
              lineHeight: 1.4,
            }}>
              {row.d}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 4,
              background: row.s === "PROVADO" ? "#f0fdf4" : "#fef2f2",
              color: row.s === "PROVADO" ? "#16ca2e" : "#f26052",
              textAlign: "center",
              letterSpacing: "0.04em",
            }}>
              {row.s}
            </span>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 24px", background: "#fef2f2", borderTop: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f26052", display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: "#991b1b", fontWeight: 500 }}>
          2 fatos sem comprovação documental. Revise antes de ajuizar.
        </span>
      </div>
    </div>
  );
}

const FAQ_DATA = [
  { q: "O advogado pode ser punido pela OAB por usar IA jurídica?", a: "A OAB permite o uso de IA desde que a saída seja revisada integralmente antes de uso em processo. O advogado permanece responsável. O JuriAI nunca substitui o julgamento profissional: reduz o trabalho de organização factual para que o sócio titular dedique mais tempo a estratégia." },
  { q: "Como funciona a cobrança?", a: "R$ 497/mês para o plano Pro, R$ 697/mês para o plano Gold, cobrado mensalmente. Cancele quando quiser na sua conta. Período de teste gratuito de 14 dias, sem cartão de crédito upfront." },
  { q: "O JuriAI garante que não vai inventar jurisprudência?", a: "O mecanismo de Anti-Alucinação marca todo fato sem documento comprobatório como [FATO ALEGADO]. A IA nunca gera minuta final sem que o sócio titular revise. O sistema nunca gera citação de norma ou precedente: isso é responsabilidade do advogado." },
  { q: "Posso usar com meu escritório de vários advogados?", a: "Sim. O plano Gold suporta até 5 subcontas simultâneas. Cada advogado acessa com login próprio, e a trilha de auditoria registra quem fez cada alteração." },
  { q: "Preciso ter experiência com tecnologia?", a: "Não. São 3 etapas: upload de documentos, revisão da matriz, exportação da minuta. Onboarding de 30 minutos incluído." },
  { q: "Os dados dos meus clientes estão seguros?", a: "Sim. Infraestrutura em território brasileiro. Arquivos com hash SHA-256. Base legal: contrato de prestação de serviços Art. 7, V da LGPD. Nunca compartilhados com terceiros." },
];