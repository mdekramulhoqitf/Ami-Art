"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/types";

const DEFAULT_VISIBLE_COUNT = 8;

export function FaqSection({
  items,
  visibleCount = DEFAULT_VISIBLE_COUNT,
}: {
  items: FaqItem[];
  /** The homepage teaser caps at 8 with a "show more" toggle. A dedicated
      FAQ page passes Infinity so every real question is shown up front —
      there's nothing to "load more" of once the whole list is the page. */
  visibleCount?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  if (items.length === 0) return null;

  const visible = showAll ? items : items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {visible.map((item) => (
          <details key={item.id} className="group px-5 sm:px-6">
            {/* py-4 on the summary itself (not just the wrapping <details>)
                keeps the actual tappable row at a comfortable ~52px on
                mobile — padding on the parent alone doesn't grow the
                clickable area of <summary>. */}
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown className="h-4.5 w-4.5 shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-180 group-open:text-primary-600" />
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-ink-soft">{item.answer}</p>
          </details>
        ))}
      </div>

      {hasMore && !showAll && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-primary-500 hover:text-primary-700"
          >
            আরও প্রশ্ন দেখুন
          </button>
        </div>
      )}
    </div>
  );
}
