import { headers } from "next/headers";
import { requireUser } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/queries/site";
import { getUnreadOrderCount } from "@/lib/queries/orders";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * The proxy middleware already ran `getUser()` for every request under
 * `/admin/*` and would have redirected away already if it failed — so this
 * trusts the header it set instead of paying for a second Auth round-trip
 * on every single navigation. The header is only ever set by our own
 * middleware after a real check (see lib/supabase/middleware.ts) and is
 * stripped from the incoming request there first, so it can't be spoofed
 * by a client. Falls back to a real `requireUser()` check if the header is
 * ever missing (e.g. proxy not run for some reason) rather than trusting an
 * unauthenticated request.
 */
async function getAdminUserEmail(): Promise<string> {
  const headerList = await headers();
  const trustedId = headerList.get("x-admin-user-id");
  if (trustedId) {
    return headerList.get("x-admin-user-email") || "অ্যাডমিন";
  }

  const user = await requireUser();
  return user.email ?? "অ্যাডমিন";
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userEmail, siteSettings, orderUnreadCount] = await Promise.all([
    getAdminUserEmail(),
    getSiteSettings(),
    getUnreadOrderCount(),
  ]);

  return (
    <AdminShell
      businessName={siteSettings.business_name}
      userEmail={userEmail || "অ্যাডমিন"}
      orderUnreadCount={orderUnreadCount}
    >
      {children}
    </AdminShell>
  );
}

export const dynamic = "force-dynamic";
