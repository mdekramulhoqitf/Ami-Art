import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Loader,
  Sparkles,
  GalleryHorizontalEnd,
  Wrench,
  Images,
  Mail,
  FileText,
  Send,
  Wallet,
  BadgeDollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getAllHeroSlides } from "@/lib/queries/hero-slides";
import { getAllServices } from "@/lib/queries/services";
import { getAllPortfolioItems } from "@/lib/queries/portfolio";
import { getUnreadMessageCount } from "@/lib/queries/messages";
import { getOrderStatusCounts, getRecentOrders, getRecentCustomerMessages } from "@/lib/queries/orders";
import { getInvoiceStats } from "@/lib/queries/invoices";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/lib/order-status";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [slides, services, portfolio, contactUnread, orderCounts, recentOrders, recentMessages, invoiceStats] =
    await Promise.all([
      getAllHeroSlides(),
      getAllServices(),
      getAllPortfolioItems(),
      getUnreadMessageCount(),
      getOrderStatusCounts(),
      getRecentOrders(5),
      getRecentCustomerMessages(5),
      getInvoiceStats(),
    ]);

  const orderStats = [
    { label: "নতুন অর্ডার", value: orderCounts.new, icon: Sparkles, href: "/admin/orders?status=new" },
    // "pending" is a computed aggregate (new + viewed + contacted, see
    // getOrderStatusCounts) — there is no single order status matching it,
    // so this one stays on the unfiltered inbox rather than linking to a
    // ?status= value that doesn't exist and would silently show everything.
    { label: "অপেক্ষমাণ", value: orderCounts.pending, icon: Clock, href: "/admin/orders" },
    { label: "কাজ চলছে", value: orderCounts.inProgress, icon: Loader, href: "/admin/orders?status=in_progress" },
    { label: "সম্পন্ন", value: orderCounts.completed, icon: CheckCircle2, href: "/admin/orders?status=completed" },
  ];

  const invoiceStatCards = [
    { label: "মোট ইনভয়েস", value: invoiceStats.total, icon: FileText },
    { label: "পাঠানো ইনভয়েস", value: invoiceStats.sent, icon: Send },
    { label: "বাকি টাকা", value: `৳ ${invoiceStats.totalDue.toLocaleString("en-BD")}`, icon: Wallet },
    {
      label: "পরিশোধিত টাকা",
      value: `৳ ${invoiceStats.totalPaid.toLocaleString("en-BD")}`,
      icon: BadgeDollarSign,
    },
  ];

  const contentStats = [
    {
      label: "হিরো ব্যানার",
      value: slides.length,
      sub: `${slides.filter((s) => s.is_active).length}টি সক্রিয়`,
      href: "/admin/slider",
      icon: GalleryHorizontalEnd,
    },
    {
      label: "আমাদের সেবা",
      value: services.length,
      sub: `${services.filter((s) => s.is_active).length}টি সক্রিয়`,
      href: "/admin/services",
      icon: Wrench,
    },
    {
      label: "আমাদের কাজ",
      value: portfolio.length,
      sub: `${portfolio.filter((p) => p.is_featured).length}টি ফিচার্ড`,
      href: "/admin/portfolio",
      icon: Images,
    },
    {
      label: "যোগাযোগ মেসেজ",
      value: contactUnread,
      sub: "অপঠিত",
      href: "/admin/contact",
      icon: Mail,
    },
  ];

  return (
    <div>
      <PageHeader title="ড্যাশবোর্ড" description="আপনার ওয়েবসাইট ও অর্ডারের সারসংক্ষেপ।" />

      <h2 className="mb-3 text-sm font-semibold text-ink">অর্ডার সারসংক্ষেপ</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {orderStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <stat.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <p className="mt-3 text-2xl font-semibold text-ink">{stat.value}</p>
            <p className="text-sm text-ink-soft">{stat.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-sm font-semibold text-ink">ইনভয়েস সারসংক্ষেপ</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {invoiceStatCards.map((stat) => (
          <Link
            key={stat.label}
            href="/admin/orders"
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <stat.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <p className="mt-3 text-2xl font-semibold text-ink">{stat.value}</p>
            <p className="text-sm text-ink-soft">{stat.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-sm font-semibold text-ink">কন্টেন্ট সারসংক্ষেপ</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contentStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary-500"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <stat.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink-faint transition-colors group-hover:text-primary-600" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-ink">{stat.value}</p>
            <p className="text-sm text-ink-soft">
              {stat.label} <span className="text-ink-faint">· {stat.sub}</span>
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-base font-semibold text-ink">সর্বশেষ অর্ডার</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
            {recentOrders.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-ink-soft">
                এখনও কোনো অর্ডার আসেনি।
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {order.customer_name}{" "}
                          {!order.is_read && (
                            <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
                          )}
                        </p>
                        <p className="truncate text-xs text-ink-soft">{order.service_label}</p>
                      </div>
                      <Badge tone={ORDER_STATUS_TONE[order.status]} className="shrink-0">
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
          >
            সব অর্ডার দেখুন
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div>
          <h2 className="text-base font-semibold text-ink">সর্বশেষ মেসেজ</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
            {recentMessages.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-ink-soft">
                গ্রাহকদের পাঠানো মেসেজ এখানে দেখা যাবে।
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {recentMessages.map((message) => (
                  <li key={message.id}>
                    <Link
                      href={`/admin/orders/${message.order_id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {message.customer_name}{" "}
                          <span className="text-ink-faint">· {message.order_number}</span>
                        </p>
                        <p className="truncate text-xs text-ink-soft">{message.message}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-faint">
                        {formatDate(message.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
