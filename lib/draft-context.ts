// Critério único de "contexto mínimo para redigir" (client e server).
// Regra de ouro: não gerar peça sem mapa mínimo do caso. A server action
// e o copiloto usam a mesma função para não haver bypass via UI.

export type MinimumDraftContextInput = {
  conversationNotes: string[];
  evidenceCount: number;
  timelineCount: number;
  gapCount: number;
};

export function hasMinimumDraftContext({
  conversationNotes,
  evidenceCount,
  timelineCount,
  gapCount,
}: MinimumDraftContextInput): boolean {
  // Se o caso já possui provas anexadas OU fatos na linha do tempo OU lacunas mapeadas,
  // já possui base documental suficiente para a IA redigir a peça.
  if (evidenceCount > 0 || timelineCount > 0 || gapCount > 0) return true;

  // Caso não tenha documentos anexados, permite se o advogado forneceu instruções / contexto textual
  const notes = conversationNotes
    .map((note) => note.trim())
    .filter((note) => note.length > 3);
  const combinedLength = notes.join(" ").length;

  if (notes.length >= 1 || combinedLength >= 20) return true;

  return false;
}

export const INSUFFICIENT_DRAFT_CONTEXT_MESSAGE =
  "Antes de redigir, é preciso reunir contexto mínimo no caso: ao menos uma prova, fatos na linha do tempo, lacunas mapeadas, ou instruções suficientes na conversa. Analise primeiro; depois redija.";
