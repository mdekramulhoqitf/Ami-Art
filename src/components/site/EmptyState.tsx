import type { LucideIcon } from "lucide-react";
import { ImageOff } from "lucide-react";

export function EmptyState({
  icon: Icon = ImageOff,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-faint shadow-sm">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-ink-soft">{description}</p>
      )}
    </div>
  );
}
