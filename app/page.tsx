import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getActorContext } from "@/lib/actor-context";
import { getSessionUserId } from "@/lib/session";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroSection } from "@/components/site/HeroSection";
import { TrustStrip } from "@/components/site/TrustStrip";
import { HumanStrip } from "@/components/site/HumanStrip";
import { ProblemSection } from "@/components/site/ProblemSection";
import { MechanismSection } from "@/components/site/MechanismSection";
import { ProductShowcaseSection } from "@/components/site/ProductShowcaseSection";
import { ProductModulesSection } from "@/components/site/ProductModulesSection";
import { PricingSection } from "@/components/site/PricingSection";
import { AudienceSection } from "@/components/site/AudienceSection";
import { TrustSection } from "@/components/site/TrustSection";
import { ComparisonSection } from "@/components/site/ComparisonSection";
import { FinalCta } from "@/components/site/FinalCta";
import { getAppPath, isAppHost } from "@/lib/public-urls";

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
    <SiteLayout>
      <HeroSection />
      <TrustStrip />
      <HumanStrip />
      <ProblemSection />
      <MechanismSection />
      <ProductShowcaseSection />
      <ProductModulesSection />
      <PricingSection />
      <AudienceSection />
      <TrustSection />
      <ComparisonSection />
      <FinalCta />
    </SiteLayout>
  );
}
