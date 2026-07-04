"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

export type WorkspaceKind = "MASTER" | "SUBCONTA";

export type SidebarUser = {
  name: string;
  email: string;
  workspaceName: string;
  workspaceKind: WorkspaceKind;
  authenticated: boolean;
  isWorkspaceAdmin: boolean;
};

type NavItem = {
  href?: string;
  label: string;
  section: string;
  disabled?: boolean;
  note?: string;
  adminOnly?: boolean;
};

const CONSOLE_NAV: NavItem[] = [
  { href: "/admin", label: "Visão geral", section: "Console JuriAI" },
  { href: "/admin/subcontas", label: "Escritórios", section: "Console JuriAI" },
  { href: "/admin/planos", label: "Planos", section: "Console JuriAI" },
  { label: "Saúde", section: "Console JuriAI", disabled: true, note: "Em breve" },
  {
    label: "Configurações globais",
    section: "Console JuriAI",
    disabled: true,
    note: "Em breve",
  },
];

const WORKSPACE_NAV: NavItem[] = [
  { href: "/workspace", label: "Visão geral", section: "Operação" },
  { href: "/workspace/casos", label: "Casos", section: "Operação" },
  {
    href: "/workspace/monitoramento",
    label: "Monitoramento",
    section: "Operação",
    adminOnly: true,
  },
  { href: "/casos/novo", label: "Novo caso", section: "Operação" },
  { href: "/configuracoes", label: "Configurações", section: "Gestão do Escritório" },
];

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const isConsole = user.workspaceKind === "MASTER";
  const navItems = (isConsole ? CONSOLE_NAV : WORKSPACE_NAV).filter(
    (item) => !item.adminOnly || user.isWorkspaceAdmin,
  );
  const sections = Array.from(new Set(navItems.map((item) => item.section)));

  function isActive(href?: string) {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="fixed left-0 top-0 flex h-full w-56 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--border)] px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/gavel-tile.svg"
          alt=""
          aria-hidden="true"
          className="h-8 w-8"
        />
        <span className="font-serif text-lg font-semibold tracking-tight">
          Juri<span className="font-sans text-[var(--accent)]">AI</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {sections.map((section) => (
          <div key={section} className="mb-3">
            <span className="mb-1 block px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
              {section}
            </span>
            <div className="grid gap-1">
              {navItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <NavLink key={`${section}-${item.label}`} item={item} active={isActive(item.href)} />
                ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] px-5 py-4">
        <p className="truncate text-xs font-medium text-[var(--foreground)]">
          {user.name}
        </p>
        <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
          {user.workspaceName}
        </p>
        <p className="mt-2 inline-flex rounded bg-[var(--background)] px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
          {isConsole ? "Console JuriAI" : "Meu Escritório"}
        </p>
        {user.authenticated ? (
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Sair
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="mt-3 inline-block text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Entrar
          </Link>
        )}
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const base =
    "rounded-lg px-3 py-2 text-sm transition-colors border border-transparent";

  if (item.disabled || !item.href) {
    return (
      <div
        className={`${base} cursor-default text-[var(--muted)] opacity-60`}
        title={item.note}
      >
        <div className="flex items-center justify-between gap-3">
          <span>{item.label}</span>
          {item.note ? <span className="text-[10px] uppercase tracking-wide">{item.note}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`${base} ${
        active
          ? "border-[var(--border)] bg-[var(--background)] font-semibold text-[var(--foreground)]"
          : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
      }`}
    >
      {item.label}
    </Link>
  );
}
