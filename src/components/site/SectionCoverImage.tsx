import Image from "next/image";
import { cn } from "@/lib/utils";
import type { SectionBanner } from "@/lib/types";

const POSITION_CLASS: Record<string, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
};

/**
 * Optional, admin-managed cover image for a page-header section. Renders
 * nothing when the section has no banner configured, is hidden, or has no
 * image — the page's existing default header design is the fallback, not a
 * placeholder. Sits in normal document flow ABOVE the heading/content that
 * follows it, so it never overlaps text.
 */
export function SectionCoverImage({ banner }: { banner: SectionBanner | null }) {
  if (!banner || !banner.image_url) return null;

  return (
    <div className="relative mb-10 aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border bg-muted sm:aspect-[3/1]">
      <Image
        src={banner.image_url}
        alt={banner.alt_text || banner.title || ""}
        fill
        sizes="(min-width: 1024px) 1200px, 100vw"
        className={cn("object-cover", POSITION_CLASS[banner.image_position] ?? "object-center")}
        priority
      />
      {banner.overlay_enabled && (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0",
            banner.overlay_style === "light" ? "bg-white/30" : "bg-ink/35"
          )}
        />
      )}
    </div>
  );
}
