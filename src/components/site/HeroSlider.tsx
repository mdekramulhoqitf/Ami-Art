"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/types";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 5000;

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (i: number) => setIndex((i + slides.length) % slides.length),
    [slides.length]
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta > 0) {
        prev();
      } else {
        next();
      }
    }
    touchStartX.current = null;
    setPaused(false);
  };

  const slide = slides[index];

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          aria-hidden={i !== index}
        >
          {/* Two art-directed images per slide, toggled by viewport — not
              a crop of the same image. Falls back to the desktop image on
              mobile until a dedicated mobile banner is uploaded. */}
          <Image
            src={s.mobile_image_url || s.image_url}
            alt={s.alt_text || s.title || "Ami Art"}
            fill
            priority={i === 0}
            sizes="(max-width: 639px) 100vw, 0px"
            className="object-cover sm:hidden"
          />
          <Image
            src={s.image_url}
            alt={s.alt_text || s.title || "Ami Art"}
            fill
            priority={i === 0}
            sizes="(min-width: 640px) 100vw, 0px"
            className="hidden object-cover sm:block"
          />
        </div>
      ))}

      {slide.cta_label && slide.cta_url && (
        <div className="absolute bottom-20 right-4 z-10 sm:right-6 lg:bottom-8 lg:right-10">
          <Link
            href={slide.cta_url}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-ink shadow-md transition-colors hover:bg-primary-50"
          >
            {slide.cta_label}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="পূর্ববর্তী স্লাইড"
            onClick={prev}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 sm:left-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="পরবর্তী স্লাইড"
            onClick={next}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 sm:right-4"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`স্লাইড ${i + 1} এ যান`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
