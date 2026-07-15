import type { ReactNode } from "react";
import { getAppPath } from "@/lib/public-urls";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteLayout({ children }: { children: ReactNode }) {
  const appLoginUrl = getAppPath("/login");
  return (
    // O <body> do root layout é `flex` (linha), pensado para o app com sidebar.
    // No site público este wrapper precisa crescer e ocupar a largura toda.
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--background)]">
      <SiteHeader appLoginUrl={appLoginUrl} />
      <main className="flex-1">{children}</main>
      <SiteFooter appLoginUrl={appLoginUrl} />
    </div>
  );
}
