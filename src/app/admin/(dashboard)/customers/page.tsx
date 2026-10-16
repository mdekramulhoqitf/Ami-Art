import Link from "next/link";
import { Users, Clock } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/site/EmptyState";
import { getCustomers } from "@/lib/queries/customers";
import { requireCapability } from "@/lib/permissions";
import type { LoyaltyLevel } from "@/lib/types";

const LOYALTY_LABELS: Record<LoyaltyLevel, string> = {
  new: "নতুন",
  returning: "ফিরতি",
  loyal: "নিয়মিত",
  vip: "VIP",
};

const LOYALTY_TONE: Record<LoyaltyLevel, "primary" | "accent" | "success" | "neutral"> = {
  new: "neutral",
  returning: "primary",
  loyal: "success",
  vip: "accent",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireCapability("view_customers");
  const { q } = await searchParams;
  const customers = await getCustomers({ search: q });

  return (
    <div>
      <PageHeader title="গ্রাহক" description="যারা আমাদের কাছে অর্ডার করেছেন তাদের সম্পূর্ণ তালিকা।" />

      <form className="mb-6 flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="নাম, ফোন বা কাস্টমার আইডি দিয়ে খুঁজুন..."
          className="h-11 min-w-[220px] flex-1 rounded-lg border border-border bg-surface px-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        <button
          type="submit"
          className="h-11 rounded-lg bg-primary-500 px-5 text-sm font-medium text-white hover:bg-primary-600"
        >
          খুঁজুন
        </button>
      </form>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="এখনও কোনো গ্রাহক নেই।"
          description="কেউ অর্ডার করলে তাদের প্রোফাইল এখানে স্বয়ংক্রিয়ভাবে তৈরি হবে।"
        />
      ) : (
        <ul className="space-y-3">
          {customers.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/customers/${c.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary-500 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{c.name}</p>
                    <Badge tone={LOYALTY_TONE[c.loyalty_level]}>{LOYALTY_LABELS[c.loyalty_level]}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">
                    {c.customer_number} · {c.phone}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <div className="text-right">
                    <p className="font-medium text-ink">{c.total_orders}টি অর্ডার</p>
                    {c.last_order_at && (
                      <p className="flex items-center justify-end gap-1 text-xs text-ink-faint">
                        <Clock className="h-3 w-3" />
                        {new Date(c.last_order_at).toLocaleDateString("en-BD")}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
