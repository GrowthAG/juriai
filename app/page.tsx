import { redirect } from "next/navigation";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId } from "@/lib/session";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroSection } from "@/components/site/HeroSection";
import { ProblemSection } from "@/components/site/ProblemSection";
import { ProductModulesSection } from "@/components/site/ProductModulesSection";
import { MechanismSection } from "@/components/site/MechanismSection";
import { OperationalScenariosSection } from "@/components/site/OperationalScenariosSection";
import { TrustSection } from "@/components/site/TrustSection";
import { ComparisonSection } from "@/components/site/ComparisonSection";
import { FinalCta } from "@/components/site/FinalCta";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessionUserId = await getSessionUserId();

  // A detecção de usuário logado depende do banco (RBAC real). A Home pública
  // não pode cair junto com o banco/proxy/ADC: se o contexto não puder ser
  // carregado, renderizamos a home pública em vez de propagar o erro.
  // Os redirect() ficam FORA do try/catch de propósito — no Next eles funcionam
  // lançando NEXT_REDIRECT, e um catch aqui engoliria o redirect.
  let ctx: Awaited<ReturnType<typeof getActorContext>> | null = null;
  if (sessionUserId) {
    try {
      ctx = await getActorContext();
    } catch (error) {
      console.warn(
        "[JuriAI public home] contexto indisponível, renderizando home pública",
        {
          name: error instanceof Error ? error.name : "UnknownError",
          message: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }

  if (ctx) {
    if (ctx.isSuperAdmin || ctx.workspaceKind === "MASTER") {
      redirect("/admin");
    }
    redirect("/workspace");
  }

  return (
    <SiteLayout>
      <HeroSection />
      <ProblemSection />
      <MechanismSection />
      <ProductModulesSection />
      <OperationalScenariosSection />
      <TrustSection />
      <ComparisonSection />
      <FinalCta />
    </SiteLayout>
  );
}
