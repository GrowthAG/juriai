import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { loginAsEmail, loginWithGoogle, registerWithEmailAndPassword } from "@/app/actions/auth";
import { getAppPath, getAppUrl, isMarketingHost } from "@/lib/public-urls";
import { getSessionUserId } from "@/lib/session";
import { getActorContext } from "@/lib/actor-context";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  const { tab = "login", error } = await searchParams;
  const isRegister = tab === "register";

  const requestHeaders = await headers();
  const requestHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (isMarketingHost(requestHost) && getAppUrl()) {
    const target = new URL(getAppPath("/login"));
    if (error) target.searchParams.set("error", error);
    redirect(target.toString());
  }

  // Se o usuário já possui sessão ativa, vai direto para o cockpit
  const sessionUserId = await getSessionUserId();
  if (sessionUserId) {
    try {
      const ctx = await getActorContext();
      if (ctx) {
        if (ctx.isSuperAdmin || ctx.workspaceKind === "MASTER") {
          redirect(getAppPath("/admin"));
        }
        redirect(getAppPath("/workspace"));
      }
    } catch (e) {}
  }

  return (
    <main className="flex min-h-screen w-full flex-1 bg-[var(--background)]">
      <div className="grid w-full lg:grid-cols-12 min-h-screen">
        
        {/* ── COLUNA ESQUERDA: FORMULÁRIO DE LOGIN / CADASTRO (5 colunas) ── */}
        <div className="flex flex-col justify-between bg-[var(--surface)] px-6 py-10 sm:px-12 lg:col-span-5 lg:px-14 xl:col-span-5 border-r border-[var(--border)]">
          {/* Topbar: Logo e selo de segurança */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/brand/gavel-tile.svg"
                width={32}
                height={32}
                alt="JuriAI"
                aria-hidden="true"
                unoptimized
                className="transition-transform group-hover:scale-105"
              />
              <span className="font-serif text-xl font-semibold tracking-tight text-[var(--foreground)]">
                Juri<span className="font-sans text-[var(--primary)]">AI</span>
              </span>
            </Link>
            <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
              Acesso Seguro
            </span>
          </div>

          {/* Card Central */}
          <div className="my-auto w-full max-w-sm mx-auto py-6">
            {/* Seletor de Abas: Entrar vs Criar Conta */}
            <div className="flex rounded-xl border border-[var(--border)] bg-[var(--background)] p-1 mb-6">
              <Link
                href="/login?tab=login"
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition ${
                  !isRegister
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Entrar
              </Link>
              <Link
                href="/login?tab=register"
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition ${
                  isRegister
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Criar Conta (Trial 30D)
              </Link>
            </div>

            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {isRegister ? "Iniciar Programa Pioneiro" : "Entrar no Workspace"}
              </h1>
              <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
                {isRegister
                  ? "Ative seu trial de 30 dias com acesso completo para a sua banca."
                  : "Acesse o ambiente operacional do seu escritório."}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-[var(--danger)] bg-red-50/60 px-3.5 py-2.5 text-xs font-medium text-[var(--danger)]"
              >
                {error}
              </div>
            )}

            {/* Google OAuth Button */}
            <form action={loginWithGoogle} className="mt-5">
              <button
                type="submit"
                className="flex h-10 w-full items-center justify-center gap-3 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isRegister ? "Cadastrar com Conta Google" : "Entrar com Conta Google"}</span>
              </button>
            </form>

            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <span className="relative bg-[var(--surface)] px-3 text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">
                ou {isRegister ? "preencha os dados da banca" : "por e-mail corporativo"}
              </span>
            </div>

            {/* Formulário Condicional */}
            {isRegister ? (
              <form action={registerWithEmailAndPassword} className="space-y-3">
                <div>
                  <label htmlFor="reg-name" className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] mb-1">
                    Nome Completo do Sócio / Titular
                  </label>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Dr. Alexandre Albuquerque"
                    className="h-10 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="alexandre@escritorio.adv.br"
                    className="h-10 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] mb-1">
                    WhatsApp com DDD
                  </label>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    className="h-10 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label htmlFor="reg-pass" className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] mb-1">
                    Criar Senha de Acesso
                  </label>
                  <input
                    id="reg-pass"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="h-10 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <Button type="submit" size="md" className="w-full font-semibold shadow-sm h-11 mt-2">
                  Iniciar Trial de 30 Dias →
                </Button>
              </form>
            ) : (
              <form action={loginAsEmail} className="space-y-3.5">
                <div>
                  <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] mb-1">
                    E-mail do Escritório
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="voce@escritorio.adv.br"
                    className="h-10 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <Button type="submit" size="md" className="w-full font-semibold shadow-sm h-11">
                  Acessar Escritório →
                </Button>

                <div className="pt-2 text-center">
                  <Link href="/login?tab=register" className="text-xs text-[var(--primary)] font-semibold hover:underline">
                    Ainda não tem acesso? Iniciar Trial de 30 Dias →
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Footer discreto */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>JuriAI LegalTech Platform</span>
            <span>A IA sugere. O advogado valida.</span>
          </div>
        </div>

        {/* ── COLUNA DIREITA: CAPA AZUL INSTITUCIONAL (7 colunas no desktop) ── */}
        <div className="relative hidden lg:col-span-7 xl:col-span-7 lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:p-16">
          {/* Fundo com Gradiente Nobre em Azul Royal */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#060D1A] via-[#0A192F] to-[#0A2540]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,90,255,0.22),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(20,90,255,0.12),transparent_60%)]" />
            {/* Grid sutil de linhas de precisão */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          {/* Selo superior */}
          <div className="relative z-10 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/25 px-3.5 py-1 text-xs font-medium text-blue-200 backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Programa de Escritórios Pioneiros
            </span>
          </div>

          {/* Conteúdo Central */}
          <div className="relative z-10 max-w-lg space-y-5">
            <h2 className="font-serif text-3xl font-semibold leading-tight text-white xl:text-4xl">
              A precisão documental que a advocacia de alto nível exige.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Estruturação automática de linha do tempo, classificação de provas materiais e geração de minutas com rastreabilidade absoluta de fontes. Sem inventar jurisprudência.
            </p>

            {/* Três pilares sóbrios */}
            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-800/80">
              <div>
                <p className="font-mono text-sm font-bold text-white">100%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Rastreabilidade</p>
              </div>
              <div>
                <p className="font-mono text-sm font-bold text-white">Zero</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Alucinações</p>
              </div>
              <div>
                <p className="font-mono text-sm font-bold text-white">Multi-Tenant</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Isolamento Total</p>
              </div>
            </div>
          </div>

          {/* Rodapé institucional */}
          <div className="relative z-10 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Conforme com os padrões éticos e de sigilo da OAB.</span>
            <span>LGPD Art. 7 V/VI</span>
          </div>
        </div>

      </div>
    </main>
  );
}
