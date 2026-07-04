import {
  CASE_STATUS,
  CASE_TYPE_LABEL,
  EVIDENCE_STRENGTH,
} from "@/lib/case-labels";

/** Badge de status do caso, na cor do status (fundo em 10% de alpha). */
export function StatusBadge({ status }: { status: string }) {
  const s = CASE_STATUS[status] ?? { label: status, color: "#9aa1ac" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color: s.color, backgroundColor: `${s.color}1a` }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: s.color }}
      />
      {s.label}
    </span>
  );
}

/** Badge neutro do tipo do caso (contorno, sem cor forte). */
export function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">
      {CASE_TYPE_LABEL[type] ?? type}
    </span>
  );
}

/** Badge da força de uma prova. */
export function StrengthBadge({ strength }: { strength: string }) {
  const s = EVIDENCE_STRENGTH[strength] ?? {
    label: strength,
    color: "#9aa1ac",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color: s.color, backgroundColor: `${s.color}1a` }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: s.color }}
      />
      {s.label}
    </span>
  );
}
