import { redirect } from "next/navigation";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    redirect("/login");
  }

  const ctx = await getActorContext();
  if (ctx.isSuperAdmin || ctx.workspaceKind === "MASTER") {
    redirect("/admin");
  }

  redirect("/workspace");
}
