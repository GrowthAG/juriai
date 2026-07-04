import Link from "next/link";
import type { ReactNode } from "react";

type FooterLink = { label: string; href: string; external?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

// Links para páginas ainda não criadas apontam para rotas futuras — não quebram
// o build (o App Router resolve em runtime). Links de seção usam âncoras da
// própria Home, que já existem.
const COLUMNS: FooterColumn[] = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Segurança", href: "#seguranca" },
      { label: "Módulos", href: "#produto" },
    ],
  },
  {
    title: "Soluções",
    links: [
      { label: "Escritórios", href: "/solucoes/escritorios" },
      { label: "Departamentos jurídicos", href: "/solucoes/departamentos-juridicos" },
      { label: "Áreas jurídicas", href: "/areas" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Materiais", href: "/materiais" },
      { label: "Guias", href: "/materiais" },
      { label: "Checklists", href: "/materiais" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "/sobre" },
      { label: "Contato", href: "mailto:contato@juriai.com.br", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidade", href: "/privacidade" },
      { label: "Termos", href: "/termos" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer id="recursos" className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-6">
          {/* Marca + linha de posicionamento */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-serif text-lg font-semibold tracking-tight">
              Juri<span className="font-sans text-[var(--accent)]">AI</span>
            </span>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-[var(--muted)]">
              Legal Operating System para escritórios de advocacia.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <FooterCol key={col.title} title={col.title}>
              {col.links.map((link) => (
                <FooterItem key={link.label} link={link} />
              ))}
            </FooterCol>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
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

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--foreground)]">
        {title}
      </h3>
      <ul className="mt-4 grid gap-2.5">{children}</ul>
    </div>
  );
}

function FooterItem({ link }: { link: FooterLink }) {
  const cls =
    "text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]";
  return (
    <li>
      {link.external ? (
        <a href={link.href} className={cls}>
          {link.label}
        </a>
      ) : (
        <Link href={link.href} className={cls}>
          {link.label}
        </Link>
      )}
    </li>
  );
}
