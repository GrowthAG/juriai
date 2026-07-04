"use client";

import { useRef, type ReactNode } from "react";

/**
 * Tilt sutil aplicado ao FRAME (não ao conteúdo interno).
 * - Tilt máximo ~2°, perspectiva alta para achatar o efeito.
 * - Desliga em prefers-reduced-motion e em ponteiro grosso/touch
 *   (o CSS em globals.css zera o transform; o JS nem calcula).
 */
export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    if (
      e.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 4; // -2..2 graus
    const rx = (0.5 - py) * 4;
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={`site-tilt ${className ?? ""}`}
    >
      <div className="site-tilt-inner">{children}</div>
    </div>
  );
}
