import { Shell } from "@/components/Shell";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId, getImpersonatorUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CasosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUserId = await getSessionUserId();
  const impersonating = !!(await getImpersonatorUserId());
  const ctx = await getActorContext();

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
