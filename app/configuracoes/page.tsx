"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

type RoleType = "OWNER" | "LAWYER" | "INTERN" | "FINANCE" | "VIEWER";

type UserMember = {
  id: string;
  name: string;
  email: string;
  oab: string;
  role: RoleType;
  role_label: string;
  status: "Ativo" | "Pendente" | "Inativo";
  permissions: string[];
  created_at: string;
};

const INITIAL_USERS: UserMember[] = [
  {
    id: "USR-001",
    name: "Dr. Giulliano Alves",
    email: "giulliano@usefunnels.io",
    oab: "123456/SP",
    role: "OWNER",
    role_label: "Sócio Titular (Acesso Total)",
    status: "Ativo",
    permissions: ["Acesso Total", "Gestão da Banca", "Faturamento"],
    created_at: new Date().toISOString().split("T")[0]
  }
];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<"users" | "workspace" | "rbac">("users");
  const [users, setUsers] = useState<UserMember[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("juriai_users");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_USERS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for New Member
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newOab, setNewOab] = useState("");
  const [newRole, setNewRole] = useState<RoleType>("LAWYER");

  // Workspace Profile State
  const [wsName, setWsName] = useState("Alves & Dias Advocacia Estratégica");
  const [wsCnpj, setWsCnpj] = useState("16.746.009/0001-86");
  const [wsOab, setWsOab] = useState("123456/SP");
  const [wsAddress, setWsAddress] = useState("Av. Brigadeiro Faria Lima, 3477, Itaim Bibi, São Paulo/SP");
  const [wsEmail, setWsEmail] = useState("giulliano@usefunnels.io");
  const [wsPhone, setWsPhone] = useState("+55 11 99999-9999");
  const [wsSavedMsg, setWsSavedMsg] = useState(false);

  function handleSaveNewUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      alert("Por favor, informe o nome e o e-mail do membro.");
      return;
    }

    const roleLabels: Record<RoleType, { label: string; perms: string[] }> = {
      OWNER: { label: "Sócio Titular (Acesso Total)", perms: ["Acesso Total", "Gestão da Banca", "Faturamento"] },
      LAWYER: { label: "Advogado Associado", perms: ["Gestão de Casos", "Redação com IA", "Matriz", "DJEN"] },
      INTERN: { label: "Assistente / Estagiário", perms: ["Upload de Provas", "Consultas DataJud/DJEN"] },
      FINANCE: { label: "Financeiro & Custas", perms: ["Liquidação Pericial", "Faturamento"] },
      VIEWER: { label: "Visualizador / Cliente", perms: ["Visualização de Casos"] }
    };

    const roleInfo = roleLabels[newRole] || roleLabels.LAWYER;

    const newUser: UserMember = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      oab: newOab.trim() || "-",
      role: newRole,
      role_label: roleInfo.label,
      status: "Ativo",
      permissions: roleInfo.perms,
      created_at: new Date().toISOString().split("T")[0]
    };

    setUsers([...users, newUser]);
    setIsModalOpen(false);
    setNewName("");
    setNewEmail("");
    setNewOab("");
  }

  function handleDeleteUser(id: string) {
    if (confirm("Deseja realmente remover este usuário da banca?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  }

  function handleSaveWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setWsSavedMsg(true);
    setTimeout(() => setWsSavedMsg(false), 3000);
  }

  const roleBadges: Record<RoleType, string> = {
    OWNER: "bg-blue-50 text-blue-700 border-blue-200",
    LAWYER: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INTERN: "bg-indigo-50 text-indigo-700 border-indigo-200",
    FINANCE: "bg-amber-50 text-amber-700 border-amber-200",
    VIEWER: "bg-slate-100 text-slate-700 border-slate-200"
  };

  const totalLawyers = users.filter(u => u.role === "LAWYER" || u.role === "OWNER").length;
  const totalInterns = users.filter(u => u.role === "INTERN").length;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Gestão da Banca & Equipe
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            Configurações & Usuários (RBAC)
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Gerencie advogados associados, estagiários, permissões granulares e dados oficiais da sociedade de advogados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Plano Enterprise (10 Vagas)
          </span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "users"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          }`}
        >
          Membros & Permissões ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("workspace")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "workspace"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          }`}
        >
          Perfil da Sociedade & Timbrado
        </button>
        <button
          onClick={() => setActiveTab("rbac")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "rbac"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          }`}
        >
          Hierarquia de Acesso (RBAC)
        </button>
      </div>

      {/* PANE 1: USERS */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">Membros Ativos</span>
              <span className="text-2xl font-bold text-[var(--foreground)] mt-1 block">{users.length} / 10</span>
              <span className="text-xs text-blue-600 mt-1 block">{10 - users.length} vagas disponíveis no plano</span>
            </Card>
            <Card className="p-4">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">Sócios Titulares</span>
              <span className="text-2xl font-bold text-[var(--foreground)] mt-1 block">1</span>
              <span className="text-xs text-emerald-600 mt-1 block">Acesso administrativo irrestrito</span>
            </Card>
            <Card className="p-4">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">Advogados com OAB</span>
              <span className="text-2xl font-bold text-[var(--foreground)] mt-1 block">{totalLawyers}</span>
              <span className="text-xs text-indigo-600 mt-1 block">Redação, matriz e intimações</span>
            </Card>
            <Card className="p-4">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider block">Assistentes / Estagiários</span>
              <span className="text-2xl font-bold text-[var(--foreground)] mt-1 block">{totalInterns}</span>
              <span className="text-xs text-cyan-600 mt-1 block">Upload de provas e pesquisas</span>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-base font-semibold text-[var(--foreground)]">Membros da Banca & Perfis de Acesso</h2>
                <p className="text-xs text-[var(--muted)]">Controle granular de permissões por perfil institucional da advocacia</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-semibold rounded-lg hover:opacity-90 transition shadow-sm flex items-center gap-1.5"
              >
                <span>+ Convidar Novo Membro</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--background)] text-[var(--muted)] border-b border-[var(--border)]">
                  <tr>
                    <th className="px-6 py-3.5 font-medium">Nome & E-mail</th>
                    <th className="px-6 py-3.5 font-medium">Inscrição OAB</th>
                    <th className="px-6 py-3.5 font-medium">Cargo / Perfil RBAC</th>
                    <th className="px-6 py-3.5 font-medium">Permissões Efetivas</th>
                    <th className="px-6 py-3.5 font-medium">Status</th>
                    <th className="px-6 py-3.5 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--surface)] transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[var(--foreground)] text-sm">{u.name}</div>
                        <div className="text-[11px] text-[var(--muted)] font-mono">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-[var(--foreground)]">
                        {u.oab}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadges[u.role] || roleBadges.LAWYER}`}>
                          {u.role_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--muted)]">
                        {u.permissions.join(" • ")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== "OWNER" ? (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-600 hover:text-red-700 text-xs font-medium"
                          >
                            Remover
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">Titular</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* PANE 2: WORKSPACE PROFILE */}
      {activeTab === "workspace" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">Dados da Sociedade de Advogados</h2>
              <p className="text-xs text-[var(--muted)]">Informações oficiais utilizadas no cabeçalho, rodapé e timbrado das petições geradas</p>
            </div>

            <form onSubmit={handleSaveWorkspace} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Razão Social do Escritório</label>
                <input
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">CNPJ da Sociedade</label>
                  <input
                    value={wsCnpj}
                    onChange={(e) => setWsCnpj(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 font-mono outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">OAB Principal da Banca</label>
                  <input
                    value={wsOab}
                    onChange={(e) => setWsOab(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 font-mono outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Endereço Completo</label>
                <input
                  value={wsAddress}
                  onChange={(e) => setWsAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">E-mail de Contato / Digest</label>
                  <input
                    type="email"
                    value={wsEmail}
                    onChange={(e) => setWsEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    value={wsPhone}
                    onChange={(e) => setWsPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                >
                  Salvar Dados do Escritório
                </button>
                {wsSavedMsg && <span className="text-xs text-emerald-700 font-semibold">✓ Dados salvos com sucesso!</span>}
              </div>
            </form>
          </Card>

          <Card className="lg:col-span-5 p-6 space-y-4">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Timbrado & Certificação OAB</h2>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-900 uppercase block text-[11px]">Padrão de Timbrado Automático</span>
              <p className="text-slate-600 leading-relaxed">
                Os dados desta tela são injetados automaticamente no cabeçalho das peças, procurações e contratos de honorários gerados na plataforma.
              </p>
              <div className="pt-2 border-t border-slate-200 text-slate-700 space-y-1">
                <div><strong>Sociedade:</strong> {wsName}</div>
                <div><strong>CNPJ:</strong> {wsCnpj}</div>
                <div><strong>OAB Seccional:</strong> {wsOab}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* PANE 3: RBAC EXPLANATION */}
      {activeTab === "rbac" && (
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Hierarquia de Permissões da Advocacia (RBAC)</h2>
          <p className="text-xs text-[var(--muted)]">Definição dos níveis de acesso institucionais configuráveis no JuriAI</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Sócio Titular (OWNER)</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">Acesso Total</span>
              </div>
              <p className="text-slate-600">Gestão administrativa irrestrita, faturamento, aprovação final de petições, auditoria, convite de membros e exclusão de processos.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Advogado Associado (LAWYER)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">Operação & Peças</span>
              </div>
              <p className="text-slate-600">Criação e edição de casos, montagem de matriz fática, redação de peças com IA e monitoramento de intimações da OAB.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Assistente / Estagiário (INTERN)</span>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px]">Pesquisa & Provas</span>
              </div>
              <p className="text-slate-600">Upload de provas, cálculo de hash SHA-256 e consultas processuais na base do DataJud e DJEN.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Financeiro & Custas (FINANCE)</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-[10px]">Liquidação & Saldo</span>
              </div>
              <p className="text-slate-600">Acesso à Calculadora SELIC/BCB, controle de créditos de consulta e emissão de relatórios de liquidação judicial.</p>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL: NOVO MEMBRO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Convidar Novo Membro da Banca</h3>
                <p className="text-xs text-slate-500">Defina os dados e o perfil de permissão do novo usuário</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSaveNewUser} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Dr(a). Nome do Advogado"
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">E-mail Profissional</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="advogado@escritorio.adv.br"
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Número e UF da OAB</label>
                <input
                  type="text"
                  value={newOab}
                  onChange={(e) => setNewOab(e.target.value)}
                  placeholder="Ex: 389201/SP"
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 font-mono outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Cargo / Perfil de Permissão</label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                >
                  <option value="LAWYER">Advogado Associado (Redação, Matriz e Casos)</option>
                  <option value="OWNER">Sócio Titular (Administrador com Acesso Total)</option>
                  <option value="INTERN">Assistente / Estagiário (Pesquisa e Upload de Provas)</option>
                  <option value="FINANCE">Financeiro & Custas (Liquidação e Faturamento)</option>
                  <option value="VIEWER">Visualizador / Cliente (Apenas Leitura)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
                  Adicionar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
