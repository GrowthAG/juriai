import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteLayout({ children }: { children: ReactNode }) {
 return (
 // O <body> do root layout é `flex` (linha), pensado para o app com sidebar.
 // No site público este wrapper precisa crescer e ocupar a largura toda,
 // senão encolhe para o conteúdo e a página fica espremida à esquerda.
 <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--background)]">
 <SiteHeader />
 <main className="flex-1">{children}</main>
 <SiteFooter />
 </div>
 );
}
