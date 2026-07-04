"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui";
import type { TribunalGroup } from "@/lib/tribunais";
import { attachDatajudProcess } from "@/app/actions/cases";

export function VincularProcessoForm({
  caseId,
  tribunalGroups,
}: {
  caseId: string;
  tribunalGroups: TribunalGroup[];
}) {
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    if (!search) {
      return tribunalGroups;
    }
    const lowerSearch = search.toLowerCase();
    return tribunalGroups
      .map((group) => {
        const filteredTribunais = group.tribunais.filter(
          (t) =>
            t.sigla.toLowerCase().includes(lowerSearch) ||
            t.nome.toLowerCase().includes(lowerSearch)
        );
        return { ...group, tribunais: filteredTribunais };
      })
      .filter((group) => group.tribunais.length > 0);
  }, [search, tribunalGroups]);

  return (
    <form
      action={attachDatajudProcess.bind(null, caseId)}
      className="mt-5 grid gap-3"
    >
      <input
        type="text"
        placeholder="Pesquisar tribunal por nome ou sigla..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm outline-none focus:border-[var(--primary)]"
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <select
          name="tribunal"
          required
          defaultValue=""
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm outline-none focus:border-[var(--primary)]"
        >
          <option value="" disabled>
            Selecione o tribunal
          </option>
          {filteredGroups.length === 0 ? (
            <option value="" disabled>
              Nenhum tribunal encontrado
            </option>
          ) : (
            filteredGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.tribunais.map((t) => (
                  <option key={t.sigla} value={t.sigla}>
                    {t.sigla} · {t.nome}
                  </option>
                ))}
              </optgroup>
            ))
          )}
        </select>
        <input
          name="numeroProcesso"
          type="text"
          required
          placeholder="Nº do processo (formato CNJ)"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
        />
        <Button type="submit" size="md">
          Consultar
        </Button>
      </div>
    </form>
  );
}
