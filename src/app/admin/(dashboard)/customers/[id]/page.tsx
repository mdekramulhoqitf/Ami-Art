import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, Building2, MapPin, Gift, ShoppingBag, Sparkles, Share2, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import {
  getCustomerById,
  getCustomerOrders,
  getCustomerRewards,
  getCustomerRewardBalance,
  getCustomerTotalSpend,
  getCustomerActivity,
  deriveCustomerInsight,
  deriveRetentionOpportunity,
  type RetentionPriority,
} from "@/lib/queries/customers";
import { getBusinessById } from "@/lib/queries/businesses";
import { getFollowupsForCustomer } from "@/lib/queries/followups";
import { getReferralsByCustomer } from "@/lib/queries/referrals";
import { getRewardSummaryForCustomer } from "@/lib/queries/rewards";
import { requireCapability } from "@/lib/permissions";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/lib/order-status";
import type { LoyaltyLevel, RewardType, FollowUpReason } from "@/lib/types";
import { NoteForm } from "./NoteForm";
import { ScheduleFollowUpForm } from "@/components/admin/ScheduleFollowUpForm";
import { FollowUpInlineActions } from "@/components/admin/FollowUpInlineActions";

const FOLLOWUP_REASON_LABELS: Record<FollowUpReason, string> = {
  new_lead: "নতুন লিড",
  interested_lead: "আগ্রহী লিড",
  quotation_sent: "কোটেশন পাঠানো হয়েছে",
  quotation_pending: "কোটেশন অপেক্ষমাণ",
  negotiation: "আলোচনা চলছে",
  order_confirmation: "অর্ডার নিশ্চিতকরণ",
  production_update: "প্রোডাকশন আপডেট",
  delivery: "ডেলিভারি",
  post_order_checkin: "অর্ডার পরবর্তী খোঁজখবর",
  repeat_opportunity: "পুনরায় অর্ডারের সুযোগ",
  other: "অন্যান্য",
};

const LOYALTY_LABELS: Record<LoyaltyLevel, string> = {
  new: "নতুন",
  returning: "ফিরতি",
  loyal: "নিয়মিত",
  vip: "VIP",
};

const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  welcome: "স্বাগতম বোনাস",
  repeat: "পুনরাবৃত্তি বোনাস",
  referral: "রেফারেল বোনাস",
  milestone: "মাইলফলক বোনাস",
  campaign: "ক্যাম্পেইন বোনাস",
  redemption: "রিডিম করা হয়েছে",
};

const REFERRAL_STATUS_LABELS: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  approved: "অনুমোদিত",
  rejected: "বাতিল",
};

const REFERRAL_STATUS_TONE: Record<string, "primary" | "accent" | "neutral" | "success" | "danger"> = {
  pending: "neutral",
  approved: "success",
  rejected: "danger",
};

const PRIORITY_LABELS: Record<RetentionPriority, string> = {
  high: "উচ্চ",
  medium: "মাঝারি",
  low: "কম",
};

const PRIORITY_TONE: Record<RetentionPriority, "primary" | "neutral"> = {
  high: "primary",
  medium: "neutral",
  low: "neutral",
};

