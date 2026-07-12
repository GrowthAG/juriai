import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Produto", href: "#produto-em-acao" },
  { label: "Módulos", href: "#produto" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Preços", href: "#precos" },
  { label: "Para quem", href: "#para-quem" },
  { label: "Confiança", href: "#seguranca" },
  { label: "Entrar", href: "/login" },
  {
    label: "Contato",
    href: "mailto:contato@juriai.com.br",
    external: true,
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <span className="font-serif text-lg font-semibold tracking-tight">
              Juri<span className="font-sans text-[var(--accent)]">AI</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Trabalho bracal de equipe júnior no dossiê cível B2B: mapa,
              provas, lacunas e rascunho com rastreio. Sem inventar
              jurisprudência.
            </p>
          </div>

          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} JuriAI. Todos os direitos reservados.
          </p>
          <p className="text-xs text-[var(--muted)]">
            A IA sugere. O advogado aprova. Toda saída é rastreável.
          </p>
        </div>
      </div>
    </footer>
  );
}
