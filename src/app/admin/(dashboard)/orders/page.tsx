import Link from "next/link";
import { Inbox, Search } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/site/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { getOrders } from "@/lib/queries/orders";
import { getAllServices } from "@/lib/queries/services";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE, ORDER_STATUSES } from "@/lib/order-status";
import { formatDateTime } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

export default async function OrdersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; service?: string }>;
}) {
  const params = await searchParams;
  const status = ORDER_STATUSES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined;

  const [orders, services] = await Promise.all([
    getOrders({ search: params.q, status, serviceId: params.service }),
    getAllServices(),
  ]);

  const hasFilters = Boolean(params.q || params.status || params.service);

  return (
    <div>
      <PageHeader title="অর্ডার ইনবক্স" description="গ্রাহকদের অর্ডার ও অনুরোধ দেখুন ও পরিচালনা করুন।" />

      <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="অর্ডার খুঁজুন... (নাম, মোবাইল বা অর্ডার নম্বর)"
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <option value="">সব স্ট্যাটাস</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          name="service"
          defaultValue={params.service ?? ""}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <option value="">সব সেবা</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          খুঁজুন
        </button>
        {hasFilters && (
          <Link href="/admin/orders" className="text-sm text-ink-soft hover:text-ink">
            ফিল্টার মুছুন
          </Link>
        )}
      </form>

      {orders.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={hasFilters ? "কোনো অর্ডার পাওয়া যায়নি" : "এখনও কোনো অর্ডার আসেনি"}
          description={
            hasFilters
              ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
              : "গ্রাহকরা /order পাতা থেকে অর্ডার করলে এখানে দেখা যাবে।"
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <ul className="divide-y divide-border">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className={`flex flex-col gap-2 px-5 py-4 hover:bg-muted sm:flex-row sm:items-center sm:justify-between ${
                    !order.is_read ? "bg-primary-50/40" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!order.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />}
                      <p className="truncate text-sm font-semibold text-ink">{order.customer_name}</p>
                      <span className="shrink-0 text-xs text-ink-faint">{order.order_number}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-soft">
                      {order.phone} · {order.service_label}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-ink-faint">{formatDateTime(order.created_at)}</span>
                    <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
