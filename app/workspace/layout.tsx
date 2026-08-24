import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId, getImpersonatorUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUserId = await getSessionUserId();
  const impersonating = !!(await getImpersonatorUserId());
  
  let ctx: Awaited<ReturnType<typeof getActorContext>> | null = null;
  try {
    ctx = await getActorContext();
  } catch {
    redirect("/login");
  }

  if (!ctx) {
    redirect("/login");
  }

  return (
    <Shell
      impersonating={impersonating}
      user={{
        name: ctx.actorName,
        email: ctx.actorEmail,
        workspaceName: ctx.workspaceName,
        workspaceKind: ctx.workspaceKind,
        authenticated: !!sessionUserId,
        isWorkspaceAdmin:
          ctx.isSuperAdmin || ctx.workspaceRole === "WORKSPACE_ADMIN",
      }}
    >
      {children}
    </Shell>
  );
}
