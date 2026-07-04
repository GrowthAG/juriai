import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";

const NAV_LINKS = [
  { label: "Produto", href: "#produto" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Segurança", href: "#seguranca" },
  { label: "Recursos", href: "#recursos" },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    // O <body> do root layout é `flex` (linha), pensado para o app com sidebar.
    // No site público este wrapper precisa crescer e ocupar a largura toda,
    // senão encolhe para o conteúdo e a página fica espremida à esquerda.
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--background)]">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-serif text-lg font-semibold"
          aria-label="JuriAI — página inicial"
        >
          <Image
            src="/brand/gavel-tile.svg"
            width={32}
            height={32}
            alt=""
            aria-hidden="true"
            unoptimized
          />
          <span>
            Juri<span className="font-sans text-[var(--accent)]">AI</span>
          </span>
        </Link>

        {/* Navegação central — âncoras das seções da Home */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Entrar
          </Link>
          <a
            href="mailto:contato@juriai.com.br"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            Solicitar demonstração
          </a>
        </div>
      </div>
    </header>
  );
}
