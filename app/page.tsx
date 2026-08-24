import { redirect } from "next/navigation";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId } from "@/lib/session";
import { getAppPath } from "@/lib/public-urls";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessionUserId = await getSessionUserId();

  let ctx: Awaited<ReturnType<typeof getActorContext>> | null = null;
  if (sessionUserId) {
    try {
      ctx = await getActorContext();
    } catch (error) {
      console.warn("[JuriAI root] contexto indisponivel", error);
    }
  }

  if (ctx) {
    if (ctx.isSuperAdmin || ctx.workspaceKind === "MASTER") {
      redirect(getAppPath("/admin"));
    }
    redirect(getAppPath("/workspace"));
  }

  redirect("/login");
}
