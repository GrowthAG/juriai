"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { completeOnboarding } from "@/app/actions/onboarding";

const fieldClass =
  "mt-2 h-12 w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-base text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]";

const DOMAINS = [
  { value: "CIVIL", label: "Cível B2B" },
  { value: "CONSUMIDOR", label: "Consumidor" },
  { value: "TRABALHISTA", label: "Trabalhista" },
  { value: "TRIBUTARIO", label: "Tributário" },
  { value: "EMPRESARIAL", label: "Empresarial & Contratos" },
  { value: "FAMILIA", label: "Família & Sucessões" },
  { value: "ADMINISTRATIVO", label: "Direito Público" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [firmName, setFirmName] = useState("");
  const [domains, setDomains] = useState<string[]>(["CIVIL", "CONSUMIDOR"]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleDomain(val: string) {
    setDomains((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );
  }

  function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set("firmName", firmName.trim());
    domains.forEach((d) => fd.append("domains", d));

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
              Passo {step} de 2
            </span>
          </div>

          {/* Form Area */}
          <div className="my-auto w-full max-w-md mx-auto py-8">
            {/* Progress Bar */}
            <div className="mb-6 flex gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  step >= 1 ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  step >= 2 ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                }`}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-[var(--radius)] border border-[var(--danger)] bg-red-50/50 px-3.5 py-2.5 text-xs font-medium text-[var(--danger)]"
              >
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                    Nome do seu escritório
                  </h1>
                  <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">
                    Como o seu escritório deve ser identificado nos dossiês, minutas e relatórios?
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

                <div className="pt-4">
                  <Button
                    size="md"
                    className="w-full font-semibold"
                    disabled={firmName.trim().length < 2}
                    onClick={() => setStep(2)}
                  >
                    Avançar para áreas de atuação →
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleComplete} className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                    Áreas de atuação
                  </h1>
                  <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">
                    Selecione as frentes do direito onde o escritório atua com maior volume.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
                    Especialidades Jurídicas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS.map((d) => {
                      const active = domains.includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => toggleDomain(d.value)}
                          className={`h-9 rounded-md border px-3 text-xs font-medium transition-colors ${
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

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-11 px-4 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)]"
                  >
                    ← Voltar
                  </button>
                  <Button
                    type="submit"
                    size="md"
                    className="flex-1 font-semibold"
                    disabled={isPending || domains.length === 0}
                  >
                    {isPending ? "Preparando ambiente..." : "Concluir e Acessar Cockpit →"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[var(--border)] text-[11px] text-[var(--muted)] flex items-center justify-between">
            <span>Configuração do Workspace</span>
            <span>JuriAI Enterprise</span>
          </div>
        </div>

        {/* ── COLUNA DIREITA: IMAGEM EDITORIAL ── */}
        <div className="relative hidden lg:col-span-6 xl:col-span-7 lg:flex flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:p-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/site/hero-human-desk.jpg"
              alt="Ambiente de trabalho contemporâneo e documental"
              fill
              priority
              className="object-cover object-center opacity-35 mix-blend-luminosity filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/40" />
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
              O motor de inteligência do JuriAI calibra a busca de lacunas, a classificação de provas e a geração de minutas de acordo com as áreas de especialidade do seu escritório.
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
