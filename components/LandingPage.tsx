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

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#fcfcfc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/brand/gavel-tile.svg" width={28} height={28} alt="JuriAI" unoptimized />
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "#020520" }}>
              Juri<span style={{ color: "#145aff" }}>AI</span>
            </span>
          </Link>
          <ul style={{ display: "flex", alignItems: "center", gap: 28, listStyle: "none" }}>
            {["Como funciona", "Quanto custa", "Para quem e"].map(item => (
              <li key={item}>
                <a href={`#${item.toLowerCase().replace(" ", "-")}`}
                  style={{ fontSize: 15, fontWeight: 500, color: "#14141e", textDecoration: "none" }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: "#14141e", textDecoration: "none" }}>Entrar</Link>
            <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 20px", borderRadius: 9999, border: "1px solid #145aff", color: "#145aff", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
              Criar conta
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — Hook direto na dor */}
      <section style={{ background: "linear-gradient(to bottom, #f0f4fe, #fcfcfc)", paddingTop: 88, paddingBottom: 88 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          {/* Label */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "6px 14px", marginBottom: 28, fontSize: 12, fontWeight: 500, color: "#374151" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#145aff", display: "inline-block" }} />
            Inteligencia forense para advocacia civil
          </div>

          {/* Headline — hook na dor */}
          <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-1.51px", color: "#020520", maxWidth: 820, margin: "0 auto", marginBottom: 22 }}>
            Todo escritório tem fatos que não conseguiu provar. O seu não precisa ser um deles.
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: 18, lineHeight: 1.63, color: "#374151", maxWidth: 560, margin: "0 auto", marginBottom: 36 }}>
            O JuriAI conecta cada alegação da sua peça ao documento que a sustenta. Quando um fato não tem prova, você sabe <strong style={{ color: "#020520" }}>antes do juiz perguntar.</strong>
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", height: 46, padding: "0 36px", borderRadius: 9999, border: "1px solid #145aff", background: "#145aff", color: "white", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 0 100px -28px rgba(20,90,255,0.3)" }}>
              Verificar meu escritório
            </Link>
            <Link href="/demo/dashboard" style={{ display: "inline-flex", alignItems: "center", height: 46, padding: "0 36px", borderRadius: 9999, border: "1px solid #e2e8f0", background: "white", color: "#14141e", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
              Ver demonstração
            </Link>
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 14 }}>14 dias gratis. Sem cartao de credito. Cancele quando quiser.</p>
        </div>

        {/* Product Mockup — interface real do JuriAI */}
        <div style={{ maxWidth: 1100, margin: "48px auto 0", padding: "0 24px" }}>
          <div style={{ background: "white", borderRadius: 20, boxShadow: "0 0.36px 1.8px -1.4px rgba(0,0,0,0.08), 0 1.37px 6.87px -2.8px rgba(0,0,0,0.07), 0 6px 30px -4.25px rgba(0,0,0,0.016)", overflow: "hidden" }}>
            {/* Chrome bar */}
            <div style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[1,2,3].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#e2e8f0" }} />)}
              </div>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#6b7280", marginLeft: 8 }}>juriai.app / workspace</span>
            </div>
            {/* App interface */}
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: 380 }}>
              {/* Sidebar */}
              <div style={{ background: "#f8f9fa", borderRight: "1px solid #e2e8f0", padding: "16px 0" }}>
                <div style={{ padding: "0 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 24, height: 24, background: "#145aff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>JA</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#020520" }}>JuriAI</span>
                  </div>
                  {["Casos","Documentos","Modelos","Jurisprudencia"].map((item, i) => (
                    <div key={item} style={{ padding: "8px 12px", borderRadius: 6, background: i === 0 ? "#145aff" : "transparent", marginBottom: 2, cursor: "pointer" }}>
                      <span style={{ fontSize: 12, fontWeight: i === 0 ? 500 : 400, color: i === 0 ? "white" : "#374151" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Main content */}
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#020520", marginBottom: 2 }}>Caso: Cobranca de Alugueis Inadimplidos</h3>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>ID 0847/2024 — Atualizado em 22/08/2026</span>
                  </div>
                  <button style={{ height: 30, padding: "0 14px", borderRadius: 6, border: "none", background: "#145aff", color: "white", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Nova Peca</button>
                </div>
                {/* Status badges */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[{l:"12 fatos",c:"#145aff",bg:"#eff6ff"},{l:"9 provados",c:"#16ca2e",bg:"#f0fdf4"},{l:"3 alegados",c:"#f26052",bg:"#fef2f2"}].map(b => (
                    <span key={b.l} style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, background: b.bg, color: b.c }}>{b.l}</span>
                  ))}
                </div>
                {/* Table */}
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", background: "#f8f9fa", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>
                    {["Fato alegado","Documento","Status"].map(h => (
                      <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{h}</span>
                    ))}
                  </div>
                  {[
                    {f:"Contrato firmado em 15/01/2023", d:"Contrato.pdf — Clausula 1a, pag.1", s:"PROVADO", c:"#16ca2e", bg:"#f0fdf4"},
                    {f:"Inadimplemento a partir de 01/04/2024", d:"Extrato Nubank PJ — fl.14, linha 3", s:"PROVADO", c:"#16ca2e", bg:"#f0fdf4"},
                    {f:"R$ 18.750,00 em alugueis atrasados", d:"Planilha de calculo — fl.31", s:"PROVADO", c:"#16ca2e", bg:"#f0fdf4"},
                    {f:"Notificacao extrajudicial em 10/05/2024", d:"AR digital — nao verificado", s:"ALEGADO", c:"#f26052", bg:"#fef2f2"},
                  ].map((row, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", padding: "10px 12px", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none", background: "white" }}>
                      <span style={{ fontSize: 11, color: "#14141e" }}>{row.f}</span>
                      <span style={{ fontSize: 11, color: row.s === "ALEGADO" ? "#f26052" : "#6b7280", fontStyle: row.s === "ALEGADO" ? "italic" : "normal" }}>{row.d}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: row.bg, color: row.c, alignSelf: "center" }}>{row.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginTop: 12, fontFamily: "monospace" }}>
            Matriz Fato x Prova — cada linha vinculada ao documento de origem. Sem [FATO ALEGADO] onde ha prova.
          </p>
        </div>
      </section>

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
      <section id="como-funciona" style={{ padding: "96px 0", background: "#fcfcfc" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>O problema</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-1.48px", color: "#020520", marginBottom: 16 }}>
              O que você faz quando o juiz pergunta "e onde esta isso?"
            </h2>
            <p style={{ fontSize: 17, color: "#374151", maxWidth: 520, margin: "0 auto", lineHeight: 1.63 }}>
              Você tem 3 segundos para responder. Se não tiver o documento na mão — a cláusula, a data do e-mail, o valor do boleto — você perdeu o ponto. E talvez o caso.
            </p>
          </div>

          {/* 3 pain cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 56 }}>
            {[
              {
                t: "O socio não confia na pesquisa",
                d: "Associados produzem peças com fatos que não dao para provar. O socio titular relê tudo antes de protocolar. Sao 3 horas de trabalho braçal por peça."
              },
              {
                t: "A lacuna aparece no tribunal",
                d: "O juiz pergunta pelo documento. O advogado não tem. Perde o ponto. O caso vira uma discussao sobre a ausencia de prova — não sobre o merito."
              },
              {
                t: "O escritório não escala",
                d: "Para crescer, você precisa de mais gente. Mais gente significa mais custo fixo, mais gestao, mais risco. E você continua fazendo a mesma quantidade de trabalho estrategico."
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
              O JuriAI mostra exatamente o que você tem antes de você ajuizar.
            </h2>
            <p style={{ fontSize: 17, color: "#374151", maxWidth: 520, margin: "0 auto", lineHeight: 1.63 }}>
              Transforma cada documento do seu escritório em um mapa navegavel. Para cada fato alegado, ele mostra: onde esta provado, onde falta prova, é o que acontece se você ajuizar sem ela.
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

          {/* Steps are shown below in the clean feature cards */}

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
                <span style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, background: "#f0fdf4", color: "#16ca2e" }}>9 provados</span>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, background: "#fef2f2", color: "#f26052" }}>2 alegados</span>
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
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: row.bg, color: row.c, alignSelf: "center" }}>{row.s}</span>
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
            <div style={{ background: "white", borderRadius: 40, padding: 40, border: "1px solid #e2e8f0" }}>
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
              <Link href="/cadastro" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 46, borderRadius: 9999, border: "1px solid #e2e8f0", background: "white", color: "#14141e", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
                Comecar teste gratis
              </Link>
            </div>

            {/* Gold */}
            <div style={{ background: "white", borderRadius: 40, padding: 40, border: "2px solid #145aff", boxShadow: "0 0 100px -28px rgba(20,90,255,0.1)" }}>
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 24, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.08em" }}>JuriAI Gold</span>
                  <span style={{ fontSize: 10, fontWeight: 600, background: "#145aff", color: "white", padding: "2px 8px", borderRadius: 9999 }}>Popular</span>
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
              <Link href="/cadastro" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 46, borderRadius: 9999, border: "1px solid #145aff", background: "#145aff", color: "white", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 0 80px -20px rgba(20,90,255,0.3)" }}>
                Comecar teste gratis
              </Link>
            </div>
          </div>

          {/* Price anchor */}
          <div style={{ maxWidth: 560, margin: "40px auto 0", padding: "24px 28px", background: "#f0f4fe", borderRadius: 16, textAlign: "center" }}>
            <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.6 }}>
              Um junior CLT custa R$ 6.000 a R$ 7.000/mes com encargos. Ele faz pesquisa basica é organização de documentos. <strong style={{ color: "#020520" }}>O JuriAI faz o mesmo. Por R$ 497.</strong>
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
            <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", height: 48, padding: "0 36px", borderRadius: 9999, border: "1px solid #145aff", background: "#145aff", color: "white", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 0 100px -28px rgba(20,90,255,0.3)" }}>
              Criar conta do escritório
            </Link>
            <Link href="/demo/dashboard" style={{ display: "inline-flex", alignItems: "center", height: 48, padding: "0 36px", borderRadius: 9999, border: "1px solid #e2e8f0", background: "white", color: "#14141e", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
              Ver demonstração
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
