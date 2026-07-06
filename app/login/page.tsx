import Image from "next/image";
import { Button, Card } from "@/components/ui";
import { loginAsEmail, loginWithGoogle } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

// E-mail do usuário de desenvolvimento (login local sem senha). Não é escolha
// de persona: o papel/workspace são resolvidos no servidor pelo e-mail.
const DEV_EMAIL = "dev@juriai.local";

// Linhas estáticas do mini painel operacional (ilustrativas, sem prometer
// auditoria técnica nem expor termos internos).
const OPERATION_ROWS = [
  "Contexto recebido",
  "Documento vinculado",
  "Revisão humana",
  "Próxima ação",
];

const STEPPER = ["Contexto", "Revisão", "Próxima ação"];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    // w-full flex-1: o <body> do root layout é `flex`; sem isto o main encolhe
    // para o conteúdo e a tela fica presa à esquerda (não tocamos no layout).
    <main className="flex w-full flex-1">
      <div className="grid w-full lg:grid-cols-[42fr_58fr]">
        {/* ── Lado esquerdo — login principal ───────────────────────── */}
        <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6 py-16">
          <div className="w-full max-w-md">
            {/* Logo oficial: gavel-tile + wordmark */}
            <div className="flex items-center gap-2.5">
              <Image
                src="/brand/gavel-tile.svg"
                width={32}
                height={32}
                alt=""
                aria-hidden="true"
                unoptimized
              />
              <span className="font-serif text-lg font-semibold tracking-tight">
                Juri<span className="font-sans text-[var(--accent)]">AI</span>
              </span>
            </div>

            <Card className="mt-8 px-7 py-8">
              <h1 className="font-serif text-2xl font-semibold tracking-tight">
                Entrar no JuriAI
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Acesse o workspace do seu escritório.
              </p>

              {error && (
                <p
                  role="alert"
                  className="mt-6 rounded-lg border border-[var(--danger)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--danger)]"
                >
                  {error}
                </p>
              )}

              <form action={loginWithGoogle} className="mt-7">
                <Button type="submit" className="w-full">
                  Entrar com Google
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-3 text-xs text-[var(--muted)]">
                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
                ou
                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
              </div>

              <form action={loginAsEmail} className="mt-6 grid gap-5">
                <div className="grid gap-2">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus
                    placeholder="voce@escritorio.com.br"
                    className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--primary)]"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>

              <p className="mt-5 text-xs leading-relaxed text-[var(--muted)]">
                Permissões, papel e workspace são aplicados automaticamente após
                a autenticação.
              </p>
            </Card>

            {/* Ambiente local — bloco discreto, alinhado à largura do card */}
            {process.env.NODE_ENV === "development" && process.env.JURIAI_ALLOW_DEV_BYPASS === "true" && (
              <div className="mt-5 border-t border-[var(--border)] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                  Ambiente local
                </p>
                <form action={loginAsEmail} className="mt-1">
                  <input type="hidden" name="email" value={DEV_EMAIL} />
                  <Button
                    type="submit"
                    variant="ghost"
                    className="h-auto px-0 text-xs font-medium"
                  >
                    Entrar com usuário de desenvolvimento
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ── Lado direito — painel editorial-operacional (desktop) ─── */}
        <aside className="hidden min-h-screen flex-col justify-center border-l border-[var(--border)] bg-[var(--surface)] px-12 py-16 lg:flex">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Legal Operating System
            </p>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-[var(--foreground)]">
              Fluxos guiados para operar casos com revisão humana.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              O JuriAI organiza contexto, documentos e próximos passos antes da
              revisão do advogado.
            </p>

            {/* Mini painel operacional — moldura 1px, estático */}
            <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)]">
              <p className="border-b border-[var(--border)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                Fila operacional
              </p>
              <ul className="divide-y divide-[var(--border)]">
                {OPERATION_ROWS.map((row) => (
                  <li key={row} className="flex items-center gap-2.5 px-4 py-2.5">
                    <span
                      className="site-status-dot shrink-0"
                      data-active="true"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-[var(--foreground)]">
                      {row}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stepper discreto */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
              {STEPPER.map((step, i) => (
                <span key={step} className="flex items-center gap-1.5">
                  <span>{step}</span>
                  {i < STEPPER.length - 1 && (
                    <span aria-hidden="true" className="text-[var(--border-strong)]">
                      →
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
