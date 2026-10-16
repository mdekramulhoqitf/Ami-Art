"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";
import { OrderCtaButton } from "./OrderCtaButton";
import { cn } from "@/lib/utils";

export function Navbar({
  logoUrl,
  businessName,
}: {
  logoUrl: string | null;
  businessName: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/85 backdrop-blur transition-shadow duration-200",
        scrolled ? "border-border shadow-sm" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-3 overflow-hidden px-5 sm:h-[72px] sm:px-8 lg:px-10">
        <Logo
          logoUrl={logoUrl}
          businessName={businessName}
          className="min-w-0 shrink"
          imgClassName="h-7 sm:h-11 lg:h-14"
        />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary-700"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <OrderCtaButton size="sm" />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
