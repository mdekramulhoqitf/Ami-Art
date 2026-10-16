"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { ADMIN_NAV_LINKS } from "./admin-nav-links";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  businessName,
  userEmail,
  orderUnreadCount = 0,
  onNavigate,
}: {
  businessName: string;
  userEmail: string;
  orderUnreadCount?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Logo logoUrl={null} businessName={businessName} variant="light" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV_LINKS.map((link) => {
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          const badge = link.href === "/admin/orders" ? orderUnreadCount : 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-ink shadow-sm"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              <span className="flex-1">{link.label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <p className="truncate text-sm text-white/60">{userEmail}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
            লগআউট
          </button>
        </form>
      </div>
    </div>
  );
}
