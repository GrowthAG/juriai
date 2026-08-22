import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId } from "@/lib/session";
import { getAppPath, isAppHost } from "@/lib/public-urls";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sessionUserId, requestHeaders] = await Promise.all([
    getSessionUserId(),
    headers(),
  ]);

  let ctx: Awaited<ReturnType<typeof getActorContext>> | null = null;
  if (sessionUserId) {
    try {
      ctx = await getActorContext();
    } catch (error) {
      console.warn("[JuriAI public home] contexto indisponível", error);
    }
  }

  if (ctx) {
    if (ctx.isSuperAdmin || ctx.workspaceKind === "MASTER") {
      redirect(getAppPath("/admin"));
    }
    redirect(getAppPath("/workspace"));
  }

  const requestHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (isAppHost(requestHost)) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Image
              src="/brand/gavel-tile.svg"
              width={30}
              height={30}
              alt="JuriAI"
              unoptimized
            />
            <span className="font-serif text-lg font-semibold text-slate-900">
              Juri<span className="font-sans text-blue-600 font-bold">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Criar conta →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Container */}
      <section className="mx-auto flex flex-1 max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          Inteligência Operacional Cível B2B
        </div>
        <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Elimine o custo e o retrabalho de estagiário no seu contencioso cível.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
          Estruturação de fatos, linha do tempo documental e minutas no papel timbrado oficial da sua advocacia. Sem alucinações.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/cadastro"
            className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
          >
            Criar conta do escritório →
          </Link>
          <Link
            href="/demo/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver demonstração
          </Link>
        </div>
      </section>
    </main>
  );
}
