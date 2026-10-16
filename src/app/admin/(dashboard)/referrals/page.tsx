import Link from "next/link";
import { Gift } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/site/EmptyState";
import { getAllReferrals } from "@/lib/queries/referrals";
import { requireCapability } from "@/lib/permissions";
import type { Referral } from "@/lib/types";

const STATUS_LABELS: Record<Referral["status"], string> = {
  pending: "অপেক্ষমাণ",
  approved: "অনুমোদিত",
  rejected: "বাতিল",
};

const STATUS_TONE: Record<Referral["status"], "primary" | "accent" | "neutral" | "success" | "danger"> = {
  pending: "neutral",
  approved: "success",
  rejected: "danger",
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "সব" },
  { value: "pending", label: "অপেক্ষমাণ" },
  { value: "approved", label: "অনুমোদিত" },
  { value: "rejected", label: "বাতিল" },
];

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireCapability("view_customers");
  const { q, status } = await searchParams;
  const referrals = await getAllReferrals({
    search: q,
    status: status as Referral["status"] | undefined,
  });

  return (
    <div>
      <PageHeader title="রেফারেল" description="গ্রাহকদের রেফারেল ও কমিশনের সম্পূর্ণ তালিকা।" />

      <form className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="গ্রাহক, কোড বা অর্ডার নম্বর দিয়ে খুঁজুন..."
          className="h-11 min-w-[220px] flex-1 rounded-lg border border-border bg-surface px-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        {status && <input type="hidden" name="status" value={status} />}
        <button
          type="submit"
          className="h-11 rounded-lg bg-primary-500 px-5 text-sm font-medium text-white hover:bg-primary-600"
        >
          খুঁজুন
        </button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = (status ?? "") === f.value;
          const href = f.value
            ? `/admin/referrals?status=${f.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`
            : `/admin/referrals${q ? `?q=${encodeURIComponent(q)}` : ""}`;
          return (
            <Link
              key={f.value || "all"}
              href={href}
              className={
                active
                  ? "rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:border-primary-500"
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {referrals.length === 0 ? (
        <EmptyState icon={Gift} title="এখনও কোনো রেফারেল নেই।" description="গ্রাহকরা রেফারেল কোড শেয়ার করলে তা এখানে দেখা যাবে।" />
      ) : (
        <ul className="space-y-3">
          {referrals.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/customers/${r.referrerCustomerId}`}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary-500 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{r.referrerName}</p>
                    <Badge tone="neutral">{r.referralCode}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">
                    {r.referrerCustomerNumber} · অর্ডার {r.referredOrderNumber}
                    {r.referredCustomerName ? ` · ${r.referredCustomerName}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {new Date(r.createdAt).toLocaleDateString("en-BD")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <div className="text-right">
                    {r.commissionAmount != null ? (
                      <p className="font-medium text-ink">৳ {r.commissionAmount.toLocaleString("en-BD")}</p>
                    ) : (
                      <p className="text-ink-faint">—</p>
                    )}
                    {r.eligibleValue != null && r.commissionRate != null && (
                      <p className="text-xs text-ink-faint">
                        ৳{r.eligibleValue.toLocaleString("en-BD")} × {Math.round(r.commissionRate * 1000) / 10}%
                      </p>
                    )}
                  </div>
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABELS[r.status]}</Badge>
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
