"use client";
import Image from "next/image";
import Link from "next/link";

/* ================================================================
   JuriAI — Landing Page v3
   Design: Relate SaaS | Copy: $100M Offers / Hormozi
   Core Mechanism: [FATO ALEGADO]
   ================================================================ */

export function LandingPage() {
  return (
    <main style={{ background: "#fcfcfc", color: "#14141e", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", minHeight: "100vh", fontSize: 16, lineHeight: 1.63 }}>

      {/* NAV — simple editorial, no pills */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#fcfcfc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/brand/gavel-tile.svg" width={26} height={26} alt="JuriAI" unoptimized />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", color: "#020520" }}>
              Juri<span style={{ color: "#145aff" }}>AI</span>
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#problema" style={{ fontSize: 14, fontWeight: 400, color: "#374151", textDecoration: "none" }}>Problema</a>
            <a href="#como-funciona" style={{ fontSize: 14, fontWeight: 400, color: "#374151", textDecoration: "none" }}>Como funciona</a>
            <a href="#precos" style={{ fontSize: 14, fontWeight: 400, color: "#374151", textDecoration: "none" }}>Precos</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/login" style={{ fontSize: 14, color: "#374151", textDecoration: "none" }}>Entrar</Link>
            <Link href="/cadastro" style={{ fontSize: 14, fontWeight: 500, padding: "8px 18px", background: "#020520", color: "white", textDecoration: "none" }}>
              Criar conta
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — clean editorial, no gradient, no pills */}
      <section style={{ background: "#fcfcfc", paddingTop: 72, paddingBottom: 72 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            {/* Left — copy */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#145aff", marginBottom: 16, letterSpacing: "0.01em" }}>
                Inteligencia forense para advocacia civil
              </p>
              <h1 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-1px", color: "#020520", marginBottom: 20 }}>
                Todo escritorio tem fatos que nao conseguiu provar. O seu nao precisa ser um deles.
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "#374151", marginBottom: 32, maxWidth: 440 }}>
                O JuriAI conecta cada alegacao da sua peca ao documento que a sustenta. Quando um fato nao tem prova, voce sabe antes do juiz perguntar.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Link href="/cadastro" style={{ display: "inline-block", padding: "12px 24px", background: "#020520", color: "white", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                  Verificar meu escritorio
                </Link>
                <Link href="/demo/dashboard" style={{ display: "inline-block", padding: "12px 24px", color: "#374151", fontSize: 14, textDecoration: "none" }}>
                  Ver demonstracao
                </Link>
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 14 }}>14 dias gratis. Sem cartao de credito upfront.</p>
            </div>

            {/* Right — REAL product screenshot */}
            <div>
              <img
                src="/site/juriai-wizard-real.png"
                alt="JuriAI extraindo fatos de um contrato em tempo real"
                style={{ width: "100%", height: "auto", display: "block", borderRadius: 8, border: "1px solid #e2e8f0" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* HERO ends here */}

      {/* LOGO STRIP */}
      {/* TRUST STRIP — integrations + compliance badges */}
      <section style={{ padding: "40px 0", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", marginBottom: 24, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Infraestrutura e conformidade verificada
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
            {[
              { label: "DataJud / CJF", sub: "90+ tribunais" },
              { label: "OAB Brasil", sub: "Código de Ética" },
              { label: "LGPD", sub: "Art. 7, V" },
              { label: "CNJ", sub: "Conselho Nacional" },
              { label: "Google Cloud", sub: "São Paulo, Brasil" },
              { label: "Cloud SQL", sub: "PostgreSQL" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", letterSpacing: "-0.01em" }}>{item.label}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEMA — a dor que o socio sente */}
      <section id="problema" style={{ padding: "96px 0", background: "#fcfcfc" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>O problema</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-1.48px", color: "#020520", marginBottom: 16 }}>
              O que voce faz quando o juiz pergunta "e onde esta isso?"
            </h2>
            <p style={{ fontSize: 17, color: "#374151", maxWidth: 520, margin: "0 auto", lineHeight: 1.63 }}>
              Voce tem 3 segundos para responder. Se nao tiver o documento na mao — a clausula, a data do e-mail, o valor do boleto — voce perdeu o ponto. E talvez o caso.
            </p>
          </div>

          {/* 3 pain cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 56 }}>
            {[
              {
                t: "O socio nao confia na pesquisa",
                d: "Associados produzem pecas com fatos que nao dao para provar. O socio titular rele tudo antes de protocolar. Sao 3 horas de trabalho manual por peca."
              },
              {
                t: "A lacuna aparece no tribunal",
                d: "O juiz pergunta pelo documento. O advogado nao tem. Perde o ponto. O caso vira uma discussao sobre a ausencia de prova — nao sobre o merito."
              },
              {
                t: "O escritorio nao escala",
                d: "Para crescer, voce precisa de mais gente. Mais gente significa mais custo fixo, mais gestao, mais risco. E voce continua fazendo a mesma quantidade de trabalho estrategico."
              }
            ].map(pain => (
              <div key={pain.t} style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#145aff", marginBottom: 16, flexShrink: 0 }} />
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#020520", marginBottom: 10, lineHeight: 1.3 }}>{pain.t}</h3>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{pain.d}</p>
              </div>
            ))}
          </div>

          {/* Transition to mechanism */}
          <div style={{ textAlign: "center", padding: "0 24px" }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-1.48px", color: "#020520", marginBottom: 16 }}>
              O JuriAI mostra exatamente o que voce tem antes de voce ajuizar.
            </h2>
            <p style={{ fontSize: 17, color: "#374151", maxWidth: 520, margin: "0 auto", lineHeight: 1.63 }}>
              Transforma cada documento do seu escritorio em um mapa navegavel. Para cada fato alegado, ele mostra onde esta provado, onde falta prova, e o que acontece se voce ajuizar sem ela.
            </p>
          </div>
        </div>
      </section>

      {/* ESTEIRA FORENSE */}
      <section style={{ padding: "96px 0", background: "#f0f4fe" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>Como funciona</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-1.48px", color: "#020520", marginBottom: 14 }}>
              Quatro etapas. Do documento a peça auditada.
            </h2>
            <p style={{ fontSize: 16, color: "#374151", maxWidth: 480, margin: "0 auto" }}>
              De contratos é e-mails a uma minuta rastreavel. Sem adivinhação. Sem [FATO ALEGADO] que você não saiba explicar.
            </p>
          </div>



          {/* Feature cards — como cada etapa funciona na pratica */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 40 }}>
            {[
              {
                n: "01",
                t: "Upload de Documentos",
                d: "Arraste contratos, e-mails, boletos e prints. Cada arquivo recebe hash SHA-256. A integridade do documento esta garantida desde o primeiro segundo.",
                icon: "upload"
              },
              {
                n: "02",
                t: "IA Extrai os Fatos",
                d: "O JuriAI le cada documento e extrai todos os fatos alegados. Vincula cada um ao trecho exato de origem. Quando nao encontra prova, marca [FATO ALEGADO].",
                icon: "ai"
              },
              {
                n: "03",
                t: "Auditoria de Lacunas",
                d: "O sistema identifica automaticamente o que falta para cada tese prosperar. Se voce ajuizar sem esse documento, o juiz vai perguntar. E voce vai ter que responder.",
                icon: "audit"
              },
              {
                n: "04",
                t: "Minuta Rastreavel",
                d: "Cada paragrafo da peca cita a prova de origem. Voce revisa. Voce aprova. Voce protocola. Com certeza.",
                icon: "export"
              },
            ].map(step => (
              <div key={step.n} style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#145aff", display: "block", marginBottom: 14 }}>{step.n}</span>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#020520", marginBottom: 10, lineHeight: 1.3 }}>{step.t}</h3>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* [FATO ALEGADO] MECHANISM — a diferenca, light card */}
      <section style={{ padding: "96px 0", background: "#f0f4fe" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>O mecanismo</p>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-1.2px", color: "#020520", marginBottom: 16 }}>
              [FATO ALEGADO] não é um aviso. É uma proteção.
            </h2>
            <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.63, maxWidth: 520, margin: "0 auto" }}>
              Quando um fato não tem documento que o sustente, o JuriAI marca [FATO ALEGADO]. Isso não é uma falha do sistema. É a função dele. A questão não é se a IA vai inventar jurisprudência. A questão é se <strong style={{ color: "#020520" }}>você sabe o que não conseguiu provar</strong> antes de ajuizar.
            </p>
          </div>

          {/* Light card — matriz Fato x Prova em branco */}
          <div style={{ maxWidth: 900, margin: "0 auto", background: "white", borderRadius: 20, boxShadow: "0 0.36px 1.8px -1.4px rgba(0,0,0,0.08), 0 1.37px 6.87px -2.8px rgba(0,0,0,0.07), 0 6px 30px -4.25px rgba(0,0,0,0.016)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16ca2e", display: "inline-block" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#020520" }}>MATRIZ FATO x PROVA</span>
                <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 4 }}>Caso: Cobrança de Aluguéis</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 4, background: "#f0fdf4", color: "#16ca2e" }}>9 provados</span>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 4, background: "#fef2f2", color: "#f26052" }}>2 alegados</span>
              </div>
            </div>
            {/* Table */}
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", background: "#f8f9fa", padding: "10px 24px", borderBottom: "1px solid #e2e8f0" }}>
                {["Fato alegado","Documento de origem","Status"].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{h}</span>
                ))}
              </div>
              {[
                { f: "Contrato de locação firmado em 15/01/2023", d: "Contrato.pdf — Cláusula 1ª, pág. 1", s: "PROVADO", c: "#16ca2e", bg: "#f0fdf4" },
                { f: "Cláusula de reajuste de 5% ao ano", d: "Contrato.pdf — Cláusula 3ª, pág. 2", s: "PROVADO", c: "#16ca2e", bg: "#f0fdf4" },
                { f: "Inadimplemento a partir de 01/04/2024 (3 meses)", d: "Extrato Nubank PJ — fl. 14, linha 3", s: "PROVADO", c: "#16ca2e", bg: "#f0fdf4" },
                { f: "Valor de R$ 18.750,00 em aluguéis atrasados", d: "Planilha de cálculo — fl. 31", s: "PROVADO", c: "#16ca2e", bg: "#f0fdf4" },
                { f: "Notificação extrajudicial entregue em 10/05/2024", d: "AR digital — não verificado", s: "ALEGADO", c: "#f26052", bg: "#fef2f2" },
                { f: "Multa contratual de 2 meses de aluguel", d: "Não encontrado", s: "ALEGADO", c: "#f26052", bg: "#fef2f2" },
              ].map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", padding: "12px 24px", borderBottom: i < 5 ? "1px solid #f1f5f9" : "none", background: "white" }}>
                  <span style={{ fontSize: 12, color: "#14141e", lineHeight: 1.4 }}>{row.f}</span>
                  <span style={{ fontSize: 12, color: row.s === "ALEGADO" ? "#f26052" : "#6b7280", fontStyle: row.s === "ALEGADO" ? "italic" : "normal", lineHeight: 1.4 }}>{row.d}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 4, background: row.bg, color: row.c, alignSelf: "center" }}>{row.s}</span>
                </div>
              ))}
            </div>
            {/* Alert bar */}
            <div style={{ padding: "14px 24px", background: "#fef2f2", borderTop: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f26052", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#991b1b", fontWeight: 500 }}>2 fatos sem comprovação documental. Revise antes de ajuizar.</span>
            </div>
          </div>

          <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", marginTop: 20, maxWidth: 560, margin: "20px auto 0", lineHeight: 1.6 }}>
            A questão não é se a IA vai inventar jurisprudência. A questão é se você sabe o que não conseguiu provar antes de ajuizar.
          </p>
        </div>
      </section>

      {/* SEGURANCA — 5 perguntas */}
      <section id="para-quem-e" style={{ padding: "96px 0", background: "#f0f4fe" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>Para quem é</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-1.48px", color: "#020520", marginBottom: 14 }}>
              5 perguntas que você precisa fazer antes de usar qualquer IA juridica.
            </h2>
          </div>

          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { q: "Onde os dados dos meus clientes ficam?", a: "No Brasil. Contrato de prestação de servicos (Art. 7, V da LGPD). Arquivos com hash SHA-256 no upload. Nunca compartilhados com terceiros." },
              { q: "A IA pode inventar jurisprudência ou norma?", a: "Não. [FATO ALEGADO] marca o que ela não encontra. O sistema nunca gera citação de precedente: isso é responsabilidade do advogado." },
              { q: "Se eu for punido pela OAB por usar a ferramenta, quem responde?", a: "Você. E por isso a minuta é rascunho, não peça final. O socio titular revisa, aprova e protocola. Sempre." },
              { q: "Posso auditar o que a IA fez?", a: "Sim. Trilha de auditoria completa com timestamp e usuário para cada ação. Histórico de versões de cada minuta." },
              { q: "O que acontece se eu perder um prazo por culpa da ferramenta?", a: "Você responde. E por isso não substituímos decisão humana. O JuriAI organiza, mostra e alerta. A escolha de ajuizar é sempre sua." },
            ].map((item, i) => (
              <details key={i} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <summary style={{ padding: "18px 24px", fontSize: 15, fontWeight: 500, color: "#020520", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#145aff", opacity: 0.6, flexShrink: 0 }}>0{i + 1}</span>
                    {item.q}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div style={{ padding: "0 24px 18px", borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.63 }}>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="quanto-custa" style={{ padding: "96px 0", background: "#fcfcfc" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>Precificação</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-1.48px", color: "#020520", marginBottom: 14 }}>
              R$ 497/mês. Menos que 1 hora de audiencia por semana.
            </h2>
            <p style={{ fontSize: 16, color: "#374151" }}>Teste 14 dias. Sem cartao de credito upfront. Cancele quando quiser.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 760, margin: "0 auto" }}>
            {/* Pro */}
            <div style={{ background: "white", borderRadius: 12, padding: 36, border: "1px solid #e2e8f0" }}>
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 24, marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>JuriAI Pro</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 42, fontWeight: 600, color: "#020520", letterSpacing: "-1px" }}>R$ 497</span>
                  <span style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>/mes</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Cobrado mensalmente. Cancele quando quiser.</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {["Casos ilimitados","Upload ilimitado de documentos","Matriz Fato x Prova automatica","Auditoria de lacunas probatorias","Exportação rastreavel em timbre","90+ tribunais DataJud integrados","Sigilo SHA-256 por arquivo","Suporte em 24h"].map(feat => (
                  <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#374151" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16ca2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 24px", color: "#374151", fontSize: 14, textDecoration: "none" }}>
                Comecar teste gratis
              </Link>
            </div>

            {/* Gold */}
            <div style={{ background: "white", borderRadius: 12, padding: 36, border: "1px solid #e2e8f0" }}>
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.08em" }}>JuriAI Gold</span>
                  <span style={{ fontSize: 10, fontWeight: 600, background: "#145aff", color: "white", padding: "2px 8px", borderRadius: 4 }}>Popular</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 42, fontWeight: 600, color: "#020520", letterSpacing: "-1px" }}>R$ 697</span>
                  <span style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>/mes</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Cobrado mensalmente. Cancele quando quiser.</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {["Tudo do plano Pro","ate 5 subcontas","Pipeline de casos com graficos","Automação de alertas de prazo","Histórico de versões de minutas","API de integração","Priority support ate 4h","Onboarding assistido"].map(feat => (
                  <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#374151" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16ca2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" style={{ display: "block", padding: "12px 24px", background: "#020520", color: "white", fontSize: 14, fontWeight: 500, textDecoration: "none", textAlign: "center" }}>
                Comecar teste gratis
              </Link>
            </div>
          </div>

          {/* Price anchor */}
          <div style={{ maxWidth: 560, margin: "40px auto 0", padding: "24px 28px", background: "#f0f4fe", borderRadius: 16, textAlign: "center" }}>
            <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.6 }}>
              Um junior CLT custa R$ 6.000 a R$ 7.000/mes com encargos. Ele faz pesquisa basica e organizacao de documentos. <strong style={{ color: "#020520" }}>O JuriAI faz o mesmo. Por R$ 497.</strong>
            </p>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>A diferenca de R$ 6.000/mês fica no seu escritório.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "96px 0", background: "#f0f4fe" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-1.48px", color: "#020520" }}>
              Perguntas frequentes.
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQ_DATA.map((faq, i) => (
              <details key={i} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <summary style={{ padding: "18px 24px", fontSize: 15, fontWeight: 500, color: "#020520", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {faq.q}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div style={{ padding: "0 24px 18px", borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.63 }}>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "96px 0", background: "#fcfcfc" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-1.48px", color: "#020520", marginBottom: 16 }}>
            Da proxima vez que o juiz perguntar "e onde esta isso?", você vai querer ter a resposta.
          </h2>
          <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.63, marginBottom: 32 }}>
            14 dias gratis. Sem cartao de credito. O escritório opera 24 horas enquanto você dorme.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/cadastro" style={{ display: "inline-block", padding: "12px 24px", background: "#020520", color: "white", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
              Criar conta do escritorio
            </Link>
            <Link href="/demo/dashboard" style={{ display: "inline-block", padding: "12px 24px", color: "#374151", fontSize: 14, textDecoration: "none" }}>
              Ver demonstracao
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#020520", color: "rgba(255,255,255,0.5)", padding: "40px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image src="/brand/gavel-tile.svg" width={22} height={22} alt="JuriAI" unoptimized />
              <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
                Juri<span style={{ color: "#145aff" }}>AI</span>
              </span>
            </div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {["Politica de Privacidade", "Termos de Uso", "Conformidade LGPD"].map(link => (
                <a key={link} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  {link}
                </a>
              ))}
              <a href="mailto:contato@juriai.adv" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                contato@juriai.adv
              </a>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 24, paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>JuriAI Solucoes Tecnologicas LTDA. CNPJ sob consulta.</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Base legal: Contrato de Prestação Art. 7 V LGPD.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

const FAQ_DATA = [
  { q: "O advogado pode ser punido pela OAB por usar IA juridica?", a: "A OAB permite o uso de IA desde que a saída seja revisada integralmente antes de uso em processo. O advogado permanece responsável. O JuriAI nunca substitui o julgamento profissional: reduz o trabalho de organização factual para que o socio titular dedique mais tempo a estratégia." },
  { q: "Como funciona a cobranca?", a: "R$ 497/mês para o plano Pro, cobrado mensalmente. Cancele quando quiser na sua conta. Periodo de teste gratuito de 14 dias, sem cartao de credito upfront." },
  { q: "O JuriAI garante que não vai inventar jurisprudência?", a: "O mecanismo de Anti-Alucinação marca todo fato sem documento comprovatorio como [FATO ALEGADO]. A IA nunca gera minuta final sem que o socio titular revise. O sistema nunca gera citação de norma ou precedente: isso é responsabilidade do advogado." },
  { q: "Posso usar com meu escritório de varios advogados?", a: "Sim. O plano Gold suporta ate 5 subcontas simultaneas. Cada advogado acessa com login proprio, é a trilha de auditoria registra quem fez cada alteração." },
  { q: "Preciso ter experiencia com tecnologia?", a: "Não. Sao 3 etapas: upload de documentos, revisãoo da matriz, exportação da minuta. Onboarding de 30 minutos incluido." },
  { q: "Os dados dos meus clientes estao seguros?", a: "Sim. Infraestrutura em territorio brasileiro. Arquivos com hash SHA-256. Base legal: contrato de prestação de servicos Art. 7, V da LGPD. Nunca compartilhados com terceiros." },
];
