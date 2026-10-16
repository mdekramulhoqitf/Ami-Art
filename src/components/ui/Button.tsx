import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent" | "cta";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  /** Default action button — monochrome: near-black fill, white text. Used
      for ordinary saves/submits everywhere (admin + site). Not the main
      conversion CTA — see "cta" below for that one specific case. */
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md",
  /** The ONE main conversion CTA ("অর্ডার করুন") — the approved brand
      green, reserved for this single purpose so it stays meaningful and
      never dilutes into a general-purpose accent. */
  cta: "bg-cta-500 text-ink hover:bg-cta-600 shadow-sm hover:shadow-md",
  /** Secondary — monochrome outline. Hovers to a dark fill, not red — red
      hover here would compete with the danger variant's meaning. */
  secondary: "bg-surface text-ink border border-border hover:border-dark hover:bg-dark hover:text-white",
  ghost: "text-ink-soft hover:text-ink hover:bg-muted",
  danger: "bg-accent-500 text-white hover:bg-accent-600",
  /** The "RED CTA" — used sparingly, only where the brand red genuinely
      improves recognition (e.g. a key conversion moment), never as a
      general-purpose button color. */
  accent: "bg-accent-500 text-ink hover:bg-accent-600 shadow-sm hover:shadow-md",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2",
};

const base =
  "inline-flex items-center justify-center rounded-full font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
