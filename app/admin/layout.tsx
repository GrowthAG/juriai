import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUserId = await getSessionUserId();
  const ctx = await getActorContext();

  const isWorkspaceAdmin =
    ctx.isSuperAdmin || ctx.workspaceRole === "WORKSPACE_ADMIN";

  // Mesma regra de app/actions/admin.ts (requireAdmin): sem isso, um usuário
  // autenticado sem permissão via aqui direto no erro não tratado das
  // funções de dados (getAdminOverview etc.), em vez de um redirect limpo.
  if (!isWorkspaceAdmin) {
    redirect("/workspace");
  }

  return (
    <Shell
      user={{
        name: ctx.actorName,
        email: ctx.actorEmail,
        workspaceName: ctx.workspaceName,
        workspaceKind: ctx.workspaceKind,
        authenticated: !!sessionUserId,
        isWorkspaceAdmin,
      }}
    >
      {children}
    </Shell>
  );
}
