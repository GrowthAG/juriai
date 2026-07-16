"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui";
import { createSubWorkspace } from "@/app/actions/admin";

const fieldClass =
  "mt-2 h-12 w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 text-base outline-none focus:border-[var(--primary)]";

const DOMAINS: { value: string; label: string }[] = [
  { value: "CIVIL", label: "Cível" },
  { value: "TRABALHISTA", label: "Trabalhista" },
  { value: "PENAL", label: "Penal" },
  { value: "CONSUMIDOR", label: "Consumidor" },
  { value: "TRIBUTARIO", label: "Tributário" },
  { value: "FAMILIA", label: "Família" },
  { value: "ADMINISTRATIVO", label: "Administrativo" },
];

const FIRM_SIZES = ["1", "2-5", "6-15", "16-30", "30+"];

const DEADLINE_OPTIONS: { value: string; label: string }[] = [
  { value: "planilha", label: "Planilha" },
  { value: "agenda", label: "Agenda / calendário" },
  { value: "software", label: "Software jurídico" },
  { value: "nada", label: "Nada estruturado" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OnboardingSubcontaPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [domains, setDomains] = useState<string[]>([]);
  const [firmSize, setFirmSize] = useState("");
  const [deadlineControl, setDeadlineControl] = useState("");
  const [mainBottleneck, setMainBottleneck] = useState("");

  const [brandPrimaryColor, setBrandPrimaryColor] = useState("#0057d8");
  const [useBrandColor, setUseBrandColor] = useState(false);
  const [brandSecondaryColor, setBrandSecondaryColor] = useState("#111827");
  const [useSecondaryColor, setUseSecondaryColor] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalSteps = 5;

  function toggleDomain(value: string) {
    setDomains((prev) =>
      prev.includes(value)
        ? prev.filter((d) => d !== value)
        : [...prev, value],
    );
  }

  function finish() {
    setError(null);
    setWarning(null);
    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("adminName", adminName.trim());
    fd.set("adminEmail", adminEmail.trim());
    domains.forEach((d) => fd.append("domains", d));
    if (firmSize) fd.set("firmSize", firmSize);
    if (deadlineControl) fd.set("deadlineControl", deadlineControl);
    if (mainBottleneck.trim()) fd.set("mainBottleneck", mainBottleneck.trim());
    if (useBrandColor) fd.set("brandPrimaryColor", brandPrimaryColor);
    if (useSecondaryColor) fd.set("brandSecondaryColor", brandSecondaryColor);
    if (logoFile) fd.set("logo", logoFile);
    if (letterheadFile) fd.set("letterhead", letterheadFile);
    startTransition(async () => {
      try {
        const result = await createSubWorkspace(fd);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setWarning(result.warning);
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha ao criar o escritório.");
      }
    });
  }

  return (
    <>
      <AppHeader
        homeHref="/admin"
        navHref="/admin/subcontas"
        navLabel="Voltar aos escritórios"
      />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {done ? (
          <section className="text-center">
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              Escritório criado ✓
            </h1>
            <p className="mt-2 text-[var(--muted)]">
              <strong>{name}</strong> foi criado e <strong>{adminEmail}</strong>{" "}
              já pode entrar como administrador do escritório.
            </p>
            {warning && (
              <p
                aria-live="polite"
                className="mt-4 border border-[var(--warning)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--warning)]"
              >
                {warning} Você pode reenviar esses arquivos nas configurações.
              </p>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/admin/subcontas"
                className="inline-flex h-11 items-center rounded-[var(--radius-card)] bg-[var(--primary)] px-5 text-[15px] font-semibold text-[var(--primary-foreground)]"
              >
                Ver escritórios
              </Link>
              <button
                onClick={() => {
                  setStep(0);
                  setName("");
                  setAdminName("");
                  setAdminEmail("");
                  setDomains([]);
                  setFirmSize("");
                  setDeadlineControl("");
                  setMainBottleneck("");
                  setUseBrandColor(false);
                  setUseSecondaryColor(false);
                  setBrandPrimaryColor("#0057d8");
                  setBrandSecondaryColor("#111827");
                  setLogoFile(null);
                  setLetterheadFile(null);
                  setWarning(null);
                  setDone(false);
                }}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Criar outra
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="mb-8 flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  aria-current={i === step ? "step" : undefined}
                  className={`h-1.5 flex-1 rounded ${
                    i <= step ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                  }`}
                />
              ))}
            </div>

            {step === 0 && (
              <section>
                <h1 className="font-serif text-2xl font-semibold tracking-tight">
                  Qual o nome do escritório?
                </h1>
                <p className="mt-2 text-[var(--muted)]">
                  Esse é o escritório-cliente sob a sua operação.
                </p>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Almeida & Dias Advocacia"
                  maxLength={120}
                  className={fieldClass}
                />
                <div className="mt-8 flex items-center justify-between">
                  <Link
                    href="/admin/subcontas"
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    ← Cancelar
                  </Link>
                  <Button onClick={() => setStep(1)} disabled={!name.trim()}>
                    Continuar
                  </Button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section>
                <h1 className="font-serif text-2xl font-semibold tracking-tight">
                  Quem é o administrador?
                </h1>
                <p className="mt-2 text-[var(--muted)]">
                  Essa pessoa vai gerenciar o escritório e poderá entrar com o
                  e-mail informado.
                </p>
                <label className="mt-6 block text-sm font-medium">Nome</label>
                <input
                  autoFocus
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Nome do responsável"
                  maxLength={120}
                  className={fieldClass}
                />
                <label className="mt-4 block text-sm font-medium">E-mail</label>
                <input
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  type="email"
                  placeholder="admin@escritorio.com"
                  maxLength={254}
                  className={fieldClass}
                />
                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    ← Voltar
                  </button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={
                      adminName.trim().length < 2 ||
                      !EMAIL_PATTERN.test(adminEmail.trim())
                    }
                  >
                    Continuar
                  </Button>
                </div>
              </section>
            )}

            {step === 1 && (
              <section>
                <h1 className="font-serif text-2xl font-semibold tracking-tight">
                  Como esse escritório trabalha?
                </h1>
                <p className="mt-2 text-[var(--muted)]">
                  Quatro respostas que ajustam a IA e o atendimento ao caso real
                  do escritório.
                </p>

                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">
                    Áreas de atuação
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DOMAINS.map((d) => {
                      const active = domains.includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => toggleDomain(d.value)}
                          className={`h-10 rounded-[var(--radius-card)] border px-4 text-sm transition-colors ${
                            active
                              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary)]"
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">
                    Porte (nº de advogados)
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {FIRM_SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFirmSize(s)}
                        className={`h-10 rounded-[var(--radius-card)] border px-4 text-sm transition-colors ${
                          firmSize === s
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">
                    Como controla prazos hoje?
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DEADLINE_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setDeadlineControl(o.value)}
                        className={`h-10 rounded-[var(--radius-card)] border px-4 text-sm transition-colors ${
                          deadlineControl === o.value
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="mt-6 block text-sm font-medium">
                  Maior gargalo hoje
                </label>
                <textarea
                  value={mainBottleneck}
                  onChange={(e) => setMainBottleneck(e.target.value)}
                  placeholder="Em uma frase: o que mais trava o escritório hoje?"
                  rows={3}
                  maxLength={1000}
                  className="mt-2 w-full rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base outline-none focus:border-[var(--primary)]"
                />

                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setStep(0)}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    ← Voltar
                  </button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={
                      domains.length === 0 ||
                      !firmSize ||
                      !deadlineControl ||
                      !mainBottleneck.trim()
                    }
                  >
                    Continuar
                  </Button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <h1 className="font-serif text-2xl font-semibold tracking-tight">
                  Identidade do escritório
                </h1>
                <p className="mt-2 text-[var(--muted)]">
                  Opcional. Usado depois em peças, propostas e papel timbrado. Dá
                  pra pular e configurar mais tarde.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={useBrandColor}
                        onChange={(e) => setUseBrandColor(e.target.checked)}
                      />
                      Cor primária da marca
                    </label>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="color"
                        value={brandPrimaryColor}
                        disabled={!useBrandColor}
                        onChange={(e) => setBrandPrimaryColor(e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)] disabled:opacity-40"
                      />
                      <span className="font-mono text-sm text-[var(--muted)]">
                        {useBrandColor ? brandPrimaryColor : "não informado"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={useSecondaryColor}
                        onChange={(e) => setUseSecondaryColor(e.target.checked)}
                      />
                      Cor secundária (opcional)
                    </label>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="color"
                        value={brandSecondaryColor}
                        disabled={!useSecondaryColor}
                        onChange={(e) => setBrandSecondaryColor(e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)] disabled:opacity-40"
                      />
                      <span className="font-mono text-sm text-[var(--muted)]">
                        {useSecondaryColor ? brandSecondaryColor : "não informado"}
                      </span>
                    </div>
                  </div>
                </div>

                <label className="mt-5 block text-sm font-medium">
                  Logo do escritório
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-4 file:h-10 file:rounded-[var(--radius-card)] file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-4 file:text-sm file:font-medium"
                />
                {logoFile && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {logoFile.name}
                  </p>
                )}
                {!logoFile && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    PNG, JPEG, WebP ou SVG, até 5 MB.
                  </p>
                )}

                <label className="mt-5 block text-sm font-medium">
                  Papel timbrado
                </label>
                <input
                  type="file"
                  accept="application/pdf,.doc,.docx,image/png,image/jpeg"
                  onChange={(e) =>
                    setLetterheadFile(e.target.files?.[0] ?? null)
                  }
                  className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-4 file:h-10 file:rounded-[var(--radius-card)] file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-4 file:text-sm file:font-medium"
                />
                {letterheadFile && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {letterheadFile.name}
                  </p>
                )}
                {!letterheadFile && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    PDF, DOC, DOCX, PNG ou JPEG, até 10 MB.
                  </p>
                )}

                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    ← Voltar
                  </button>
                  <Button onClick={() => setStep(3)}>Continuar</Button>
                </div>
              </section>
            )}

            {step === 4 && (
              <section>
                <h1 className="font-serif text-2xl font-semibold tracking-tight">
                  Confirme os dados
                </h1>
                <dl className="mt-6 grid gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm">
                  <Row label="Escritório" value={name} />
                  <Row label="Administrador" value={adminName || "não informado"} />
                  <Row label="E-mail" value={adminEmail} />
                  <Row
                    label="Áreas"
                    value={
                      domains
                        .map(
                          (d) => DOMAINS.find((x) => x.value === d)?.label ?? d,
                        )
                        .join(", ") || "não informado"
                    }
                  />
                  <Row label="Porte" value={firmSize || "não informado"} />
                  <Row
                    label="Controle de prazos"
                    value={
                      DEADLINE_OPTIONS.find((o) => o.value === deadlineControl)
                        ?.label || "não informado"
                    }
                  />
                  <Row label="Gargalo" value={mainBottleneck || "não informado"} />
                  <Row
                    label="Cor primária"
                    value={useBrandColor ? brandPrimaryColor : "não informado"}
                  />
                  <Row label="Logo" value={logoFile?.name || "não informado"} />
                  <Row
                    label="Papel timbrado"
                    value={letterheadFile?.name || "não informado"}
                  />
                </dl>
                {error && (
                  <p
                    aria-live="polite"
                    className="mt-4 rounded-[var(--radius-card)] border border-[var(--danger)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--danger)]"
                  >
                    {error}
                  </p>
                )}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    ← Voltar
                  </button>
                  <Button size="lg" onClick={finish} disabled={isPending}>
                    {isPending ? "Criando..." : "Criar escritório →"}
                  </Button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
