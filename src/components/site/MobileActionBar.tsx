"use client";

import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Fixed mobile-only call+order bar — the two actions a visitor most often
 * wants immediately available on a small screen, without hunting for the
 * header CTA or scrolling back up. Hidden on /order/* since that flow
 * already has its own bottom-anchored next/confirm buttons.
 */
export function MobileActionBar({ phone }: { phone: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/order")) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-surface p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg lg:hidden"
      role="navigation"
      aria-label="দ্রুত যোগাযোগ"
    >
      <Button
        href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
        variant="secondary"
        className="flex-1 justify-center"
      >
        <Phone className="h-4 w-4" />
        কল করুন
      </Button>
      <Button href="/order" className="flex-1 justify-center">
        অর্ডার করুন
      </Button>
    </div>
  );
}
