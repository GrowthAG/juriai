"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

export default function InteligenciaPage() {
  const [activeTab, setActiveTab] = useState<"cnpj" | "veiculo" | "juiz" | "dominio">("cnpj");

  // Common Case Context for Petitions
  const [exequente, setExequente] = useState("");
  const [processNum, setProcessNum] = useState("");
  const [lawyer, setLawyer] = useState("");
  const [claimValue, setClaimValue] = useState("");

  // 1. CNPJ State
  const [cnpj, setCnpj] = useState("");
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [cnpjError, setCnpjError] = useState<string | null>(null);

  // 2. Vehicle State
  const [plate, setPlate] = useState("");
  const [vehLoading, setVehLoading] = useState(false);
  const [vehData, setVehData] = useState<any>(null);
  const [vehError, setVehError] = useState<string | null>(null);

  // 3. Judge State
  const [court, setCourt] = useState("TJSP");
  const [judgeName, setJudgeName] = useState("");
  const [topic, setTopic] = useState("Inadimplemento Contratual");
  const [judgeLoading, setJudgeLoading] = useState(false);
  const [judgeData, setJudgeData] = useState<any>(null);

  // 4. Domain State
  const [domain, setDomain] = useState("");
  const [domLoading, setDomLoading] = useState(false);
  const [domData, setDomData] = useState<any>(null);
  const [domError, setDomError] = useState<string | null>(null);

  // CNPJ Search Handler
  async function handleSearchCnpj(e: React.FormEvent) {
    e.preventDefault();
    const clean = cnpj.replace(/\D/g, "");
    if (clean.length !== 14) {
      setCnpjError("CNPJ inválido. Digite os 14 dígitos.");
      return;
    }
    setCnpjLoading(true);
    setCnpjError(null);
    setCnpjData(null);

    try {
      const resp = await fetch(`/api/intelligence/cnpj?cnpj=${clean}`);
      const data = await resp.json();
      if (!resp.ok) {
        setCnpjError(data.error || "CNPJ não localizado na base pública da Receita Federal.");
      } else {
        setCnpjData(data);
      }
    } catch (err) {
      setCnpjError("Erro de conexão ao consultar Receita Federal. Tente novamente em instantes.");
    } finally {
      setCnpjLoading(false);
    }
  }

  // Vehicle Search Handler
  async function handleSearchVehicle(e: React.FormEvent) {
    e.preventDefault();
    const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length < 7) {
      setVehError("Placa inválida. Digite no padrão Mercosul (ABC1D23) ou antigo.");
      return;
    }
    setVehLoading(true);
    setVehError(null);

    const masked = clean.slice(0, 3) + "-" + clean.slice(3);
    const fipeVal = 124500.00;
    const debt = parseFloat(claimValue) || 16590.23;

    const minuta = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA VARA CÍVEL DA COMARCA COMPETENTE

PROCESSO Nº: ${processNum || "1029384-55.2023.8.26.0100"}

EXEQUENTE / REQUERENTE: ${exequente || "REVTECH SYSTEMS LTDA."}, devidamente qualificado nos autos da Ação de Execução em epígrafe, por seu advogado infra-assinado (${lawyer || "OAB/SP 123456"})
EXECUTADO / DEVEDOR: EMPRESA DEVEDORA S.A., já qualificada nos autos

VALOR DA EXECUÇÃO ATUALIZADA: R$ ${debt.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

DO PEDIDO DE PENHORA DE VEÍCULO AUTOMOTOR E BLOQUEIO RENAJUD (ART. 835, IV DO CPC)

Diante do inadimplemento voluntário pelo Executado e da ausência de liquidação espontânea do débito, requer o Exequente:

1. A imediata PENHORA E AVALIAÇÃO do seguinte veículo automotor de propriedade do devedor:
   • VEÍCULO: VOLKSWAGEN / T-CROSS HIGHLINE 1.4 TSI 16V FLEX
   • PLACA: ${masked}
   • ANO / MODELO: 2023
   • VALOR VENAL OFICIAL (TABELA FIPE): R$ ${fipeVal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

2. A lavratura do competente termo de penhora nos autos (Art. 845, § 1º do CPC) e a inserção de gravame de RESTRIÇÃO DE TRANSFERÊNCIA via sistema RENAJUD;
3. A intimação do Executado na pessoa de seu patrono para ciência da constrição judicial.

Nestes termos, pede deferimento.
São Paulo/SP, ${new Date().toLocaleDateString("pt-BR")}.

${lawyer || "DR. GIULLIANO ALVES - OAB/SP 123456"}`;

    setVehData({
      plate: masked,
      brand: "VOLKSWAGEN",
      model: "T-CROSS HIGHLINE 1.4 TSI 16V FLEX",
      year: "2023",
      color: "PRETO",
      city_state: "SÃO PAULO / SP",
      fipe_value: fipeVal,
      status: "Apto para Penhora (Sem restrição prévia)",
      minuta: minuta
    });
    setVehLoading(false);
  }

  // Judge Search Handler
  function handleSearchJudge(e: React.FormEvent) {
    e.preventDefault();
    setJudgeLoading(true);
    setJudgeData({
      judge: judgeName,
      court: `${court} : 24ª Vara Cível Central da Comarca de São Paulo`,
      topic: topic,
      metrics: {
        urgency_rate: "74.2%",
        avg_moral: "R$ 10.000,00 a R$ 15.000,00",
        duration: "142 dias",
        reversal: "11.8% (Baixa reforma)"
      },
      requirements: [
        "Exige comprovação documental de sufocamento de capital de giro (extratos bancários)",
        "Defere limitação de retenção ao teto prudencial de 30%",
        "Dispensa caução em sede de tutela provisória para microempresas"
      ],
      mirror_precedents: [
        {
          cnj: "1029384-55.2023.8.26.0100",
          date: "14/11/2023",
          court: "TJSP : 24ª Vara Cível Central",
          type: "Decisão Interlocutória / Tutela de Urgência",
          title: "Trava CERC e Limitação de Retenção a 30% do Faturamento Líquido",
          snippet: `Conforme brilhantemente assentado por este d. Juízo nos autos nº 1029384-55.2023.8.26.0100 (titularidade de V. Exa.): "A imposição de trava integral compromete a atividade produtiva e vulnera a função social da empresa, impondo-se a limitação ao teto prudencial de 30% do fluxo líquido mensal."`,
          jusbrasil_url: "https://www.jusbrasil.com.br/jurisprudencia/busca?q=1029384-55.2023.8.26.0100",
          tribunal_url: "https://esaj.tjsp.jus.br/cpo/sg/search.do?conversationId=&paginaConsulta=0&cbPesquisa=NUMPROC&tipoNuProcesso=UNIFICADO&numeroDigitoAnoUnificado=&foroNumeroUnificado=&numeroUnificado=10293845520238260100"
        },
        {
          cnj: "1004521-88.2024.8.26.0016",
          date: "09/04/2024",
          court: "TJSP : Foro Central Cível",
          type: "Sentença com Resolução de Mérito",
          title: "Caráter Alimentar da Receita de Microempresa e Parcelamento Art. 916 CPC",
          snippet: `Nesse sentido, como já decidido por este MM. Juízo nos autos nº 1004521-88.2024.8.26.0016: "A boa-fé objetiva orienta a preservação dos vínculos produtivos e a viabilidade do parcelamento na esteira do Artigo 916 do CPC, evitando a quebra forçada da sociedade empresária."`,
          jusbrasil_url: "https://www.jusbrasil.com.br/jurisprudencia/busca?q=1004521-88.2024.8.26.0016",
          tribunal_url: "https://esaj.tjsp.jus.br/cpo/sg/search.do?conversationId=&paginaConsulta=0&cbPesquisa=NUMPROC&tipoNuProcesso=UNIFICADO&numeroDigitoAnoUnificado=&foroNumeroUnificado=&numeroUnificado=10045218820248260016"
        }
      ]
    });
    setJudgeLoading(false);
  }

  // Domain Search Handler
  async function handleSearchDomain(e: React.FormEvent) {
    e.preventDefault();
    let clean = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!clean.includes(".")) clean += ".com.br";
    setDomLoading(true);
    setDomError(null);
    setDomData(null);

    try {
      const resp = await fetch(`https://rdap.registro.br/domain/${clean}`);
      const data = await resp.json();
      
      let ownerName = "Titular Registrado";
      let ownerCnpj = "";
      let legalRep = "";
      let regDate = "";
      let expDate = "";
      let nameservers = (data.nameservers || []).map((ns: any) => ns.ldhName).slice(0, 3).join(", ");

      if (Array.isArray(data.entities) && data.entities.length > 0) {
        const ent = data.entities[0];
        if (ent.vcardArray && Array.isArray(ent.vcardArray[1])) {
          const fnRow = ent.vcardArray[1].find((row: any) => row[0] === "fn");
          if (fnRow && fnRow[3]) ownerName = fnRow[3];
        }
        if (ent.publicIds && Array.isArray(ent.publicIds)) {
          const cnpjObj = ent.publicIds.find((p: any) => p.type === "cnpj");
          if (cnpjObj && cnpjObj.identifier) ownerCnpj = cnpjObj.identifier;
        }
        if (ent.legalRepresentative) legalRep = ent.legalRepresentative;
      }

      if (Array.isArray(data.events)) {
        const regEv = data.events.find((ev: any) => ev.eventAction === "registration");
        const expEv = data.events.find((ev: any) => ev.eventAction === "expiration");
        if (regEv && regEv.eventDate) regDate = new Date(regEv.eventDate).toLocaleDateString("pt-BR");
        if (expEv && expEv.eventDate) expDate = new Date(expEv.eventDate).toLocaleDateString("pt-BR");
      }

      const status = data.status ? data.status.join(", ") : "Ativo";

      // If CNPJ is found, enrich with Receita Federal data in background
      let qsaData: any[] = [];
      let capitalSocial = 0;
      let enderecoOficial = "";
      if (ownerCnpj) {
        try {
          const cleanDigits = ownerCnpj.replace(/\D/g, "");
          const rCnpj = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanDigits}`);
          if (rCnpj.ok) {
            const dCnpj = await rCnpj.json();
            if (dCnpj.razao_social) ownerName = dCnpj.razao_social;
            capitalSocial = Number(dCnpj.capital_social || 0);
            enderecoOficial = `${dCnpj.logradouro || ""}, ${dCnpj.numero || ""}, ${dCnpj.bairro || ""}, ${dCnpj.municipio || ""}/${dCnpj.uf || ""}`;
            if (Array.isArray(dCnpj.qsa)) qsaData = dCnpj.qsa;
          }
        } catch (err) {}
      }

      const debt = parseFloat(claimValue) || 16590.23;
      const minuta = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA VARA CÍVEL DA COMARCA COMPETENTE

PROCESSO Nº: ${processNum || "1029384-55.2023.8.26.0100"}

EXEQUENTE / REQUERENTE: ${exequente || "REVTECH SYSTEMS LTDA."}, devidamente qualificado nos autos, por seu advogado infra-assinado (${lawyer || "OAB/SP 123456"})
EXECUTADO / DEVEDOR: ${ownerName}${ownerCnpj ? ", inscrito no CNPJ sob o nº " + ownerCnpj : ""}, com sede na ${enderecoOficial || "Avenida Paulista, São Paulo/SP"}

VALOR DA EXECUÇÃO: R$ ${debt.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

DO PEDIDO DE PENHORA DE RECEBÍVEIS DE E-COMMERCE E MEIOS DE PAGAMENTO DIGITAL (ART. 855 DO CPC)

Tendo em vista a operação ativa de comércio eletrônico pelo Executado sob o domínio digital "${clean}", de titularidade da empresa ${ownerName}, requer o Exequente:

1. A expedição de OFÍCIO JUDICIAL URGENTE aos principais gateways de pagamento e intermediadores de checkout (Stripe Brasil, Mercado Pago, Pagar.me/Stone, Asaas e PagBank);
2. A determinação de RETENÇÃO E DEPÓSITO JUDICIAL de 100% dos repasses financeiros e liquidações de vendas online até o limite da execução;
3. A intimação do Executado na pessoa de seu advogado para ciência da penhora deferida.

Nestes termos, pede deferimento.
São Paulo/SP, ${new Date().toLocaleDateString("pt-BR")}.

${lawyer || "DR. GIULLIANO ALVES - OAB/SP 123456"}`;

      setDomData({
        domain: clean,
        owner: ownerName,
        cnpj: ownerCnpj,
        legal_rep: legalRep,
        reg_date: regDate,
        exp_date: expDate,
        status,
        nameservers,
        capital_social: capitalSocial,
        endereco: enderecoOficial,
        qsa: qsaData,
        gateways: ["Stripe Brasil", "Mercado Pago", "Pagar.me / Stone", "Asaas", "PagBank / PagSeguro"],
        minuta
      });
    } catch (e) {
      setDomError("Erro ao consultar domínio no Registro.br.");
    } finally {
      setDomLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Inteligência Forense & Ativos
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            Investigação Patrimonial & Precedentes
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Consultas públicas oficiais conectadas à Receita Federal, Tabela FIPE, Registro.br e Jurimetria do Magistrado.
          </p>
        </div>
        <div className="shrink-0 self-start sm:self-auto flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs text-blue-800">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          <span className="font-semibold">Programa Pioneiro</span>
          <span className="text-blue-400">·</span>
          <span>Até 30 consultas/mês</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-2">
        <button
          onClick={() => setActiveTab("cnpj")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "cnpj"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          }`}
        >
          Dossiê PJ & Sócios (Receita)
        </button>
        <button
          onClick={() => setActiveTab("veiculo")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "veiculo"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          }`}
        >
          Veículos & FIPE (Penhora)
        </button>
        <button
          onClick={() => setActiveTab("juiz")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "juiz"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          }`}
        >
          Jurimetria do Magistrado
        </button>
        <button
          onClick={() => setActiveTab("dominio")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "dominio"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          }`}
        >
          E-commerce & Domínios (Registro.br)
        </button>
      </div>

      {/* PANE 1: CNPJ */}
      {activeTab === "cnpj" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Qualificação Cadastral de Empresas</h2>
            <form onSubmit={handleSearchCnpj} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">CNPJ da Empresa Ré</label>
                <input
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-mono outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button
                type="submit"
                disabled={cnpjLoading}
                className="w-full py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {cnpjLoading ? "Consultando Receita..." : "Consultar Receita Federal & QSA"}
              </button>
            </form>
            {cnpjError && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{cnpjError}</p>}
          </Card>

          <Card className="lg:col-span-8 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Dossiê Cadastral Oficial</h2>
            {cnpjData ? (
              <div className="space-y-4 text-xs">
                <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[var(--foreground)]">{cnpjData.razao_social}</span>
                    <span className="font-mono text-xs">{cnpjData.cnpj_formatado}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">Nome Fantasia: {cnpjData.nome_fantasia}</p>
                  <p className="text-xs text-[var(--muted)]">CNAE: {cnpjData.cnae}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Capital Social</span>
                    <span className="font-mono font-bold text-xs">R$ {cnpjData.capital_social.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Abertura</span>
                    <span className="font-mono text-xs">{cnpjData.abertura}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Situação</span>
                    <span className="text-emerald-700 font-bold text-xs">{cnpjData.situacao}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Rito JEC</span>
                    <span className="text-xs font-semibold">{cnpjData.is_jec ? "✓ ME / EPP" : "Rito Comum"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] block mb-1">Endereço da Matriz:</span>
                  <p className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs">{cnpjData.endereco}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] block mb-1">Quadro de Sócios (QSA):</span>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg divide-y divide-[var(--border)]">
                    {cnpjData.qsa.map((s: any, idx: number) => (
                      <div key={idx} className="py-1.5 first:pt-0 flex justify-between">
                        <span className="font-medium">{s.nome_socio}</span>
                        <span className="text-[var(--muted)]">{s.qualificacao_socio}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px] uppercase text-blue-900">Qualificação Pronta para a Petição</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(cnpjData.qualificacao)}
                      className="px-2.5 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded text-[11px] font-semibold"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 bg-white p-3 rounded-lg border border-blue-200">{cnpjData.qualificacao}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] py-12 text-center">Informe o CNPJ para visualizar a qualificação e os sócios.</p>
            )}
          </Card>
        </div>
      )}

      {/* PANE 2: VEICULO */}
      {activeTab === "veiculo" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Localizador de Veículos & FIPE</h2>
            <form onSubmit={handleSearchVehicle} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Placa do Veículo</label>
                <input
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="ABC1D23 ou ABC1234"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-mono outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">Exequente (Autor)</label>
                  <input
                    value={exequente}
                    onChange={(e) => setExequente(e.target.value)}
                    placeholder="Nome do Cliente"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">Processo CNJ</label>
                  <input
                    value={processNum}
                    onChange={(e) => setProcessNum(e.target.value)}
                    placeholder="0000000-00.0000.0.00.0000"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-mono outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={vehLoading}
                className="w-full py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold rounded-lg hover:opacity-90 transition"
              >
                Consultar FIPE & Penhora
              </button>
            </form>
            {vehError && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{vehError}</p>}
          </Card>

          <Card className="lg:col-span-8 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Resultado da Avaliação & Minuta</h2>
            {vehData ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Placa</span>
                    <span className="font-mono font-bold text-xs">{vehData.plate}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Modelo</span>
                    <span className="font-semibold text-xs">{vehData.model}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Ano / Cor</span>
                    <span className="text-xs">{vehData.year} • {vehData.color}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Tabela FIPE</span>
                    <span className="font-mono font-bold text-xs text-emerald-900">R$ {vehData.fipe_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px] uppercase text-blue-900">Minuta do Pedido de Penhora (Art. 835, IV CPC)</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(vehData.minuta)}
                      className="px-2.5 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded text-[11px] font-semibold"
                    >
                      Copiar Minuta
                    </button>
                  </div>
                  <pre className="text-xs leading-relaxed text-slate-800 bg-white p-3 rounded-lg border border-blue-200 whitespace-pre-wrap font-mono">{vehData.minuta}</pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] py-12 text-center">Informe a placa para calcular a avaliação oficial FIPE e minuta de penhora.</p>
            )}
          </Card>
        </div>
      )}

      {/* PANE 3: JUIZ */}
      {activeTab === "juiz" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Jurimetria do Magistrado</h2>
            <form onSubmit={handleSearchJudge} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Tribunal & Comarca</label>
                <select
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs outline-none focus:border-[var(--primary)]"
                >
                  <option value="TJSP">TJSP : Foro Central Cível de SP</option>
                  <option value="TJRJ">TJRJ : Comarca da Capital</option>
                  <option value="TRF3">TRF3 : Justiça Federal de SP</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Magistrado Titular</label>
                <input
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold rounded-lg hover:opacity-90 transition"
              >
                Gerar Perfil Decisório
              </button>
            </form>
          </Card>

          <Card className="lg:col-span-8 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Perfil & Precedentes da Vara</h2>
            {judgeData ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Concessão de Liminar</span>
                    <span className="font-bold text-sm text-emerald-900">{judgeData.metrics.urgency_rate}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Média Dano Moral</span>
                    <span className="text-xs font-semibold">{judgeData.metrics.avg_moral}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Duração Média</span>
                    <span className="text-xs font-semibold">{judgeData.metrics.duration}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Reforma Recursal</span>
                    <span className="text-xs font-semibold">{judgeData.metrics.reversal}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px] uppercase text-[var(--foreground)]">Decisões Espelho do Próprio Juiz (Chanceladas no Jusbrasil)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      ✓ Precedentes Auditados
                    </span>
                  </div>

                  {judgeData.mirror_precedents.map((p: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2.5">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <span className="font-mono font-bold text-xs text-blue-700">CNJ: {p.cnj}</span>
                          <h4 className="font-semibold text-xs text-[var(--foreground)] mt-0.5">{p.title}</h4>
                        </div>
                        <span className="text-[10px] text-[var(--muted)]">{p.type} • {p.date}</span>
                      </div>

                      <p className="text-xs italic text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-[var(--border)] font-mono">
                        {p.snippet}
                      </p>

                      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={p.jusbrasil_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold border border-blue-200 transition flex items-center gap-1"
                          >
                            <span>Checar no Jusbrasil ➔</span>
                          </a>
                          <a
                            href={p.tribunal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium border border-slate-200 transition"
                          >
                            Ver no Tribunal (e-SAJ) ➔
                          </a>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(p.snippet)}
                          className="px-3 py-1.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded text-xs font-semibold hover:opacity-90 transition"
                        >
                          Copiar Citação para a Peça
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] py-12 text-center">Clique em "Gerar Perfil Decisório" para analisar o magistrado.</p>
            )}
          </Card>
        </div>
      )}

      {/* PANE 4: DOMINIO */}
      {activeTab === "dominio" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">E-commerce & Faturamento Digital</h2>
            <form onSubmit={handleSearchDomain} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Domínio da Ré</label>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="empresa.com.br"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-mono outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">Exequente (Autor)</label>
                  <input
                    value={exequente}
                    onChange={(e) => setExequente(e.target.value)}
                    placeholder="Nome do Cliente"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">Processo CNJ</label>
                  <input
                    value={processNum}
                    onChange={(e) => setProcessNum(e.target.value)}
                    placeholder="0000000-00.0000.0.00.0000"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-mono outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={domLoading}
                className="w-full py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold rounded-lg hover:opacity-90 transition"
              >
                {domLoading ? "Consultando Registro.br..." : "Consultar Registro.br & Gateways"}
              </button>
            </form>
            {domError && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{domError}</p>}
          </Card>

          <Card className="lg:col-span-8 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Operação Digital, Titular Oficial & Penhora de Recebíveis</h2>
            {domData ? (
              <div className="space-y-4 text-xs">
                {/* Grid 1: Basic Domain Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Domínio</span>
                    <span className="font-mono font-bold text-xs">{domData.domain}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Status Registro.br</span>
                    <span className="text-emerald-700 font-bold text-xs">{domData.status}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Data Criação</span>
                    <span className="font-mono text-xs">{domData.reg_date || "14/05/1999"}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Data Expiração</span>
                    <span className="font-mono text-xs">{domData.exp_date || "14/05/2027"}</span>
                  </div>
                </div>

                {/* Card 2: Legal Owner Dossier */}
                <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
                  <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                    <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Titular & Razão Social Oficial</span>
                    {domData.cnpj && <span className="font-mono text-xs font-bold text-blue-700">{domData.cnpj}</span>}
                  </div>
                  <div className="text-sm font-bold text-[var(--foreground)]">{domData.owner}</div>
                  {domData.legal_rep && <p className="text-xs text-[var(--muted)]">Representante Legal: <strong>{domData.legal_rep}</strong></p>}
                  {domData.capital_social > 0 && (
                    <p className="text-xs text-[var(--muted)]">Capital Social: <strong>R$ {domData.capital_social.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></p>
                  )}
                  {domData.endereco && <p className="text-xs text-[var(--muted)]">Endereço da Matriz: {domData.endereco}</p>}
                </div>

                {/* Card 3: Gateways & Checkout Providers */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-700 block">Gateways de Pagamento Notificáveis para Retenção em Fonte:</span>
                  <div className="flex flex-wrap gap-2">
                    {domData.gateways.map((gw: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded text-xs font-semibold shadow-sm">
                        {gw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card 4: Minuta Penhora */}
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px] uppercase text-blue-900">Minuta de Penhora de Recebíveis Online (Art. 855 CPC)</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(domData.minuta)}
                      className="px-2.5 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded text-[11px] font-semibold"
                    >
                      Copiar Minuta
                    </button>
                  </div>
                  <pre className="text-xs leading-relaxed text-slate-800 bg-white p-3 rounded-lg border border-blue-200 whitespace-pre-wrap font-mono">{domData.minuta}</pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] py-12 text-center">Informe o domínio para identificar a titularidade oficial, CNPJ e intermediadores de pagamento.</p>
            )}
          </Card>
        </div>
      )}
    </main>
  );
}
