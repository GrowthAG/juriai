"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "motion/react";
import { SiteReveal } from "./SiteReveal";
import { staggerContainer, staggerItem } from "./motion/variants";

type Guardrail = {
  control: string;
  guarantee: string;
};

const GUARDRAILS: Guardrail[] = [
  {
    control: "Fonte no material",
    guarantee:
      "Extrações e achados apontam para o documento ou trecho que os sustenta.",
  },
  {
    control: "Lacuna explícita",
    guarantee:
      "O que não está nos autos aparece como [FATO ALEGADO] ou gap, não como fato inventado.",
  },
  {
    control: "Sugestão, não verdade",
    guarantee:
      "Saídas de IA nascem como proposta para o advogado, nunca como decisão final.",
  },
  {
    control: "Revisão humana",
    guarantee:
      "Peça e análise avançam com o advogado no controle antes de uso externo.",
  },
  {
    control: "Isolamento por escritório",
    guarantee:
      "Dados de cada escritório ficam separados por permissão e workspace.",
  },
  {
    control: "Trilha consultável",
    guarantee:
      "Origem, confiança e responsável permanecem rastreáveis no caso.",
  },
];

export function TrustSection() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <section
      id="seguranca"
      className="scroll-mt-16 border-b border-[var(--border)] bg-[#0c0c0c] text-[#f5f5f4]"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SiteReveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a3a3a3]">
              Confiança
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Qualquer um promete agente de IA. Poucos fecham com “nunca inventa jurisprudência”.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[#a3a3a3]">
              Rastreabilidade não é slogan. É condição para usar IA em trabalho
              que o advogado assina.
            </p>
          </div>
        </SiteReveal>

        <div className="mt-14 overflow-hidden rounded-sm border border-[#2a2a2a] bg-[#141414]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="w-[32%] px-5 py-3.5 font-medium text-[#a3a3a3] sm:px-6">
                  Controle
                </th>
                <th className="px-5 py-3.5 font-medium text-[#a3a3a3] sm:px-6">
                  O que garante
                </th>
              </tr>
            </thead>
            <motion.tbody
              initial={shouldReduceMotion ? "visible" : "hidden"}
              whileInView={shouldReduceMotion ? "visible" : "visible"}
              viewport={{ once: true, margin: "-8% 0px" }}
              variants={shouldReduceMotion ? {} : staggerContainer(0.06)}
            >
              {GUARDRAILS.map((row) => (
                <motion.tr
                  key={row.control}
                  className="border-b border-[#2a2a2a] last:border-0"
                  variants={shouldReduceMotion ? {} : staggerItem}
                >
                  <td className="px-5 py-4 align-top font-medium text-white sm:px-6">
                    {row.control}
                  </td>
                  <td className="px-5 py-4 align-top text-[#a3a3a3] sm:px-6">
                    {row.guarantee}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>

        <SiteReveal delayMs={100}>
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              "LGPD",
              "Isolamento multi-tenant",
              "Revisão humana",
              "Trilha de auditoria",
              "Garantia de processo 30 dias",
            ].map((badge) => (
              <span
                key={badge}
                className="rounded border border-[#333] bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-[#d4d4d4]"
              >
                {badge}
              </span>
            ))}
          </div>
        </SiteReveal>
      </div>
    </section>
  );
}
