import Image from "next/image";
import type { ReactNode } from "react";

type ProductMockupProps = {
  src?: string;
  alt: string;
  title?: string;
  priority?: boolean;
  className?: string;
  aspectClassName?: string;
  sizes?: string;
  badge?: ReactNode;
  /** UI desenhada (wireframe) em vez de screenshot cru */
  variant?: "image" | "wizard-clean";
};

/**
 * Mockup limpo: uma moldura. Variante wizard-clean evita print com sidebar admin.
 */
export function ProductMockup({
  src,
  alt,
  title,
  priority = false,
  className,
  aspectClassName = "aspect-[16/10]",
  sizes = "(min-width: 1024px) 40rem, 100vw",
  badge,
  variant = "image",
}: ProductMockupProps) {
  return (
    <div className={["site-mock", className].filter(Boolean).join(" ")}>
      <div className="site-mock__bar">
        <span className="site-mock__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {title ? (
          <span className="site-mock__title">{title}</span>
        ) : (
          <span className="site-mock__title site-mock__title--spacer" />
        )}
      </div>
      <div className={["site-mock__viewport", aspectClassName].join(" ")}>
        {variant === "wizard-clean" ? (
          <WizardCleanUi />
        ) : src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover object-top"
          />
        ) : null}
        {badge ? <div className="site-mock__badge">{badge}</div> : null}
      </div>
    </div>
  );
}

const AREAS = [
  "Cível / Contratos / B2B",
  "Trabalhista",
  "Consumidor",
  "Penal",
  "Família e Sucessões",
  "Tributário",
];

function WizardCleanUi() {
  return (
    <div className="absolute inset-0 flex items-start justify-center overflow-auto bg-[var(--background)] px-5 py-8 sm:px-8 sm:py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex gap-1" aria-hidden="true">
          <span className="h-0.5 flex-1 rounded-full bg-[var(--primary)]" />
          <span className="h-0.5 flex-1 rounded-full bg-[var(--border)]" />
          <span className="h-0.5 flex-1 rounded-full bg-[var(--border)]" />
          <span className="h-0.5 flex-1 rounded-full bg-[var(--border)]" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
          Qual a área desse caso?
        </h3>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Escolha a área do direito que mais se aplica.
        </p>
        <ul className="mt-5 grid gap-2">
          {AREAS.map((area, i) => (
            <li
              key={area}
              className={[
                "rounded-lg border bg-[var(--surface)] px-3.5 py-3 text-sm font-medium",
                i === 0
                  ? "border-[var(--primary)]"
                  : "border-[var(--border)]",
              ].join(" ")}
            >
              {area}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
