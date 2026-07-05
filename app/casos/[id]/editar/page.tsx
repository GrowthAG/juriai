import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { getCase, updateCase } from "@/app/actions/cases";

export const dynamic = "force-dynamic";

const DOMAINS: Array<[string, string]> = [
  ["CIVIL", "Cível / Contratos / B2B"],
  ["TRABALHISTA", "Trabalhista"],
  ["CONSUMIDOR", "Consumidor"],
  ["PENAL", "Penal"],
  ["FAMILIA", "Família e Sucessões"],
  ["TRIBUTARIO", "Tributário"],
];

const TYPES: Array<[string, string]> = [
  ["EXTRAJUDICIAL", "Extrajudicial"],
  ["JUDICIAL_ATIVO", "Ação (autor)"],
  ["JUDICIAL_PASSIVO", "Defesa (réu)"],
  ["CONSULTIVO", "Consultivo"],
];

const STATUSES: Array<[string, string]> = [
  ["TRIAGEM", "Triagem"],
  ["ANALISE", "Em análise"],
  ["ESTRATEGIA", "Estratégia"],
  ["REDACAO", "Redação"],
  ["CONCLUIDO", "Concluído"],
  ["ARQUIVADO", "Arquivado"],
];

const fieldClass =
  "w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]";

export default async function EditarCasoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caso = await getCase(id);
  if (!caso) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <Link
          href={`/casos/${id}`}
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Voltar ao caso
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Editar caso
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Ajuste os dados do caso. O status segue a metodologia do JuriAI.
        </p>

        <Card className="mt-6 px-5 py-5">
          <form action={updateCase.bind(null, id)} className="grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Título</span>
              <input
                name="title"
                type="text"
                required
                defaultValue={caso.title}
                className={fieldClass}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Cliente</span>
              <input
                name="clientName"
                type="text"
                defaultValue={caso.clientName ?? ""}
                placeholder="Cliente não informado"
                className={fieldClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-sm font-medium">Área</span>
                <select name="domain" defaultValue={caso.domain} className={fieldClass}>
                  {DOMAINS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium">Tipo</span>
                <select name="type" defaultValue={caso.type} className={fieldClass}>
                  {TYPES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Status</span>
              <select name="status" defaultValue={caso.status} className={fieldClass}>
                {STATUSES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-[var(--muted)]">
                Redação fica bloqueada enquanto houver lacunas pendentes.
              </span>
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Resumo</span>
              <textarea
                name="summary"
                rows={4}
                defaultValue={caso.summary ?? ""}
                placeholder="Resumo do caso (opcional)"
                className={fieldClass}
              />
            </label>

            <div className="mt-2 flex items-center gap-3">
              <Button type="submit" size="md">
                Salvar alterações
              </Button>
              <Link
                href={`/casos/${id}`}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </Card>
    </main>
  );
}
