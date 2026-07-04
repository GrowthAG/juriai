import Image from "next/image";
import Link from "next/link";

export function AppHeader({
  homeHref = "/",
  navHref = "/",
  navLabel = "Meus casos",
}: {
  homeHref?: string;
  navHref?: string;
  navLabel?: string;
}) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href={homeHref} className="flex items-center gap-2.5">
          <Image
            src="/brand/gavel-tile.svg"
            width={36}
            height={36}
            alt=""
            aria-hidden="true"
            unoptimized
          />
          <span className="font-serif text-lg font-semibold tracking-tight">
            Juri<span className="font-sans text-[var(--accent)]">AI</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href={navHref}
            className="rounded-lg px-3 py-2 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {navLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
