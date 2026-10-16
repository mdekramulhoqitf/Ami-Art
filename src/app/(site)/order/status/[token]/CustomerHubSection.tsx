import Link from "next/link";
import { Building2, ArrowRight, Gift } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/lib/order-status";
import { formatDate } from "@/lib/utils";
import type { CustomerHub, CustomerRecentOrder } from "@/lib/queries/orders";

function maskPhone(phone: string) {
  if (phone.length <= 6) return phone;
  return `${phone.slice(0, 3)}${"•".repeat(phone.length - 6)}${phone.slice(-3)}`;
}

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function CustomerHubSection({
  hub,
  recentOrders,
  currentOrderNumber,
  referralEligible,
}: {
  hub: CustomerHub;
  recentOrders: CustomerRecentOrder[];
  currentOrderNumber: string;
  /** Referral/wallet sections render further down this same page — without
      this, a customer who lands here directly (not via the order-confirmation
      link, which already jumps straight to #referral) may never scroll far
      enough to discover they exist. */
  referralEligible: boolean;
}) {
  return (
    <div className="mb-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-base font-semibold text-ink">আপনার AMI ART</h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p className="text-sm text-ink-soft">
          <span className="font-medium text-ink">{hub.customerName}</span> · {hub.customerNumber}
        </p>
        {hub.businessName && (
          <Badge tone="neutral">
            <Building2 className="mr-1 inline h-3 w-3" /> {hub.businessName}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-faint">{maskPhone(hub.phone)}</p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border p-3 text-center">
          <p className="text-lg font-semibold text-ink">{hub.totalOrders}</p>
          <p className="text-xs text-ink-faint">মোট অর্ডার</p>
        </div>
        <div className="rounded-xl border border-border p-3 text-center">
          <p className="text-lg font-semibold text-ink">{hub.activeOrders}</p>
          <p className="text-xs text-ink-faint">চলমান</p>
        </div>
        <div className="rounded-xl border border-border p-3 text-center">
          <p className="text-lg font-semibold text-ink">{hub.completedOrders}</p>
          <p className="text-xs text-ink-faint">সম্পন্ন</p>
        </div>
      </div>

      {referralEligible && (
        <Link
          href="#referral"
          className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm hover:border-primary-500"
        >
          <span className="flex items-center gap-2 font-medium text-ink">
            <Gift className="h-4 w-4" /> আপনার রেফারেল ও রিওয়ার্ড আছে
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" />
        </Link>
      )}

      {recentOrders.length > 1 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">আপনার আগের অর্ডার</p>
          <ul className="space-y-2">
            {recentOrders.map((o) => (
              <li key={o.orderNumber}>
                {o.orderNumber === currentOrderNumber ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted p-3 text-sm">
                    <RecentOrderInfo order={o} />
                    <span className="shrink-0 text-xs text-ink-soft">এই পাতা</span>
                  </div>
                ) : (
                  <Link
                    href={`/order/status/${o.accessToken}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm hover:border-primary-500"
                  >
                    <RecentOrderInfo order={o} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-ink-faint">
        আপনার অর্ডার ও যোগাযোগের তথ্য AMI ART-এর কাজ পরিচালনা ও আপনাকে ভালোভাবে সেবা দেওয়ার জন্য সংরক্ষণ করা হয়।
      </p>
    </div>
  );
}

function RecentOrderInfo({ order }: { order: CustomerRecentOrder }) {
  return (
    <>
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">
          {order.orderNumber} · {order.serviceLabel}
        </p>
        <p className="text-ink-soft">{formatDate(order.createdAt)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {order.invoiceTotal != null && (
          <span className="text-ink-soft">{formatTaka(order.invoiceTotal)}</span>
        )}
        <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>
    </>
  );
}
