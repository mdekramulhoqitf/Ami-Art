"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioItem } from "@/lib/types";

const frameClasses =
  "group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted text-left";

function CardMedia({ item }: { item: PortfolioItem }) {
  return (
    <>
      <Image
        src={item.image_url}
        alt={item.alt_text || item.title}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/0 to-ink/0 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-0 p-5 opacity-100 transition-all duration-200 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        {item.category && (
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">
            {item.category}
          </p>
        )}
        <p className="mt-1 text-base font-semibold text-white">{item.title}</p>
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-white/80">
          কাজটি দেখুন
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </>
  );
}

export function PortfolioCard({
  item,
  onOpen,
}: {
  item: PortfolioItem;
  /** Omit when rendering a static preview (e.g. homepage) with no lightbox to open. */
  onOpen?: () => void;
}) {
  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} className={frameClasses}>
        <CardMedia item={item} />
      </button>
    );
  }

  return (
    <Link href="/portfolio" className={frameClasses}>
      <CardMedia item={item} />
    </Link>
  );
}
