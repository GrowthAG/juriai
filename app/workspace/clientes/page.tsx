"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

type ClientType = "PJ" | "PF";

type Socio = {
  nome: string;
  cpf?: string;
  cargo: string;
  participacao?: string;
};

type ClientItem = {
  id: string;
  name: string;
  trade_name?: string;
  document: string;
  type: ClientType;
  email: string;
  phone: string;
  address: string;
  city_state: string;
  status: "Ativo" | "Em Prospecção" | "Arquivado";
  cases_count: number;
  created_at: string;
  // PJ specific
  capital_social?: number;
  cnae?: string;
  qsa?: Socio[];
  legal_representative?: {
    name: string;
    cpf: string;
    role: string;
    email: string;
    phone: string;
  };
  // PF specific
  rg?: string;
  marital_status?: string;
  profession?: string;
  bank_data?: {
    bank: string;
    agency: string;
    account: string;
    pix: string;
  };
};

const INITIAL_CLIENTS: ClientItem[] = [];

export default function ClientesPage() {
  const [clients, setClients] = useState<ClientItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("juriai_clients");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CLIENTS;
  });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PJ" | "PF">("ALL");
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Form State
  const [formType, setFormType] = useState<ClientType>("PJ");
  const [cnpjInput, setCnpjInput] = useState("");
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [tradeNameInput, setTradeNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [capitalInput, setCapitalInput] = useState("");
  const [cnaeInput, setCnaeInput] = useState("");
  const [qsaList, setQsaList] = useState<Socio[]>([]);
  const [repName, setRepName] = useState("");
  const [repCpf, setRepCpf] = useState("");
  const [repRole, setRepRole] = useState("Sócio-Administrador");

  // PF Form State
  const [cpfInput, setCpfInput] = useState("");
  const [rgInput, setRgInput] = useState("");
  const [maritalInput, setMaritalInput] = useState("Solteiro(a)");
  const [profInput, setProfInput] = useState("");
  const [bankPixInput, setBankPixInput] = useState("");

  // Live Receita Federal Autofill
  async function handleAutoFillCnpj() {
    const clean = cnpjInput.replace(/\D/g, "");
    if (clean.length !== 14) {
      alert("Informe os 14 dígitos do CNPJ para autopreenchimento.");
      return;
    }
    setCnpjLoading(true);
    try {
      const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      if (resp.ok) {
        const data = await resp.json();
        setNameInput(data.razao_social || "");
        setTradeNameInput(data.nome_fantasia || "");
        setCapitalInput(String(data.capital_social || ""));
        setCnaeInput(`${data.cnae_fiscal || ""} - ${data.cnae_fiscal_descricao || ""}`);
        
        const end = `${data.descricao_tipo_de_logradouro || data.logradouro || "Rua"}, ${data.numero || "s/n"}${data.complemento ? " (" + data.complemento + ")" : ""}, Bairro ${data.bairro || "Centro"}, CEP ${data.cep || ""}, ${data.municipio || "São Paulo"}/${data.uf || "SP"}`;
        setAddressInput(end);

        const socios = Array.isArray(data.qsa)
          ? data.qsa.map((s: any) => ({
              nome: s.nome_socio || s.nome_representante_legal || "Sócio",
              cargo: s.qualificacao_socio || s.qualificacao_representante_legal || "Sócio",
              cpf: s.cnpj_cpf_do_socio || "-",
              participacao: s.percentual_capital_social ? s.percentual_capital_social + "%" : "-"
            }))
          : [];
        setQsaList(socios);

        if (socios.length > 0) {
          setRepName(socios[0].nome);
          setRepRole(socios[0].cargo);
        }
      } else {
        alert("CNPJ não localizado na Receita Federal pública.");
      }
    } catch (e) {
      alert("Erro ao conectar à Receita Federal.");
    } finally {
      setCnpjLoading(false);
    }
  }

  function handleEditClient(c: ClientItem) {
    setEditingClientId(c.id);
    setFormType(c.type);
    setNameInput(c.name || "");
    setTradeNameInput(c.trade_name || "");
    if (c.type === "PJ") {
      setCnpjInput(c.document || "");
      setCapitalInput(c.capital_social ? String(c.capital_social) : "");
      setCnaeInput(c.cnae || "");
      setQsaList(c.qsa || []);
      setRepName(c.legal_representative?.name || "");
      setRepCpf(c.legal_representative?.cpf || "");
      setRepRole(c.legal_representative?.role || "Sócio-Administrador");
    } else {
      setCpfInput(c.document || "");
      setRgInput(c.rg || "");
      setMaritalInput(c.marital_status || "Solteiro(a)");
      setProfInput(c.profession || "");
      setBankPixInput(c.bank_data?.pix || "");
    }
    setEmailInput(c.email || "");
    setPhoneInput(c.phone || "");
    setAddressInput(c.address || "");
    setIsModalOpen(true);
  }

  function handleDeleteClient(id: string) {
    if (!confirm("Deseja realmente excluir este cliente da banca?")) return;
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("juriai_clients", JSON.stringify(updated));
    }
    if (selectedClient?.id === id) {
      setSelectedClient(null);
    }
  }

  function handleSaveClient(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert("Por favor, preencha o nome / razão social.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    let updated: ClientItem[] = [];

    if (editingClientId) {
      updated = clients.map((c) => {
        if (c.id === editingClientId) {
          return {
            ...c,
            name: nameInput.trim(),
            trade_name: tradeNameInput.trim() || undefined,
            document: formType === "PJ" ? cnpjInput.trim() || c.document : cpfInput.trim() || c.document,
            type: formType,
            email: emailInput.trim(),
            phone: phoneInput.trim(),
            address: addressInput.trim(),
            capital_social: parseFloat(capitalInput) || undefined,
            cnae: cnaeInput.trim() || undefined,
            qsa: qsaList.length > 0 ? qsaList : undefined,
            legal_representative: repName ? {
              name: repName,
              cpf: repCpf || "-",
              role: repRole,
              email: emailInput,
              phone: phoneInput
            } : undefined,
            rg: rgInput.trim() || undefined,
            marital_status: maritalInput || undefined,
            profession: profInput.trim() || undefined,
            bank_data: bankPixInput ? {
              bank: "Banco Informado",
              agency: "-",
              account: "-",
              pix: bankPixInput
            } : undefined
          };
        }
        return c;
      });
    } else {
      const newId = `CLI-2026-${String(clients.length + 1).padStart(3, "0")}`;
      const newClient: ClientItem = {
        id: newId,
        name: nameInput.trim(),
        trade_name: tradeNameInput.trim() || undefined,
        document: formType === "PJ" ? cnpjInput.trim() || "00.000.000/0001-00" : cpfInput.trim() || "000.000.000-00",
        type: formType,
        email: emailInput.trim(),
        phone: phoneInput.trim(),
        address: addressInput.trim(),
        city_state: "São Paulo / SP",
        status: "Ativo",
        cases_count: 0,
        created_at: today,
        capital_social: parseFloat(capitalInput) || undefined,
        cnae: cnaeInput.trim() || undefined,
        qsa: qsaList.length > 0 ? qsaList : undefined,
        legal_representative: repName ? {
          name: repName,
          cpf: repCpf || "-",
          role: repRole,
          email: emailInput,
          phone: phoneInput
        } : undefined,
        rg: rgInput.trim() || undefined,
        marital_status: maritalInput || undefined,
        profession: profInput.trim() || undefined,
        bank_data: bankPixInput ? {
          bank: "Banco Informado",
          agency: "-",
          account: "-",
          pix: bankPixInput
        } : undefined
      };
      updated = [newClient, ...clients];
    }

    setClients(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("juriai_clients", JSON.stringify(updated));
    }
    setIsModalOpen(false);
    resetForm();
  }

  function resetForm() {
    setEditingClientId(null);
    setNameInput("");
    setTradeNameInput("");
    setCnpjInput("");
    setCpfInput("");
    setEmailInput("");
    setPhoneInput("");
    setAddressInput("");
    setCapitalInput("");
    setCnaeInput("");
    setQsaList([]);
    setRepName("");
    setRepCpf("");
    setRgInput("");
    setProfInput("");
    setBankPixInput("");
  }

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.document.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === "ALL" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPj = clients.filter((c) => c.type === "PJ").length;
  const totalPf = clients.filter((c) => c.type === "PF").length;
  const totalCases = clients.reduce((acc, c) => acc + c.cases_count, 0);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Operacional & CRM Jurídico
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            Clientes & Partes da Banca
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Cadastro unificado de pessoas jurídicas e físicas com preenchimento automático pela Receita Federal, QSA e histórico de casos.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold rounded-lg hover:opacity-90 transition shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+ Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">Clientes Cadastrados</span>
          <span className="text-2xl font-bold text-[var(--foreground)] mt-1 block">{clients.length}</span>
          <span className="text-xs text-blue-600 mt-1 block">Titulares de direitos ativos</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">Empresas (PJ)</span>
          <span className="text-2xl font-bold text-[var(--foreground)] mt-1 block">{totalPj}</span>
          <span className="text-xs text-emerald-600 mt-1 block">Com QSA e CNPJ integrado</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">Pessoas Físicas (PF)</span>
          <span className="text-2xl font-bold text-[var(--foreground)] mt-1 block">{totalPf}</span>
          <span className="text-xs text-indigo-600 mt-1 block">Qualificação padrão CPC/15</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">Processos Vinculados</span>
          <span className="text-2xl font-bold text-[var(--foreground)] mt-1 block">{totalCases}</span>
          <span className="text-xs text-cyan-600 mt-1 block">Dossiês em andamento</span>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, razão social, CNPJ ou CPF..."
            className="w-full bg-[var(--background)] border border-[var(--border)] text-xs rounded-lg px-3 py-2 outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === "ALL" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted)] hover:bg-[var(--background)]"
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setFilterType("PJ")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === "PJ" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted)] hover:bg-[var(--background)]"
            }`}
          >
            Empresas ({totalPj})
          </button>
          <button
            onClick={() => setFilterType("PF")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterType === "PF" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted)] hover:bg-[var(--background)]"
            }`}
          >
            Pessoas Físicas ({totalPf})
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--background)] text-[var(--muted)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3.5 font-medium">Nome / Razão Social</th>
                <th className="px-6 py-3.5 font-medium">Documento</th>
                <th className="px-6 py-3.5 font-medium">Tipo</th>
                <th className="px-6 py-3.5 font-medium">Contato Principal</th>
                <th className="px-6 py-3.5 font-medium text-center">Casos Ativos</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-xs text-[var(--muted)]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">Nenhum cliente cadastrado ainda</p>
                      <p className="text-slate-500 max-w-sm">Cadastre o primeiro cliente da banca preenchendo o CNPJ da empresa na Receita Federal ou os dados da pessoa física.</p>
                      <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="mt-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold rounded-lg hover:opacity-90 transition shadow-sm"
                      >
                        + Cadastrar Primeiro Cliente
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--surface)] transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--foreground)] text-sm">{c.name}</div>
                      <div className="text-[11px] text-[var(--muted)]">{c.trade_name || c.profession || c.address}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-[var(--foreground)]">
                      {c.document}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.type === "PJ" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {c.type === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--foreground)]">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-[var(--muted)]">{c.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                        {c.cases_count} {c.cases_count === 1 ? "caso" : "casos"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedClient(c)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium border border-slate-200 transition"
                      >
                        Dossiê 360º
                      </button>
                      <button
                        onClick={() => handleEditClient(c)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold border border-blue-200 transition"
                      >
                        Editar
                      </button>
                      <Link
                        href={`/casos/novo?clientId=${c.id}&clientName=${encodeURIComponent(c.name)}`}
                        className="px-2.5 py-1 bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] rounded text-xs font-semibold transition inline-block"
                      >
                        + Caso
                      </Link>
                      <button
                        onClick={() => handleDeleteClient(c.id)}
                        className="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded text-xs font-medium transition"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: CADASTRAR NOVO CLIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingClientId ? "Editar Dados do Cliente" : "Cadastrar Novo Cliente da Banca"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingClientId ? "Atualize as informações cadastrais e societárias deste titular" : "Qualificação completa para procurações, contratos de honorários e petições"}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            {/* Toggle PJ vs PF */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setFormType("PJ")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${
                  formType === "PJ" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pessoa Jurídica (Empresas & Startups)
              </button>
              <button
                type="button"
                onClick={() => setFormType("PF")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${
                  formType === "PF" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pessoa Física (Indivíduos & Sócios)
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              {/* PJ FORM */}
              {formType === "PJ" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-slate-700 block mb-1">CNPJ da Empresa</label>
                      <input
                        type="text"
                        value={cnpjInput}
                        onChange={(e) => setCnpjInput(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 font-mono outline-none focus:border-blue-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillCnpj}
                      disabled={cnpjLoading}
                      className="self-end px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 shadow-sm"
                    >
                      {cnpjLoading ? "Buscando..." : "Preencher via Receita Federal"}
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Razão Social Oficial</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Razão Social completa conforme cartão CNPJ"
                      className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Nome Fantasia</label>
                      <input
                        type="text"
                        value={tradeNameInput}
                        onChange={(e) => setTradeNameInput(e.target.value)}
                        placeholder="Marca comercial"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Capital Social (R$)</label>
                      <input
                        type="text"
                        value={capitalInput}
                        onChange={(e) => setCapitalInput(e.target.value)}
                        placeholder="Ex: 100000.00"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 font-mono outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Endereço Oficial da Matriz</label>
                    <input
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Rua, número, bairro, cidade, UF, CEP"
                      className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">E-mail Corporativo</label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="contato@empresa.com.br"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+55 11 99999-9999"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* QSA Section */}
                  {qsaList.length > 0 && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-700 block">Sócios Mapeados na Receita (QSA):</span>
                      <div className="divide-y divide-slate-200">
                        {qsaList.map((s, idx) => (
                          <div key={idx} className="py-1 flex justify-between text-[11px]">
                            <span className="font-semibold text-slate-800">{s.nome}</span>
                            <span className="text-slate-500">{s.cargo}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signatário / Representante */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2">
                    <span className="text-[10px] font-bold uppercase text-blue-900 block">Representante Legal (Signatário da Procuração):</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={repName}
                        onChange={(e) => setRepName(e.target.value)}
                        placeholder="Nome do Representante"
                        className="col-span-2 bg-white border border-blue-200 rounded px-2.5 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={repRole}
                        onChange={(e) => setRepRole(e.target.value)}
                        placeholder="Cargo (ex: Diretor)"
                        className="bg-white border border-blue-200 rounded px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PF FORM */}
              {formType === "PF" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Nome completo do cliente pessoa física"
                      className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">CPF</label>
                      <input
                        type="text"
                        value={cpfInput}
                        onChange={(e) => setCpfInput(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 font-mono outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">RG / Órgão Emissor</label>
                      <input
                        type="text"
                        value={rgInput}
                        onChange={(e) => setRgInput(e.target.value)}
                        placeholder="Ex: 34.567.890-X SSP/SP"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Estado Civil</label>
                      <select
                        value={maritalInput}
                        onChange={(e) => setMaritalInput(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                      >
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                        <option value="União Estável">União Estável</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Profissão</label>
                      <input
                        type="text"
                        value={profInput}
                        onChange={(e) => setProfInput(e.target.value)}
                        placeholder="Ex: Engenheiro, Empresário"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Endereço Residencial Completo</label>
                    <input
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Rua, número, apto, bairro, cidade, UF, CEP"
                      className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">E-mail</label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="cliente@email.com"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">WhatsApp / Telefone</label>
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+55 11 99999-9999"
                        className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg">
                    <label className="text-[10px] font-bold uppercase text-purple-900 block mb-1">Chave PIX para Repasse de Alvarás / Créditos:</label>
                    <input
                      type="text"
                      value={bankPixInput}
                      onChange={(e) => setBankPixInput(e.target.value)}
                      placeholder="Chave PIX (CPF, e-mail ou telefone)"
                      className="w-full bg-white border border-purple-200 rounded px-2.5 py-1.5 text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                >
                  {editingClientId ? "Salvar Alterações do Cliente" : "Salvar Cliente na Banca"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / DOSSIÊ DO CLIENTE 360º */}
      {selectedClient && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white border-l border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Dossiê 360º do Cliente
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedClient.name}</h2>
                <p className="text-xs text-slate-500 font-mono">{selectedClient.document}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Contato & Endereço</span>
                <p className="text-slate-800 font-medium">{selectedClient.email} • {selectedClient.phone}</p>
                <p className="text-slate-600">{selectedClient.address}</p>
              </div>

              {selectedClient.type === "PJ" && selectedClient.qsa && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Quadro de Sócios & Representantes:</span>
                  <div className="divide-y divide-slate-200">
                    {selectedClient.qsa.map((s, i) => (
                      <div key={i} className="py-1.5 first:pt-0 flex justify-between">
                        <span className="font-semibold text-slate-800">{s.nome}</span>
                        <span className="text-slate-500">{s.cargo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClient.type === "PF" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Qualificação Pessoal:</span>
                  <p className="text-slate-800">RG: {selectedClient.rg || "-"} • Estado Civil: {selectedClient.marital_status || "-"} • Profissão: {selectedClient.profession || "-"}</p>
                  {selectedClient.bank_data && (
                    <p className="text-purple-700 font-medium pt-1">Chave PIX: {selectedClient.bank_data.pix}</p>
                  )}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Link
                  href={`/casos/novo?clientId=${selectedClient.id}&clientName=${encodeURIComponent(selectedClient.name)}`}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-sm text-center block"
                >
                  + Abrir Novo Processo para este Cliente
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const c = selectedClient;
                      setSelectedClient(null);
                      handleEditClient(c);
                    }}
                    className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition text-center"
                  >
                    Editar Dados
                  </button>
                  <button
                    onClick={() => handleDeleteClient(selectedClient.id)}
                    className="py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition text-center"
                  >
                    Excluir Cliente
                  </button>
                </div>
                <button
                  onClick={() => alert("Procuração Ad Judicia gerada em PDF com base na qualificação oficial deste cliente!")}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition"
                >
                  Gerar Procuração Ad Judicia em 1 Clique
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
