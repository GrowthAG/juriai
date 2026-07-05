import { redirect } from "next/navigation";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId } from "@/lib/session";
import { MonitorScreen } from "./MonitorScreen";

export const metadata = {
  title: "Monitoramento Jurídico",
};

export default async function MonitoramentoPage() {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    redirect("/login");
  }

  const context = await getActorContext();
  
  // Bloqueio de segurança no Server Component
  if (!context.isSuperAdmin && context.workspaceRole !== "WORKSPACE_ADMIN") {
    redirect("/workspace");
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 overflow-y-auto bg-[var(--background)] px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              Monitoramento Jurídico
            </h1>
            <p className="mt-2 text-[var(--muted)]">
              Consulta experimental de publicações e movimentações. Para melhor performance, comece consultando 1 dia por vez.
            </p>
          </header>

          <MonitorScreen />
          
          <footer className="mt-12 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
            <p>
              Dados provenientes de fonte pública (DJEN/DataJud). Consulta restrita a administradores
              do escritório. Ao vincular uma publicação a um caso, ela é salva no histórico do caso e
              marcada para validação nos autos antes de qualquer uso operacional.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
