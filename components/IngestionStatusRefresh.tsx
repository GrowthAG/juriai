"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function IngestionStatusRefresh({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => router.refresh(), 5_000);
    return () => window.clearInterval(interval);
  }, [active, router]);

  if (!active) return null;
  return (
    <p className="px-4 py-2 text-xs text-[var(--muted)] sm:px-5">
      Atualizando o andamento automaticamente…
    </p>
  );
}
