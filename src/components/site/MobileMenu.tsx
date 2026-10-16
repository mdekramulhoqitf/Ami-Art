"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "./nav-links";
import { OrderCtaButton } from "./OrderCtaButton";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  // createPortal needs document.body, which doesn't exist during SSR — this
  // is the effect-free way to know we're on the client post-hydration.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [topOffset, setTopOffset] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // The header uses backdrop-blur, which makes it a containing block for
    // position:fixed descendants — a fixed child positioned inside it would
    // resolve "top"/"bottom" against the header's own ~65px box instead of
    // the viewport, collapsing to near-zero height. Portalling the panel to
    // <body> avoids that; measuring the header's real bottom edge here (it
    // may sit below the separate contact strip when the page hasn't
    // scrolled yet) keeps the panel flush under it either way.
    const header = wrapperRef.current?.closest("header");
    if (header) setTopOffset(header.getBoundingClientRect().bottom);
  }, [open]);

  const menuPanel = (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 origin-top bg-white transition-all duration-200 ease-out",
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0"
      )}
      style={{ top: topOffset }}
    >
      <nav className="flex h-full flex-col gap-1 overflow-y-auto px-6 pt-6 pb-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-3 text-base font-medium",
              pathname === link.href
                ? "bg-accent-50 text-accent-700"
                : "text-ink hover:bg-muted"
            )}
          >
            {link.label}
          </Link>
        ))}
        <OrderCtaButton className="mt-4 w-full" />
      </nav>
    </div>
  );

  return (
    <div className="lg:hidden" ref={wrapperRef}>
      <button
        type="button"
        aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-muted"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mounted && createPortal(menuPanel, document.body)}
    </div>
  );
}
