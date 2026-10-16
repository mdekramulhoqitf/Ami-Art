import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "neutral" | "success" | "danger";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-700",
  accent: "bg-accent-50 text-accent-700",
  neutral: "bg-muted text-ink-soft",
  success: "bg-primary-50 text-success",
  danger: "bg-accent-50 text-danger",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
