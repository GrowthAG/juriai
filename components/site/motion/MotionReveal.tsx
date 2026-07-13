"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { staggerContainer } from "./variants";

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  staggerChildren?: number;
  variant?: "fadeUp" | "slideIn" | "scaleIn";
}

/**
 * Motion-powered scroll reveal — replaces SiteReveal.tsx for orchestrated,
 * staggered section reveals. Respects prefers-reduced-motion.
 *
 * Usage:
 *   <MotionReveal staggerChildren={0.08}>
 *     <h2>Title</h2>
 *     <p>Subtitle</p>
 *     <button>CTA</button>
 *   </MotionReveal>
 *
 * Each direct child animates in sequence via staggerChildren.
 */
export function MotionReveal({
  children,
  className,
  delayMs = 0,
  staggerChildren = 0.08,
}: MotionRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      whileInView={shouldReduceMotion ? "visible" : "visible"}
      viewport={{ once: true, margin: "-8% 0px" }}
      variants={shouldReduceMotion ? {} : staggerContainer(staggerChildren)}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </motion.div>
  );
}
