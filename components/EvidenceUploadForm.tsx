"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui";

export function EvidenceUploadForm({ caseId }: { caseId: string }) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("Nenhum arquivo selecionado");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : "Nenhum arquivo selecionado");
  };

  return (
    <form
      action={`/api/cases/${caseId}/evidence`}
      method="post"
      encType="multipart/form-data"
      className="mt-4 grid gap-3"
    >
      <div className="flex gap-3">
        <input
          name="file"
          type="file"
          required
          className="hidden"
          ref={inputFileRef}
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => inputFileRef.current?.click()}
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--primary)] transition-colors hover:border-[var(--primary-hover)] hover:bg-[var(--background)]"
        >
          Escolher arquivo
        </button>
        <div className="flex h-10 flex-1 items-center truncate rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--muted)]">
          {fileName}
        </div>
      </div>
      <input
        name="label"
        type="text"
        required
        placeholder="Título da prova"
        className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm outline-none focus:border-[var(--primary)]"
      />
      <textarea
        name="description"
        rows={3}
        placeholder="Descrição opcional"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm outline-none focus:border-[var(--primary)]"
      />
      <div className="flex justify-end">
        <Button type="submit" size="md">
          Salvar Prova
        </Button>
      </div>
    </form>
  );
}
