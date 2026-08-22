"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Produto", href: "#produto-em-acao" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Módulos", href: "#modulos" },
  { label: "Preços", href: "#precos" },
  { label: "Para quem", href: "#para-quem" },
  { label: "Segurança", href: "#seguranca" },
];

export function SiteHeader({ appLoginUrl = "/login" }: { appLoginUrl?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-serif text-lg font-semibold tracking-tight group"
          aria-label="JuriAI, página inicial"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/brand/gavel-tile.svg"
            width={32}
            height={32}
            alt=""
            aria-hidden="true"
            unoptimized
            className="transition-transform group-hover:scale-105"
          />
          <span className="font-serif text-[19px] font-semibold text-[var(--foreground)]">
            Juri<span className="font-sans text-[var(--primary)] font-bold">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={appLoginUrl}
            className="hidden rounded-[var(--radius)] px-3.5 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)] sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)] shadow-sm"
          >
            Criar conta →
          </Link>
        </div>
      </div>
    </header>
  );
}
