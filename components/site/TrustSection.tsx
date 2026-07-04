type Guardrail = {
  control: string;
  guarantee: string;
  token?: string;
  tooltip?: string;
};

const GUARDRAILS: Guardrail[] = [
  {
    control: "Fonte original",
    guarantee: "Cada extração aponta o documento e a posição de origem.",
    tooltip: "Documento ou publicação que originou a extração.",
  },
  {
    control: "Trecho citado",
    guarantee: "O texto exato que sustenta a saída fica registrado.",
    tooltip: "O texto exato citado como base da saída da IA.",
  },
  {
    control: "Nível de confiança",
    guarantee: "A IA declara a confiança de cada informação extraída.",
    tooltip: "Grau de certeza que a IA declara para cada informação.",
  },
  {
    control: "Status da sugestão",
    guarantee: "Toda saída da IA nasce como sugestão, não como verdade.",
    token: "AI_SUGGESTED",
    tooltip: "Toda saída nasce como sugestão (AI_SUGGESTED), não como verdade.",
  },
  {
    control: "Revisão humana",
    guarantee: "Nenhuma peça avança sem aprovação de um advogado.",
    token: "reviewed_by",
    tooltip: "Aprovação obrigatória de um advogado antes de gerar.",
  },
  {
    control: "Automação bloqueada",
    guarantee: "A geração final fica travada até a revisão ser concluída.",
    token: "automationBlocked",
  },
  {
    control: "Workspace isolado",
    guarantee: "Dados de cada escritório ficam separados por permissão.",
  },
  {
    control: "Auditoria",
    guarantee: "Origem, confiança e responsável ficam na trilha de auditoria.",
    token: "AuditEntry",
    tooltip: "Origem, confiança e responsável ficam na trilha consultável.",
  },
];

export function TrustSection() {
  return (
    <section id="seguranca" className="scroll-mt-16 border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Confiança e rastreabilidade
          </p>
          <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Toda saída da IA carrega origem, confiança e revisão.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
            Rastreabilidade não é um recurso à parte. É a condição para usar IA
            em trabalho jurídico. Estes guardrails são parte do produto, não uma
            promessa de marketing.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="w-[30%] px-6 py-3 font-medium text-[var(--muted)]">
                  Guardrail
                </th>
                <th className="px-6 py-3 font-medium text-[var(--muted)]">
                  O que garante
                </th>
                <th className="hidden px-6 py-3 font-medium text-[var(--muted)] lg:table-cell">
                  Registro
                </th>
              </tr>
            </thead>
            <tbody>
              {GUARDRAILS.map((g) => (
                <tr
                  key={g.control}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-6 py-4 align-top font-medium text-[var(--foreground)]">
                    {g.tooltip ? (
                      <span
                        tabIndex={0}
                        className="site-tooltip-trigger"
                        data-tooltip={g.tooltip}
                      >
                        {g.control}
                      </span>
                    ) : (
                      g.control
                    )}
                  </td>
                  <td className="px-6 py-4 align-top text-[var(--muted)]">
                    {g.guarantee}
                  </td>
                  <td className="hidden px-6 py-4 align-top lg:table-cell">
                    {g.token ? (
                      <code className="font-mono text-xs text-[var(--foreground)]">
                        {g.token}
                      </code>
                    ) : (
                      <span className="text-[var(--muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
