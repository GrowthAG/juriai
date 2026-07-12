"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Produto", href: "#produto-em-acao" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Preços", href: "#precos" },
  { label: "Para quem", href: "#para-quem" },
  { label: "Confiança", href: "#seguranca" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/92 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-serif text-lg font-semibold tracking-tight"
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
          />
          <span>
            Juri<span className="font-sans text-[var(--accent)]">AI</span>
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

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)] sm:inline-flex"
          >
            Entrar
          </Link>
          <a
            href="mailto:contato@juriai.com.br?subject=Demo%20JuriAI%20com%20caso%20real"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)] sm:px-5"
          >
            <span className="sm:hidden">Demo</span>
            <span className="hidden sm:inline">Agendar demo</span>
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] md:hidden"
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Fechar" : "Menu"}</span>
            <span aria-hidden="true" className="flex flex-col gap-1.5">
              <span
                className={[
                  "block h-0.5 w-4 bg-current transition-transform",
                  open ? "translate-y-2 rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-0.5 w-4 bg-current transition-opacity",
                  open ? "opacity-0" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-0.5 w-4 bg-current transition-transform",
                  open ? "-translate-y-2 -rotate-45" : "",
                ].join(" ")}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="site-mobile-nav"
          className="border-t border-[var(--border)] bg-[var(--surface)] md:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto flex max-w-6xl flex-col px-6 py-3">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-3 text-sm font-medium text-[var(--foreground)]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="block py-3 text-sm font-medium text-[var(--muted)]"
                onClick={() => setOpen(false)}
              >
                Entrar
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
