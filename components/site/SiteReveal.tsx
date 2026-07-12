"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Reveal no scroll. Fade + 10px translateY, uma vez.
 * Respeita prefers-reduced-motion (CSS).
 */
export function SiteReveal({
 children,
 className,
 delayMs = 0,
}: {
 children: ReactNode;
 className?: string;
 delayMs?: number;
}) {
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const el = ref.current;
 if (!el) return;

 if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
 el.classList.add("is-visible");
 return;
 }

 const io = new IntersectionObserver(
 ([entry]) => {
 if (!entry?.isIntersecting) return;
 el.classList.add("is-visible");
 io.disconnect();
 },
 { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
 );
 io.observe(el);
 return () => io.disconnect();
 }, []);

 return (
 <div
 ref={ref}
 className={["site-reveal-scroll", className].filter(Boolean).join(" ")}
 style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
 >
 {children}
 </div>
 );
}
