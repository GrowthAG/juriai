import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* Primitivos de UI do JuriAI, grandes, calmos, alto contraste. */

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]",
  secondary:
    "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--background)]",
  ghost: "text-[var(--muted)] hover:text-[var(--foreground)]",
};

const buttonSizes: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
};

function classes(variant: ButtonVariant, size: ButtonSize, extra?: string) {
  return [buttonBase, buttonVariants[variant], buttonSizes[size], extra]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={classes(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <Link className={classes(variant, size, className)} {...props} />;
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
