import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId } from "@/lib/session";
import { getAppPath, isAppHost } from "@/lib/public-urls";
import { LandingPage } from "@/components/LandingPage";

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
      console.warn("[JuriAI public home] contexto indisponivel", error);
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

  return <LandingPage />;
}
