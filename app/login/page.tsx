import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { loginAsEmail, loginWithGoogle } from "@/app/actions/auth";
import { getAppPath, getAppUrl, isMarketingHost } from "@/lib/public-urls";
import { getSessionUserId } from "@/lib/session";
import { getActorContext } from "@/lib/actor-context";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
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
        
        {/* ── COLUNA ESQUERDA: LOGIN FORM (5 colunas no desktop) ── */}
        <div className="flex flex-col justify-between bg-[var(--surface)] px-6 py-10 sm:px-12 lg:col-span-5 lg:px-16 xl:col-span-5 border-r border-[var(--border)]">
          {/* Topbar: Logo e link para trial */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/brand/gavel-tile.svg"
                width={30}
                height={30}
                alt="JuriAI"
                aria-hidden="true"
                unoptimized
                className="transition-transform group-hover:scale-105"
              />
              <span className="font-serif text-lg font-semibold tracking-tight text-[var(--foreground)]">
                Juri<span className="font-sans text-[var(--primary)]">AI</span>
              </span>
            </Link>
            <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]">
              Acesso Seguro
            </span>
          </div>

          {/* Card Central de Login */}
          <div className="my-auto w-full max-w-sm mx-auto py-8">
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                Entrar no Workspace
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                Acesse o ambiente operacional do seu escritório.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-[var(--radius)] border border-[var(--danger)] bg-red-50/50 px-3.5 py-2.5 text-xs font-medium text-[var(--danger)]"
              >
                {error}
              </div>
            )}

            {/* Google OAuth Button */}
            <form action={loginWithGoogle} className="mt-7">
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-3 rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
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
                <span>Entrar com Conta Google</span>
              </button>
            </form>

            <div className="relative mt-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <span className="relative bg-[var(--surface)] px-3 text-[11px] uppercase tracking-wider text-[var(--muted)] font-medium">
                ou por e-mail corporativo
              </span>
            </div>

            {/* Email Login Form */}
            <form action={loginAsEmail} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-1.5"
                >
                  E-mail do Escritório
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="voce@escritorio.adv.br"
                  className="h-11 w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <Button type="submit" size="md" className="w-full font-semibold shadow-sm">
                Acessar Escritório →
              </Button>
            </form>

            {/* Banner de Criação de Trial */}
            <div className="mt-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-4 text-center">
              <p className="text-xs text-[var(--muted)]">
                Ainda não tem um workspace cadastrado?
              </p>
              <Link
                href="/cadastro"
                className="mt-1.5 inline-block text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                Criar conta e iniciar Trial de 30 dias →
              </Link>
            </div>
          </div>

          {/* Footer discreto */}
          <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>JuriAI LegalTech Platform</span>
            <span>A IA sugere. O advogado valida.</span>
          </div>
        </div>

        {/* ── COLUNA DIREITA: PAINEL EDITORIAL (7 colunas no desktop) ── */}
        <div className="relative hidden lg:col-span-7 xl:col-span-7 lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:p-16">
          {/* Background sofisticado com gradiente e ambient glow */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0A192F]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,90,255,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(15,43,72,0.4),transparent_50%)]" />
          </div>

          {/* Topo do painel editorial */}
          <div className="relative z-10 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-400/20 px-3 py-1 text-xs font-medium text-blue-300">
              Contencioso Cível e Consultoria B2B
            </span>
          </div>

          {/* Conteúdo Editorial Central */}
          <div className="relative z-10 max-w-lg space-y-5">
            <h2 className="font-serif text-3xl font-semibold leading-tight text-white xl:text-4xl">
              A precisão documental que a advocacia de alto nível exige.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Estruturação automática de linha do tempo, classificação de provas materiais e geração de minutas com rastreabilidade absoluta de fontes. Sem inventar jurisprudência.
            </p>

            {/* Três pilares sóbrios */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div>
                <p className="font-mono text-xs font-bold text-white">100%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Rastreabilidade</p>
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-white">Zero</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Alucinações</p>
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-white">Multi-Tenant</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Isolamento Total</p>
              </div>
            </div>
          </div>

          {/* Rodapé da imagem */}
          <div className="relative z-10 text-[11px] text-slate-500 font-mono">
            Conforme com os padrões éticos e de sigilo profissional da OAB.
          </div>
        </div>

      </div>
    </main>
  );
}
