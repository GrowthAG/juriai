/**
 * Fonte unica dos rotulos e cores de dominio do caso, para as telas nao
 * divergirem entre si. Cores seguem o Brutalismo Editorial (uma Action Blue,
 * mais tons sobrios de apoio; nada de paleta chamativa).
 */

export const CASE_STATUS: Record<string, { label: string; color: string }> = {
  TRIAGEM: { label: "Triagem", color: "#93b4e6" },
  ANALISE: { label: "Análise", color: "#3f76c9" },
  ESTRATEGIA: { label: "Estratégia", color: "#0041a6" },
  REDACAO: { label: "Redação", color: "#b4690e" },
  CONCLUIDO: { label: "Concluído", color: "#1f7a52" },
  ARQUIVADO: { label: "Arquivado", color: "#9aa1ac" },
};

export const CASE_STATUS_ORDER = [
  "TRIAGEM",
  "ANALISE",
  "ESTRATEGIA",
  "REDACAO",
  "CONCLUIDO",
  "ARQUIVADO",
];

export const CASE_TYPE_LABEL: Record<string, string> = {
  EXTRAJUDICIAL: "Extrajudicial",
  JUDICIAL_PASSIVO: "Defesa judicial",
  JUDICIAL_ATIVO: "Ação judicial",
  CONSULTIVO: "Consultivo",
};

export const DOMAIN_LABEL: Record<string, string> = {
  CIVIL: "Cível",
  TRABALHISTA: "Trabalhista",
  PENAL: "Penal",
  CONSUMIDOR: "Consumidor",
  TRIBUTARIO: "Tributário",
  FAMILIA: "Família",
};

export const GAP_LABEL: Record<string, string> = {
  PERGUNTA_PENDENTE: "Pergunta pendente",
  PROVA_NECESSARIA: "Prova necessária",
  RISCO: "Risco",
};

export const EVIDENCE_STRENGTH: Record<string, { label: string; color: string }> = {
  FORTE: { label: "Forte", color: "#1f7a52" },
  MEDIA: { label: "Média", color: "#b4690e" },
  FRACA: { label: "Fraca", color: "#ba1a1a" },
  NAO_AVALIADA: { label: "Não avaliada", color: "#9aa1ac" },
};

export const DRAFT_TYPE_LABEL: Record<string, string> = {
  NOTIFICACAO_EXTRAJUDICIAL: "Notificação extrajudicial",
  RESPOSTA_EXTRAJUDICIAL: "Resposta extrajudicial",
  PETICAO_INICIAL: "Petição inicial",
  CONTESTACAO: "Contestação",
  RECONVENCAO: "Reconvenção",
  ACORDO: "Acordo",
  PARECER: "Parecer",
  OUTRO: "Documento",
};

export function relativeDays(date: Date) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months === 1) return "há 1 mês";
  if (months < 12) return `há ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
}
