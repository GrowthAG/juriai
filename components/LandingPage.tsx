"use client";
import Image from "next/image";
import Link from "next/link";

export function LandingPage() {
  return (
    <main style={{ background: "#fcfcfc", color: "#14141e", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", minHeight: "100vh" }}>

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
            {["Produto", "Como funciona", "Precos", "Seguranca"].map(item => (
              <li key={item}>
                <a href={`#${item.toLowerCase().replace(" ", "-")}`}
                  style={{ fontSize: 15, fontWeight: 500, color: "#14141e", textDecoration: "none", transition: "color 0.2s" }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: "#14141e", textDecoration: "none" }}>Entrar</Link>
            <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 20px", borderRadius: 9999, border: "1px solid #145aff", background: "transparent", color: "#145aff", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}>
              Criar conta
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(to bottom, #f0f4fe, #fcfcfc)", paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "6px 14px", marginBottom: 24, fontSize: 12, fontWeight: 500, color: "#374151" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#145aff", display: "inline-block" }} />
            Plataforma de inteligencia forense para advocacia civil
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-1.51px", color: "#020520", maxWidth: 800, margin: "0 auto", marginBottom: 20 }}>
            Estruture casos. Redija pecas. Comprove tudo.
          </h1>
          <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.63, color: "#374151", maxWidth: 560, margin: "0 auto", marginBottom: 32 }}>
            O JuriAI conecta fatos a provas documentais. Cada alegacao sem documento recebe marca [FATO ALEGADO]. O escritorio sabe exatamente o que tem e o que falta antes de ajuizar.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 32px", borderRadius: 9999, border: "1px solid #145aff", background: "#145aff", color: "white", fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "background 0.2s", boxShadow: "0 0 100px -28px rgba(20,90,255,0.3)" }}>
              Comecar teste gratis
            </Link>
            <Link href="/demo/dashboard" style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 32px", borderRadius: 9999, border: "1px solid #e2e8f0", background: "white", color: "#14141e", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "border-color 0.2s" }}>
              Ver cockpit
            </Link>
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 14 }}>14 dias gratis. Sem cartao de credito upfront.</p>
        </div>

        <div style={{ maxWidth: 1000, margin: "40px auto 0", padding: "0 24px" }}>
          <div style={{ background: "white", borderRadius: 24, boxShadow: "0 0.36px 1.8px -1.4px rgba(0,0,0,0.08), 0 1.37px 6.87px -2.8px rgba(0,0,0,0.07), 0 6px 30px -4.25px rgba(0,0,0,0.016)", overflow: "hidden" }}>
            <div style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[1,2,3].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#e2e8f0" }} />)}
              </div>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#6b7280", marginLeft: 8 }}>juriai.app / workspace</span>
            </div>
            <Image src="/site/juriai-dashboard-real.png" width={1512} height={880} alt="Dashboard do JuriAI" style={{ width: "100%", height: "auto", display: "block" }} unoptimized />
          </div>
        </div>
      </section>

      {/* LOGO STRIP */}
      <section style={{ padding: "40px 0", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", marginBottom: 24, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Escritorios de advocacia ja utilizam o JuriAI
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, flexWrap: "wrap", opacity: 0.4, filter: "grayscale(100%)" }}>
            {["Escritorio Alpha", "Banca Beta", "Camara Gamma", "Sociedade Delta", "Associacao Epsilon", "Instituto Zeta"].map(name => (
              <span key={name} style={{ fontSize: 14, fontWeight: 600, color: "#14141e", letterSpacing: "-0.01em" }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ padding: "80px 0", background: "#fcfcfc" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Esteira forense</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-1.48px", color: "#020520", marginBottom: 14 }}>
              Quatro etapas que transformam documento em peca.
            </h2>
            <p style={{ fontSize: 16, color: "#374151", maxWidth: 480, margin: "0 auto" }}>
              De contratos e e-mails a uma minuta auditada, rastreavel e pronta para revisao do socio.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { n: "01", t: "Custodia de Provas", d: "Upload de contratos, e-mails e prints. Cada arquivo recebe hash SHA-256. Integridade forense garantida." },
              { n: "02", t: "Matriz Fato x Prova", d: "A IA extrai cada fato alegado e o vincula ao documento de origem. Fatos sem prova aparecem como [FATO ALEGADO]." },
              { n: "03", t: "Auditoria de Lacunas", d: "O sistema identifica automaticamente o que falta para cada tese prosperar. Sem adivinhacao." },
              { n: "04", t: "Minuta Rastreavel", d: "Peticao exportada no seu papel timbrado. Cada paragrafo cita a prova de origem. Revisao em minutos." },
            ].map(step => (
              <div key={step.n} style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 0 4px -2px rgba(0,0,0,0.1)" }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#145aff", display: "block", marginBottom: 12 }}>{step.n}</span>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "#020520", marginBottom: 8, lineHeight: 1.3 }}>{step.t}</h3>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.55 }}>{step.d}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginTop: 32 }}>
            <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 0.36px 1.8px -1.4px rgba(0,0,0,0.08), 0 1.37px 6.87px -2.8px rgba(0,0,0,0.07)" }}>
              <div style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {[1,2,3].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#e2e8f0" }} />)}
                </div>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#6b7280", marginLeft: 8 }}>juriai.app / novo-caso</span>
              </div>
              <Image src="/site/juriai-wizard-real.png" width={1512} height={880} alt="Wizard de novo caso" style={{ width: "100%", height: "auto", display: "block" }} unoptimized />
            </div>
            <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 0.36px 1.8px -1.4px rgba(0,0,0,0.08), 0 1.37px 6.87px -2.8px rgba(0,0,0,0.07)" }}>
              <div style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {[1,2,3].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#e2e8f0" }} />)}
                </div>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#6b7280", marginLeft: 8 }}>juriai.app / matriz-fato-prova</span>
              </div>
              <Image src="/site/juriai-dashboard-real.png" width={1512} height={880} alt="Matriz Fato x Prova" style={{ width: "100%", height: "auto", display: "block" }} unoptimized />
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANCA */}
      <section id="seguranca" style={{ padding: "80px 0", background: "#f0f4fe" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Seguranca e conformidade</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-1.48px", color: "#020520" }}>
              O que o socio titular precisa saber.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { t: "Sigilo Profissional", d: "Dados nunca saem do escritorio. Arquivos recebem hash SHA-256 no upload. Base legal: contrato Art. 7 V LGPD." },
              { t: "Anti-Alucinacao", d: "Todo fato sem documento comprovatorio e marcado como [FATO ALEGADO]. A IA nunca gera minuta final sem revisao do socio." },
              { t: "DataJud CJF", d: "90+ tribunais integrados via架DataJud. Busca automatica de jurisprudencia atualizada diretamente das fontes oficiais." },
              { t: "Conformidade LGPD", d: "Infraestrutura em territorio brasileiro. Arquivos com hash SHA-256. Sem compartilhamento com terceiros." },
              { t: "Papel Timbrado", d: "Peticoes exportadas no timbre oficial da banca. Revisao do socio titular em minutos, nao em horas de trabalho." },
              { t: "Trilha de Auditoria", d: "Cada alteracao no caso e registrada com timestamp e usuario. Historico completo de quem fez o que e quando." },
            ].map(item => (
              <div key={item.t} style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#145aff", display: "inline-block", flexShrink: 0 }} />
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#020520" }}>{item.t}</h3>
                </div>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.55 }}>{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECOS */}
      <section id="precos" style={{ padding: "80px 0", background: "#fcfcfc" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Precificacao</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-1.48px", color: "#020520", marginBottom: 14 }}>
              Preco fixo. Sem truque de primeiro mes.
            </h2>
            <p style={{ fontSize: 16, color: "#374151" }}>Voce sabe exatamente o que recebe. Cancele quando quiser.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 720, margin: "0 auto" }}>
            {/* Pro */}
            <div style={{ background: "white", borderRadius: 40, padding: 40, border: "1px solid #e2e8f0" }}>
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 24, marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>JuriAI Pro</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 600, color: "#020520", letterSpacing: "-1px" }}>R$ 497</span>
                  <span style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>/mes</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Cobrado mensalmente. Cancele quando quiser.</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {["Casos ilimitados","Upload ilimitado de documentos","Matriz Fato x Prova automatica","Auditoria de lacunas probatorias","Exportacao em papel timbrado","90+ tribunais DataJud integrados","Sigilo SHA-256 por arquivo","Suporte em 24h"].map(feat => (
                  <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#374151" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16ca2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 44, marginTop: 28, borderRadius: 9999, border: "1px solid #e2e8f0", background: "white", color: "#14141e", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                Comecar teste gratis
              </Link>
            </div>
            {/* Gold */}
            <div style={{ background: "white", borderRadius: 40, padding: 40, border: "2px solid #145aff", boxShadow: "0 0 100px -28px rgba(20,90,255,0.1)" }}>
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 24, marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#145aff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>JuriAI Gold</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 600, color: "#020520", letterSpacing: "-1px" }}>R$ 697</span>
                  <span style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>/mes</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Cobrado mensalmente. Cancele quando quiser.</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {["Tudo do plano Pro","ate 5 subcontas","Pipeline de casos com graficos","Automacao de alertas de prazo","Historico de versoes de minutas","API de integracao","Priority support ate 4h","Onboarding assistido"].map(feat => (
                  <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#374151" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16ca2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 44, marginTop: 28, borderRadius: 9999, border: "1px solid #145aff", background: "#145aff", color: "white", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Comecar teste gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 0", background: "#f0f4fe" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-1.48px", color: "#020520" }}>
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
      <section style={{ padding: "80px 0", background: "#fcfcfc" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-1.48px", color: "#020520", marginBottom: 14 }}>
            Construa o dossiê do seu caso em minutos. Revise a peca em horas.
          </h2>
          <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.63, marginBottom: 28 }}>
            14 dias gratis. Sem cartao de credito. Cancele quando quiser. O escritorio opera 24 horas enquanto voce dorme.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 32px", borderRadius: 9999, border: "1px solid #145aff", background: "#145aff", color: "white", fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: "0 0 100px -28px rgba(20,90,255,0.3)" }}>
              Criar conta do escritorio
            </Link>
            <Link href="/demo/dashboard" style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 32px", borderRadius: 9999, border: "1px solid #e2e8f0", background: "white", color: "#14141e", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
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
                <a key={link} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}>
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
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Base legal: Contrato de Prestacao Art. 7 V LGPD.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

const FAQ_DATA = [
  { q: "O advogado pode ser punido pela OAB por usar IA juridica?", a: "A OAB permite o uso de IA desde que a saida seja revisada integralmente antes de uso em processo. O advogado permanece responsavel. O JuriAI nunca substitui o julgamento profissional: reduz o trabalho braçal de organizacao factual para que o socio titular dedique mais tempo a estrategia." },
  { q: "Onde os dados dos meus clientes sao armazenados?", a: "Todos os dados sao processados em infraestrutura em territorio brasileiro. A base legal e o contrato de prestacao de servicos (Art. 7, V da LGPD). Os arquivos recebem hash SHA-256 no upload e nunca sao compartilhados com terceiros." },
  { q: "O JuriAI garante que nao vai inventar jurisprudencia?", a: "O mecanismo de Anti-Alucinacao marca todo fato sem documento comprovatorio como [FATO ALEGADO]. A IA nao gera minuta final sem que o socio titular revise. O sistema nunca gera citacao de norma ou precedente: isso e responsabilidade do advogado." },
  { q: "Em quanto tempo consigo ver resultado apos criar a conta?", a: "O primeiro caso pode ser estruturado em menos de 15 minutos apos o upload dos documentos. A matriz Fato x Prova e gerada automaticamente." },
  { q: "Preciso ter experiencia com tecnologia para usar?", a: "Nao. Sao 3 etapas: upload de documentos, revisao da matriz, exportacao da minuta. O escritorio nao precisa aprender comandos ou engenharia de prompt." },
  { q: "Posso testar antes de assinar um plano?", a: "Sim. O periodo de teste gratuito de 14 dias nao exige cartao de credito upfront. Acesso completo ao Plano Pro durante o trial." },
];
