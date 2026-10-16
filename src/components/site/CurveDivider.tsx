import { cn } from "@/lib/utils";

/**
 * A static, tasteful curve between two section backgrounds — the shape is
 * filled with the color of the section BELOW it (so that section appears to
 * "rise" out of the curve), with a thin red accent line traced along the
 * top edge. No animation, no JS — pure SVG, matches the reference's
 * "white section → subtle curved red line → green section" rhythm.
 */
export function CurveDivider({
  fillClassName = "fill-primary-50",
  strokeClassName = "stroke-accent-500",
  className,
}: {
  /** Tailwind fill-* class matching the section that follows this divider. */
  fillClassName?: string;
  /** Tailwind stroke-* class for the thin accent line traced along the curve. */
  strokeClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative h-10 w-full overflow-hidden sm:h-16", className)} aria-hidden="true">
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M0 40 C 320 0, 1120 0, 1440 40 L1440 64 L0 64 Z"
          className={fillClassName}
        />
        <path
          d="M0 40 C 320 0, 1120 0, 1440 40"
          fill="none"
          className={cn(strokeClassName, "opacity-40")}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
