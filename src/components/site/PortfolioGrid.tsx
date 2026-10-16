"use client";

import { useMemo, useState } from "react";
import { PortfolioCard } from "./PortfolioCard";
import { Lightbox } from "./Lightbox";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/lib/types";
import { Images } from "lucide-react";

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean) as string[]);
    return ["সব", ...Array.from(set)];
  }, [items]);

  const [activeCategory, setActiveCategory] = useState("সব");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      activeCategory === "সব" ? items : items.filter((i) => i.category === activeCategory),
    [items, activeCategory]
  );

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Images}
        title="পোর্টফোলিও শীঘ্রই আসছে"
        description="আমরা সাম্প্রতিক প্রকল্পের ছবি গুছিয়ে তুলছি। কিছুক্ষণ পর আবার দেখুন, অথবা সরাসরি যোগাযোগ করে নমুনা দেখে নিন।"
      />
    );
  }

  return (
    <div>
      {categories.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                activeCategory === category
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-border text-ink-soft hover:border-primary-500 hover:text-primary-700"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item, i) => (
          <PortfolioCard key={item.id} item={item} onOpen={() => setLightboxIndex(i)} />
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={filtered}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
