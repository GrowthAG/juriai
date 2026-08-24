"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { completeOnboarding } from "@/app/actions/onboarding";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]";

const DOMAINS = [
  { value: "CIVIL", label: "Cível B2B" },
  { value: "CONSUMIDOR", label: "Consumidor" },
  { value: "TRABALHISTA", label: "Trabalhista" },
  { value: "TRIBUTARIO", label: "Tributário" },
  { value: "EMPRESARIAL", label: "Empresarial & Contratos" },
  { value: "FAMILIA", label: "Família & Sucessões" },
  { value: "ADMINISTRATIVO", label: "Direito Público" },
];

const FIRM_SIZES = ["1", "2-5", "6-15", "16-30", "30+"];

const DEADLINE_OPTIONS = [
  { value: "software", label: "Software Jurídico" },
  { value: "planilha", label: "Planilha / Excel" },
  { value: "agenda", label: "Agenda / Calendário" },
  { value: "nada", label: "Controle Manual / Sem ferramenta fixa" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Step 1: Nome
  const [firmName, setFirmName] = useState("");
  
  // Step 2: Planejamento / Qualificação
  const [domains, setDomains] = useState<string[]>(["CIVIL", "CONSUMIDOR"]);
  const [firmSize, setFirmSize] = useState("2-5");
  const [deadlineControl, setDeadlineControl] = useState("software");
  const [mainBottleneck, setMainBottleneck] = useState("Organização de dossiês e montagem ágil de peças");

  // Step 3: Identidade / Timbrado (Opcional)
  const [brandPrimaryColor, setBrandPrimaryColor] = useState("#0f2b48");
  const [useBrandColor, setUseBrandColor] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalSteps = 3;

  function toggleDomain(val: string) {
    setDomains((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );
  }

  function handleComplete(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set("firmName", firmName.trim());
    domains.forEach((d) => fd.append("domains", d));
    fd.set("firmSize", firmSize);
    fd.set("deadlineControl", deadlineControl);
    fd.set("mainBottleneck", mainBottleneck.trim());

    if (useBrandColor) {
      fd.set("brandPrimaryColor", brandPrimaryColor);
    }
    if (logoFile) {
      fd.set("logo", logoFile);
    }
    if (letterheadFile) {
      fd.set("letterhead", letterheadFile);
    }

    startTransition(async () => {
      const res = await completeOnboarding(fd);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.push("/workspace");
    });
  }

  return (
    <main className="flex min-h-screen w-full flex-1 bg-[var(--background)]">
      <div className="grid w-full lg:grid-cols-12 min-h-screen">
        
        {/* ── COLUNA ESQUERDA: SETUP GUIADO DO ESCRITÓRIO ── */}
        <div className="flex flex-col justify-between bg-[var(--surface)] px-6 py-10 sm:px-12 lg:col-span-6 lg:px-16 xl:col-span-5 border-r border-[var(--border)]">
          {/* Topbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Image
                src="/brand/gavel-tile.svg"
                width={30}
                height={30}
                alt="JuriAI"
                aria-hidden="true"
                unoptimized
              />
              <span className="font-serif text-lg font-semibold tracking-tight text-[var(--foreground)]">
                Juri<span className="font-sans text-[var(--primary)]">AI</span>
              </span>
            </div>
            <span className="text-xs font-mono text-[var(--muted)]">
              Etapa {step} de {totalSteps}
            </span>
          </div>

          {/* Form Area */}
          <div className="my-auto w-full max-w-md mx-auto py-8">
            {/* Progress Bar */}
            <div className="mb-6 flex gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    step >= i + 1 ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                  }`}
                />
              ))}
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-[var(--radius)] border border-[var(--danger)] bg-red-50/50 px-3.5 py-2.5 text-xs font-medium text-[var(--danger)]"
              >
                {error}
              </div>
            )}

            {/* ── PASSO 1: NOME DO ESCRITÓRIO ── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                    Nome do seu escritório
                  </h1>
                  <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
                    Como a sua advocacia deve ser identificada nos dossiês e peças jurídicas?
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Razão Social ou Nome Fantasia
                  </label>
                  <input
                    autoFocus
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Ex: Albuquerque & Associados Advocacia"
                    className={fieldClass}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    size="md"
                    className="w-full font-semibold"
                    disabled={firmName.trim().length < 2}
                    onClick={() => setStep(2)}
                  >
                    Avançar para planejamento →
                  </Button>
                </div>
              </div>
            )}

            {/* ── PASSO 2: ÁREAS DE ATUAÇÃO E QUALIFICAÇÃO ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                    Áreas & Planejamento
                  </h1>
                  <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
                    Calibre o motor de IA para a rotina e o fluxo de trabalho do escritório.
                  </p>
                </div>

                {/* Especialidades */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-1.5">
                    Áreas de Atuação
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DOMAINS.map((d) => {
                      const active = domains.includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => toggleDomain(d.value)}
                          className={`h-7 rounded-md border px-2.5 text-xs font-medium transition-colors ${
                            active
                              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]"
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Porte */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-1.5">
                    Porte (Nº de Advogados)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {FIRM_SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFirmSize(s)}
                        className={`h-7 rounded-md border px-3 text-xs font-medium transition-colors ${
                          firmSize === s
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controle de Prazos */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-1.5">
                    Como controla prazos hoje?
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DEADLINE_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setDeadlineControl(o.value)}
                        className={`h-8 rounded-md border px-2 text-[11px] font-medium text-left truncate transition-colors ${
                          deadlineControl === o.value
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gargalo */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Maior prioridade / gargalo operacional
                  </label>
                  <input
                    value={mainBottleneck}
                    onChange={(e) => setMainBottleneck(e.target.value)}
                    placeholder="Ex: Dossiês e montagem ágil de peças"
                    className={fieldClass}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-10 px-3.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)]"
                  >
                    ← Voltar
                  </button>
                  <Button
                    size="md"
                    className="flex-1 font-semibold"
                    disabled={domains.length === 0}
                    onClick={() => setStep(3)}
                  >
                    Avançar para papel timbrado →
                  </Button>
                </div>
              </div>
            )}

            {/* ── PASSO 3: PAPEL TIMBRADO & IDENTIDADE (OPCIONAL) ── */}
            {step === 3 && (
              <form onSubmit={handleComplete} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                      Papel Timbrado
                    </h1>
                    <span className="text-[11px] font-mono text-[var(--primary)] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      Opcional
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
                    Envie o modelo do seu escritório para que as peças e minutas geradas pelo JuriAI já saiam timbradas automaticamente.
                  </p>
                </div>

                {/* Upload Papel Timbrado */}
                <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] mb-1">
                    Arquivo de Papel Timbrado (PDF ou Imagem)
                  </label>
                  <p className="text-[11px] text-[var(--muted)] mb-2">
                    A primeira página do seu modelo será aplicada como fundo de todas as peças exportadas.
                  </p>
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    onChange={(e) => setLetterheadFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-xs text-[var(--muted)] file:mr-3 file:h-8 file:rounded-[var(--radius)] file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-3 file:text-xs file:font-medium hover:file:bg-[var(--background)]"
                  />
                  {letterheadFile && (
                    <p className="mt-1.5 text-xs font-mono text-[var(--primary)]">
                      ✓ Selecionado: {letterheadFile.name} ({(letterheadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {/* Logo Opcional */}
                <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] mb-1">
                    Logo do Escritório (Opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-xs text-[var(--muted)] file:mr-3 file:h-8 file:rounded-[var(--radius)] file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-3 file:text-xs file:font-medium hover:file:bg-[var(--background)]"
                  />
                  {logoFile && (
                    <p className="mt-1.5 text-xs font-mono text-[var(--primary)]">
                      ✓ Selecionado: {logoFile.name}
                    </p>
                  )}
                </div>

                {/* Cor Primária */}
                <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3.5 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)] block">
                      Cor Institucional da Marca
                    </label>
                    <span className="text-[11px] text-[var(--muted)]">Usada em títulos e destaques das peças</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandPrimaryColor}
                      onChange={(e) => {
                        setBrandPrimaryColor(e.target.value);
                        setUseBrandColor(true);
                      }}
                      className="h-8 w-10 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)]"
                    />
                    <span className="font-mono text-xs text-[var(--muted)]">{brandPrimaryColor}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="h-11 px-3.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)]"
                  >
                    ← Voltar
                  </button>
                  <Button
                    type="submit"
                    size="md"
                    className="flex-1 font-semibold"
                    disabled={isPending}
                  >
                    {isPending ? "Configurando ambiente..." : "Concluir e Acessar Cockpit →"}
                  </Button>
                </div>

                <p className="text-center text-[11px] text-[var(--muted)] pt-1">
                  Você também pode alterar o papel timbrado e a identidade a qualquer momento nas Configurações.
                </p>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[var(--border)] text-[11px] text-[var(--muted)] flex items-center justify-between">
            <span>Configuração do Workspace</span>
            <span>JuriAI Enterprise</span>
          </div>
        </div>

        {/* ── COLUNA DIREITA: PAINEL EDITORIAL ── */}
        <div className="relative hidden lg:col-span-6 xl:col-span-7 lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:p-16">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0A192F]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,90,255,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(15,43,72,0.4),transparent_50%)]" />
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-400/20 px-3 py-1 text-xs font-medium text-blue-300">
              Personalização Operacional
            </span>
          </div>

          <div className="relative z-10 max-w-lg space-y-4">
            <h2 className="font-serif text-3xl font-semibold leading-tight text-white xl:text-4xl">
              Seu escritório configurado para máxima produtividade.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              O motor de inteligência do JuriAI calibra a busca de lacunas, a classificação de provas e a geração de minutas com o papel timbrado oficial e as áreas de especialidade da sua advocacia.
            </p>
          </div>

          <div className="relative z-10 text-[11px] text-slate-500 font-mono">
            Ambiente seguro com criptografia de ponta a ponta.
          </div>
        </div>

      </div>
    </main>
  );
}
