import { cn } from "@/lib/utils";
import { Highlight } from "./Highlight";

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "left",
  divider = true,
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  /** The single word/short phrase within `title` to render in brand red —
      the site's one-emphasis-per-heading rule. Omit for headings that
      shouldn't be split (e.g. a person's name). */
  highlight?: string;
  description?: string;
  align?: "left" | "center";
  /** Small green line + red dot under the eyebrow — the section-heading
      "signature" shared across the site. Default on; turn off for compact
      inline headings that don't need the full treatment. */
  divider?: boolean;
  /** "dark" for use on soft-ash/deep-ash section backgrounds — swaps the
      title/description/eyebrow to light-on-dark colors. */
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-sm font-semibold uppercase tracking-wider",
            tone === "dark" ? "text-primary-200" : "text-primary-600"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-3xl font-semibold tracking-tight sm:text-4xl",
          tone === "dark" ? "text-white" : "text-ink"
        )}
      >
        <Highlight text={title} pick={highlight} className={tone === "dark" ? "text-accent-300" : undefined} />
      </h2>
      {divider && (
        <div className={cn("mt-4 flex items-center gap-1.5", align === "center" && "justify-center")}>
          <span className="h-[3px] w-12 rounded-full bg-primary-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
        </div>
      )}
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-white/70" : "text-ink-soft"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
