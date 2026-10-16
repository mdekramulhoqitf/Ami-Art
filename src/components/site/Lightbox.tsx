"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PortfolioItem } from "@/lib/types";

export function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: PortfolioItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const item = items[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % items.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + items.length) % items.length);
    }
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [index, items.length, onClose, onNavigate]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-4 animate-fade-in sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="বন্ধ করুন"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="পূর্ববর্তী"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index - 1 + items.length) % items.length);
            }}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="পরবর্তী"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index + 1) % items.length);
            }}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div
        className="flex max-h-full max-w-4xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[75vh] w-full">
          <Image
            src={item.image_url}
            alt={item.alt_text || item.title}
            width={1200}
            height={900}
            className="max-h-[75vh] w-auto rounded-lg object-contain"
            sizes="90vw"
          />
        </div>
        <div className="mt-4 text-center">
          {item.category && (
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">
              {item.category}
            </p>
          )}
          <p className="mt-1 text-lg font-semibold text-white">{item.title}</p>
          {item.description && (
            <p className="mx-auto mt-1 max-w-lg text-sm text-white/70">{item.description}</p>
          )}
          <Button href="/order" size="sm" className="mt-4" onClick={(e) => e.stopPropagation()}>
            এমন কাজ করতে চাই
          </Button>
        </div>
      </div>
    </div>
  );
}