const ACTIVITY_LABELS: Record<string, string> = {
  customer_created: "প্রোফাইল তৈরি হয়েছে",
  order_placed: "অর্ডার স্থাপন করা হয়েছে",
  reward_earned: "পয়েন্ট অর্জিত হয়েছে",
  reward_redeemed: "পয়েন্ট রিডিম করা হয়েছে",
  note_added: "নোট যোগ হয়েছে",
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCapability("view_customers");
  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer) notFound();

  const [orders, rewards, balance, totalSpend, activity, followUps, referrals, rewardWallet] = await Promise.all([
    getCustomerOrders(id),
    getCustomerRewards(id),
    getCustomerRewardBalance(id),
    getCustomerTotalSpend(id),
    getCustomerActivity(id),
    getFollowupsForCustomer(id),
    getReferralsByCustomer(id),
    getRewardSummaryForCustomer(id),
  ]);
  const business = customer.business_id ? await getBusinessById(customer.business_id) : null;
  const insight = deriveCustomerInsight(orders);
  const pendingFollowUps = followUps.filter((f) => f.status === "pending");
  const opportunity = deriveRetentionOpportunity(
    orders,
    pendingFollowUps.map((f) => f.id)
  );
  const existingOpportunityFollowUp = opportunity?.existingFollowUpId
    ? pendingFollowUps.find((f) => f.id === opportunity.existingFollowUpId)
    : null;

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={`${customer.customer_number} · ${LOYALTY_LABELS[customer.loyalty_level]}`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">
          <Phone className="mr-1 inline h-3 w-3" /> {customer.phone}
        </Badge>
        {business && (
          <Link href={`/admin/businesses/${business.id}`}>
            <Badge tone="primary">
              <Building2 className="mr-1 inline h-3 w-3" /> {business.name}
            </Badge>
          </Link>
        )}
        {customer.area && (
          <Badge tone="neutral">
            <MapPin className="mr-1 inline h-3 w-3" /> {customer.area}
          </Badge>
        )}
        {customer.referral_code && (
          <Badge tone="primary">
            <Share2 className="mr-1 inline h-3 w-3" /> {customer.referral_code}
          </Badge>
        )}
        {insight.repeatOpportunity && (
          <Badge tone={insight.repeatOpportunity.tone}>{insight.repeatOpportunity.label}</Badge>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-2xl font-semibold text-ink">{customer.total_orders}</p>
          <p className="text-xs text-ink-soft">মোট অর্ডার</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-2xl font-semibold text-ink">৳ {totalSpend.toLocaleString("en-BD")}</p>
          <p className="text-xs text-ink-soft">মোট ব্যয়</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="flex items-center gap-1 text-2xl font-semibold text-primary-700">
            <Gift className="h-5 w-5" /> {balance}
          </p>
          <p className="text-xs text-ink-soft">AMI Points</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-2xl font-semibold text-ink">
            {insight.daysSinceLastOrder != null ? `${insight.daysSinceLastOrder} দিন` : "—"}
          </p>
          <p className="text-xs text-ink-soft">শেষ অর্ডার</p>
        </div>
      </div>

      {(insight.topService || insight.suggestedNextService) && (
        <div className="mb-6 rounded-2xl border border-primary-200 bg-primary-50/60 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Sparkles className="h-4 w-4 text-primary-600" /> প্রাপ্ত ইনসাইট (পূর্ববর্তী অর্ডারের ভিত্তিতে)
          </p>
          {insight.topService && (
            <p className="mt-1.5 text-sm text-ink-soft">
              এই গ্রাহক আগে {insight.topService.count} বার &quot;{insight.topService.label}&quot; অর্ডার করেছেন।
            </p>
          )}
          {insight.suggestedNextService && (
            <p className="mt-1 text-sm text-ink-soft">
              সম্ভাব্য পরবর্তী প্রয়োজন: {insight.suggestedNextService}
            </p>
          )}
          <p className="mt-2 text-xs text-ink-soft">শুধুমাত্র পূর্ববর্তী অর্ডারের ভিত্তিতে প্রস্তাবিত — AI পূর্বাভাস নয়।</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {opportunity && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Lightbulb className="h-4 w-4" /> সম্ভাব্য সুযোগ
                </h2>
                <Badge tone={PRIORITY_TONE[opportunity.priority]}>{PRIORITY_LABELS[opportunity.priority]}</Badge>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-ink-faint">শেষ অর্ডার</dt>
                  <dd className="font-medium text-ink">
                    {opportunity.lastCompletedService} — {opportunity.daysSinceLastCompleted} দিন আগে
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-faint">কেন দেখাচ্ছে</dt>
                  <dd className="text-ink-soft">{opportunity.reason}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-faint">পরবর্তী পদক্ষেপ</dt>
                  <dd className="text-ink-soft">{opportunity.suggestedAction}</dd>
                </div>
              </dl>

              <div className="mt-4">
                {existingOpportunityFollowUp ? (
                  <p className="text-xs font-medium text-ink-faint">
                    ফলো-আপ ইতিমধ্যে নির্ধারিত —{" "}
                    {new Date(existingOpportunityFollowUp.scheduled_at).toLocaleDateString("en-BD")}
                  </p>
                ) : (
                  <ScheduleFollowUpForm
                    customerId={id}
                    defaultReason="repeat_opportunity"
                    defaultNotes={opportunity.reason}
                    triggerLabel="ফলো-আপ তৈরি করুন"
                  />
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink">ফলো-আপ</h2>
              <ScheduleFollowUpForm customerId={id} />
            </div>
            {pendingFollowUps.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {pendingFollowUps.map((f) => (
                  <li key={f.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium text-ink">{FOLLOWUP_REASON_LABELS[f.reason]}</p>
                    <p className="text-ink-faint">
                      {new Date(f.scheduled_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    {f.notes && <p className="mt-1.5 whitespace-pre-wrap text-ink-soft">{f.notes}</p>}
                    <FollowUpInlineActions followUpId={f.id} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-faint">কোনো নির্ধারিত ফলো-আপ নেই।</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <ShoppingBag className="h-4 w-4" /> অর্ডার ইতিহাস
            </h2>
            {orders.length === 0 ? (
              <p className="text-sm text-ink-faint">এখনও কোনো অর্ডার নেই।</p>
            ) : (
              <ul className="space-y-2">
                {orders.map((o) => (
                  <li key={o.id} className="rounded-lg border border-border p-3 text-sm hover:border-primary-500">
                    <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink">{o.order_number}</p>
                        <p className="text-ink-faint">{o.service_label}</p>
                      </div>
                      <Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                    </Link>
                    <Link
                      href={`/order?reorder=${o.access_token}`}
                      target="_blank"
                      className="mt-1.5 inline-block text-xs font-medium text-primary-700 hover:underline"
                    >
                      আবার অর্ডার করুন →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Gift className="h-4 w-4" /> রিওয়ার্ড ইতিহাস
            </h2>
            {rewards.length === 0 ? (
              <p className="text-sm text-ink-faint">এখনও কোনো রিওয়ার্ড নেই।</p>
            ) : (
              <ul className="space-y-2">
                {rewards.map((r) => (
                  <li key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{REWARD_TYPE_LABELS[r.type]}</p>
                      {r.reason && <p className="text-ink-faint">{r.reason}</p>}
                      <p className="mt-0.5 text-xs text-ink-faint">
                        {new Date(r.created_at).toLocaleDateString("en-BD")}
                      </p>
                    </div>
                    <span className={r.points >= 0 ? "font-semibold text-primary-700" : "font-semibold text-danger"}>
                      {r.points >= 0 ? "+" : ""}
                      {r.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {referrals.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Share2 className="h-4 w-4" /> রেফারেল ও Reward
              </h2>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border p-3">
                  <p className="text-base font-semibold text-ink">৳ {rewardWallet.available.toLocaleString("en-BD")}</p>
                  <p className="text-xs text-ink-faint">Available</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="text-base font-semibold text-ink">৳ {rewardWallet.pending.toLocaleString("en-BD")}</p>
                  <p className="text-xs text-ink-faint">Pending</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="text-base font-semibold text-ink">৳ {rewardWallet.totalEarned.toLocaleString("en-BD")}</p>
                  <p className="text-xs text-ink-faint">Total Earned</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="text-base font-semibold text-ink">৳ {rewardWallet.redeemed.toLocaleString("en-BD")}</p>
                  <p className="text-xs text-ink-faint">Redeemed</p>
                </div>
              </div>
              <p className="mb-3 text-xs text-ink-faint">সফল রেফারেল: {rewardWallet.referralCount}টি</p>
              <ul className="space-y-2">
                {referrals.map((r) => (
                  <li key={r.order_id}>
                    <Link
                      href={`/admin/orders/${r.order_id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm hover:border-primary-500"
                    >
                      <div>
                        <p className="font-medium text-ink">{r.order_number}</p>
                        <p className="text-ink-faint">{new Date(r.created_at).toLocaleDateString("en-BD")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.commission_amount != null && (
                          <span className="text-ink-soft">৳ {r.commission_amount.toLocaleString("en-BD")}</span>
                        )}
                        <Badge tone={REFERRAL_STATUS_TONE[r.status]}>{REFERRAL_STATUS_LABELS[r.status]}</Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-ink">কার্যক্রম / টাইমলাইন</h2>
          <div className="mt-3">
            <NoteForm customerId={id} />
          </div>
          {activity.length === 0 ? (
            <p className="mt-4 text-sm text-ink-faint">এখনও কোনো কার্যক্রম নেই।</p>
          ) : (
            <ul className="mt-4 space-y-3 border-t border-border pt-4">
              {activity.map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="font-medium text-ink">{ACTIVITY_LABELS[a.type] ?? a.type}</p>
                  {a.body && <p className="text-ink-soft">{a.body}</p>}
                  <p className="mt-0.5 text-xs text-ink-faint">{new Date(a.occurred_at).toLocaleString("en-BD")}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
