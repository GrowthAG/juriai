"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui";
import {
  EVIDENCE_FILE_ACCEPT,
  MAX_EVIDENCE_UPLOAD_BYTES,
} from "@/lib/evidence-files";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenceUploadForm({ caseId }: { caseId: string }) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected && selected.size > MAX_EVIDENCE_UPLOAD_BYTES) {
      event.target.value = "";
      setFile(null);
      setError("O arquivo excede o limite de 20 MB.");
      return;
    }
    setError(null);
    setFile(selected ? { name: selected.name, size: selected.size } : null);
  };

  const handleRemove = () => {
    if (inputFileRef.current) inputFileRef.current.value = "";
    setFile(null);
    setError(null);
  };

  return (
    <form
      action={`/api/cases/${caseId}/evidence`}
      method="post"
      encType="multipart/form-data"
      className="grid gap-3"
    >
      <input
        name="file"
        type="file"
        accept={EVIDENCE_FILE_ACCEPT}
        required
        className="hidden"
        ref={inputFileRef}
        onChange={handleFileChange}
      />

      {/* Estado: arquivo selecionado, ainda não salvo — visualmente distinto
         do dropzone vazio, sem se confundir com uma prova já salva na lista
         acima (que usa StrengthBadge, não este card). */}
      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--primary)] bg-[var(--surface)] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">
              {file.name}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {formatFileSize(file.size)} · pronto para salvar
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 rounded px-2 py-1 text-xs font-medium text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--danger,#b91c1c)]"
          >
            Remover
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputFileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-6 text-center transition-colors hover:border-[var(--primary)]"
        >
          <span className="text-sm font-semibold text-[var(--foreground)]">
            Clique para escolher um arquivo
          </span>
          <span className="text-xs text-[var(--muted)]">
            PDF, JPG, PNG, WEBP, TXT ou Markdown · até 20 MB
          </span>
        </button>
      )}

      {error && (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      <input
        name="label"
        type="text"
        required
        maxLength={160}
        placeholder="Título da prova"
        className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm outline-none focus:border-[var(--primary)]"
      />
      <textarea
        name="description"
        rows={3}
        maxLength={2000}
        placeholder="Descrição opcional"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm outline-none focus:border-[var(--primary)]"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="md"
          variant="ghost"
          disabled={!file}
          className="px-4"
        >
          Salvar Prova
        </Button>
      </div>
    </form>
  );
}
