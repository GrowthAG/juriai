"use client";

import { usePathname } from "next/navigation";
import { Sidebar, type SidebarUser } from "@/components/Sidebar";
import { exitImpersonation } from "@/app/actions/admin";

/* Decide o layout por rota: /login é tela cheia (pré-login, sem sidebar);
   o resto roda dentro da casca com o sidebar fixo. */
const FULLSCREEN = ["/login"];

export function Shell({
  user,
  impersonating = false,
  children,
}: {
  user: SidebarUser;
  impersonating?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (FULLSCREEN.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar user={user} />
      <div className="ml-56 flex min-h-full flex-1 flex-col">
        {impersonating && (
          <div className="flex items-center justify-between gap-4 bg-[var(--primary)] px-6 py-2 text-sm text-[var(--primary-foreground)]">
            <span>
              Você está dentro de <strong>{user.workspaceName}</strong> como
              admin.
            </span>
            <form action={exitImpersonation}>
              <button
                type="submit"
                className="rounded-[var(--radius-card)] bg-white/15 px-3 py-1 font-medium hover:bg-white/25"
              >
                Sair ✕
              </button>
            </form>
          </div>
        )}
        {children}
      </div>
    </>
  );
}
