"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { OrderRealtimeNotifier } from "./OrderRealtimeNotifier";
import { Logo } from "@/components/site/Logo";

export function AdminShell({
  businessName,
  userEmail,
  orderUnreadCount,
  children,
}: {
  businessName: string;
  userEmail: string;
  orderUnreadCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="min-h-screen bg-muted lg:flex">
      <OrderRealtimeNotifier />

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-dark print:hidden lg:block">
        <div className="sticky top-0 h-screen">
          <AdminSidebar
            businessName={businessName}
            userEmail={userEmail}
            orderUnreadCount={orderUnreadCount}
          />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface px-4 print:hidden lg:hidden">
        <Logo logoUrl={null} businessName={businessName} />
        <button
          type="button"
          aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-muted"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-dark shadow-lg">
            <AdminSidebar
              businessName={businessName}
              userEmail={userEmail}
              orderUnreadCount={orderUnreadCount}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
