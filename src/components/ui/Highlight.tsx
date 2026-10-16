import { cn } from "@/lib/utils";

/**
 * Wraps the first occurrence of `pick` inside `text` in the brand-red accent
 * token — the site-wide "one emphasized word per heading" pattern. Falls
 * back to plain, unhighlighted text whenever `pick` is missing or doesn't
 * appear (e.g. admin edits the underlying CMS text) so a stale highlight
 * target never crashes or garbles the heading.
 */
export function Highlight({
  text,
  pick,
  className,
}: {
  text: string;
  pick?: string;
  className?: string;
}) {
  if (!pick) return <>{text}</>;
  const index = text.indexOf(pick);
  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + pick.length);
  const after = text.slice(index + pick.length);

  return (
    <>
      {before}
      <span className={cn(className || "text-accent-600")}>{match}</span>
      {after}
    </>
  );
}
