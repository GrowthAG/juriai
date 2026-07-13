"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "motion/react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { staggerContainer, staggerItem } from "./motion/variants";

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const imageY = useTransform(
    scrollY,
    [0, 500],
    [0, shouldReduceMotion ? 0 : 30],
    { clamp: false }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-[var(--border)]"
    >
      <div className="grid lg:min-h-[min(90vh,54rem)] lg:grid-cols-2">
        <div className="flex flex-col justify-center bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          <motion.div
            className="max-w-xl"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            variants={shouldReduceMotion ? {} : staggerContainer(0.08)}
          >
            {/* Eyebrow */}
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
              variants={shouldReduceMotion ? {} : staggerItem}
            >
              Dossiê inteligente · cível B2B
            </motion.p>

            {/* Headline */}
            <motion.h1
              className="mt-5 font-serif text-[2rem] font-semibold leading-[1.1] tracking-tight text-[var(--foreground)] sm:text-[2.55rem] lg:text-[2.85rem]"
              variants={shouldReduceMotion ? {} : staggerItem}
            >
              Economize até 95% do que você paga em estagiário e analista.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="mt-5 text-[1.05rem] leading-relaxed text-[var(--muted)] sm:text-lg"
              variants={shouldReduceMotion ? {} : staggerItem}
            >
              Um agente monta o mapa do caso, classifica provas e gera rascunho
              com fonte rastreada. Nunca inventa jurisprudência. Você revisa e
              aprova.
            </motion.p>

            {/* Price chips */}
            <motion.div
              className="mt-7 flex flex-wrap gap-2"
              variants={shouldReduceMotion ? {} : staggerItem}
            >
              <span className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--foreground)]">
                Gold R$&nbsp;697/mês
              </span>
              <span className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--muted)]">
                vs analista ~R$&nbsp;4.200
              </span>
              <span className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--muted)]">
                [FATO ALEGADO]
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
              variants={shouldReduceMotion ? {} : staggerItem}
            >
              <a
                href="mailto:contato@juriai.com.br?subject=Demo%20JuriAI%20com%20caso%20real"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--primary)] px-7 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
              >
                Agendar demo com caso real
              </a>
              <a
                href="#precos"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white px-7 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--background)]"
              >
                Ver planos
              </a>
            </motion.div>

            {/* Guarantee text */}
            <motion.p
              className="mt-6 max-w-md text-xs leading-relaxed text-[var(--muted)]"
              variants={shouldReduceMotion ? {} : staggerItem}
            >
              Se em 30 dias o mapa de um caso real não sair mais rápido que o
              seu processo atual, devolvemos o mês ou estendemos o onboarding.
              Não garantimos ganhar causa. Garantimos processo e tempo de
              montagem.
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          ref={imageRef}
          className="relative min-h-[18rem] sm:min-h-[22rem] lg:min-h-full"
          style={{ y: imageY }}
        >
          <Image
            src="/site/hero-human-desk.jpg"
            alt="Mesa de trabalho com documentos em luz natural, ambiente de escritório."
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-black/[0.06]"
            aria-hidden="true"
          />
          <motion.div
            className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-xs"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{
              delay: 0.4,
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            <div className="rounded-sm border border-white/20 bg-white/95 px-4 py-3 backdrop-blur-sm">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                Âncora de valor
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-snug text-[var(--foreground)]">
                Não compete com software de R$&nbsp;127. Compete com a folha.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
