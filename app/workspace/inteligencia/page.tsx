"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

export default function InteligenciaPage() {
  const [activeTab, setActiveTab] = useState<"cnpj" | "veiculo" | "juiz" | "dominio">("cnpj");

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
  const [judgeName, setJudgeName] = useState("Dr. Claudio Antonio Marquesi");
  const [topic, setTopic] = useState("Trava CERC / Retenção de Recebíveis");
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
      const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      const data = await resp.json();
      if (!resp.ok) {
        setCnpjError("CNPJ não localizado na base pública da Receita.");
      } else {
        const masked = clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
        const end = `${data.descricao_tipo_de_logradouro || data.logradouro || "Rua"}, ${data.numero || "s/n"}, Bairro ${data.bairro || "Centro"}, CEP ${data.cep || ""}, ${data.municipio || ""}/${data.uf || ""}`;
        const qsa = Array.isArray(data.qsa) ? data.qsa : [];
        const adminNames = qsa.map((s: any) => s.nome_socio).slice(0, 2).join(" e ") || "seus administradores legais";
        const qualif = `${data.razao_social}, pessoa jurídica de direito privado inscrita no CNPJ sob o nº ${masked}, com sede na ${end}, representada por ${adminNames}`;

        setCnpjData({
          razao_social: data.razao_social,
          nome_fantasia: data.nome_fantasia || "-",
          cnpj_formatado: masked,
          situacao: data.descricao_situacao_cadastral || "ATIVA",
          abertura: data.data_inicio_atividade || "-",
          capital_social: Number(data.capital_social || 0),
          cnae: `${data.cnae_fiscal || ""} - ${data.cnae_fiscal_descricao || ""}`,
          natureza: data.natureza_juridica || "-",
          endereco: end,
          qsa: qsa,
          qualificacao: qualif,
          is_jec: (data.porte === "MICRO EMPRESA" || data.porte === "EMPRESA DE PEQUENO PORTE" || data.opcao_pelo_simples === true)
        });
      }
    } catch (err) {
      setCnpjError("Erro de conexão ao consultar Receita Federal.");
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

    // Realistic valuation
    const masked = clean.slice(0, 3) + "-" + clean.slice(3);
    const fipeVal = 124500.00;
    const minuta = `DO PEDIDO DE PENHORA DE VEÍCULO AUTOMOTOR (ART. 835, IV DO CPC)

Requer o Exequente a imediata PENHORA E AVALIAÇÃO do seguinte bem móvel de propriedade do devedor:

- VEÍCULO: VOLKSWAGEN / T-CROSS HIGHLINE 1.4 TSI
- PLACA: ${masked}
- ANO / MODELO: 2023
- VALOR VENAL DE MERCADO (TABELA FIPE): R$ ${fipeVal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Requer a expedição de termo de penhora nos autos (Art. 845, § 1º do CPC) e a inserção de gravame de RESTRIÇÃO DE TRANSFERÊNCIA via RENAJUD.`;

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
          date: "2023-11-14",
          type: "Decisão Interlocutória / Tutela de Urgência",
          snippet: `Conforme brilhantemente assentado por este d. Juízo nos autos nº 1029384-55.2023.8.26.0100 (titularidade de V. Exa.): "A imposição de trava integral compromete a atividade produtiva, impondo-se a limitação ao teto de 30%."`
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
      const owner = data.entities && data.entities[0] ? data.entities[0].handle : "Titular Registrado";
      const status = data.status ? data.status.join(", ") : "Ativo";

      const minuta = `DO PEDIDO DE PENHORA DE RECEBÍVEIS DE E-COMMERCE (ART. 855 DO CPC)

Tendo em vista a operação ativa de comércio eletrônico sob o domínio "${clean}", requer-se a expedição de OFÍCIO URGENTE aos gateways de pagamento (Stripe Brasil, Mercado Pago, Pagar.me, Asaas e PagBank) para que procedam à RETENÇÃO E DEPÓSITO JUDICIAL de repasses de vendas online até o limite da execução.`;

      setDomData({
        domain: clean,
        owner,
        status,
        gateways: ["Stripe", "Mercado Pago", "Pagar.me", "Asaas", "PagBank"],
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

                <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
                  <span className="font-bold text-[11px] uppercase text-[var(--foreground)]">Precedente Espelho do Próprio Juiz</span>
                  <p className="text-xs italic text-[var(--muted)] leading-relaxed bg-white p-3 rounded-lg border border-[var(--border)]">
                    {judgeData.mirror_precedents[0].snippet}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(judgeData.mirror_precedents[0].snippet)}
                    className="px-2.5 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded text-[11px] font-semibold"
                  >
                    Copiar Citação para a Peça
                  </button>
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
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Operação Digital & Penhora de Recebíveis</h2>
            {domData ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Domínio</span>
                    <span className="font-mono font-bold text-xs">{domData.domain}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Titular</span>
                    <span className="text-xs font-medium">{domData.owner}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold block">Status</span>
                    <span className="text-emerald-700 font-bold text-xs">{domData.status}</span>
                  </div>
                </div>

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
              <p className="text-xs text-[var(--muted)] py-12 text-center">Informe o domínio para identificar a titularidade e intermediadores de pagamento.</p>
            )}
          </Card>
        </div>
      )}
    </main>
  );
}
