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

  const isMasterAdmin =
    ctx.isSuperAdmin || ctx.workspaceKind === "MASTER";

  // Apenas o Super Admin ou o workspace MASTER podem acessar o console administrativo.
  // Subcontas / clientes são estritamente redirecionados para o Cockpit /workspace.
  if (!isMasterAdmin) {
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
