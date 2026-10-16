import { Gift } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { RewardWallet, RewardHistoryEntry } from "@/lib/queries/rewards";

const HISTORY_STATUS_LABELS: Record<RewardHistoryEntry["status"], string> = {
  pending: "অপেক্ষমাণ",
  available: "ব্যবহারযোগ্য",
  redeemed: "ব্যবহৃত হয়েছে",
};

// Only the three statuses that actually ever reach this list are explained
// here — "rejected" referrals are deliberately excluded from this history
// query already (self-referral/cancelled-order noise a customer shouldn't
// see), so there is no copy for a status that never appears.
const HISTORY_STATUS_EXPLANATIONS: Record<RewardHistoryEntry["status"], string> = {
  pending: "অর্ডারটি সম্পূর্ণ যাচাই হলে এই রিওয়ার্ড ব্যবহারযোগ্য হবে।",
  available: "এই রিওয়ার্ড এখন ব্যবহার করা যাবে।",
  redeemed: "এই রিওয়ার্ড ইতিমধ্যে ব্যবহার করা হয়েছে।",
};

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-BD");
}

export function WalletSection({
  eligible,
  wallet,
  history,
  redeemableOrderToken,
  redeemableInvoiceToken,
}: {
  eligible: boolean;
  wallet: RewardWallet;
  history: RewardHistoryEntry[];
  /** The current order's own invoice, when it has a real due balance —
      lets the CTA below point at the existing, authoritative redemption
      flow (RedemptionSection on that invoice page) instead of inventing a
      second one. Absent when this order has no invoice with anything due. */
  redeemableOrderToken?: string | null;
  redeemableInvoiceToken?: string | null;
}) {
  if (!eligible) return null;

  const canRedeem = wallet.minRedemption != null && wallet.available >= wallet.minRedemption;
  const shortfall = wallet.minRedemption != null ? Math.max(wallet.minRedemption - wallet.available, 0) : 0;

  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="flex items-center gap-1.5 text-base font-semibold text-ink">
        <Gift className="h-4.5 w-4.5" /> আপনার AMI ART রিওয়ার্ড
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        আপনার মাধ্যমে আসা সফল অর্ডার থেকে রিওয়ার্ড জমছে।
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border p-3">
          <p className="text-lg font-semibold text-ink">{formatTaka(wallet.totalEarned)}</p>
          <p className="text-xs text-ink-faint">মোট রিওয়ার্ড</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-lg font-semibold text-ink">{formatTaka(wallet.pending)}</p>
          <p className="text-xs text-ink-faint">অপেক্ষমাণ</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-lg font-semibold text-ink">{formatTaka(wallet.available)}</p>
          <p className="text-xs text-ink-faint">রিডিম করার জন্য উপলব্ধ</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-lg font-semibold text-ink">{formatTaka(wallet.redeemed)}</p>
          <p className="text-xs text-ink-faint">ইতিমধ্যে রিডিম</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-faint">
        মোট রেফারেল: {history.length}টি · সফল রেফারেল: {wallet.referralCount}টি
      </p>

      {wallet.minRedemption != null && (
        <div className="mt-3">
          {canRedeem ? (
            <>
              <p className="text-sm font-medium text-ink">আপনার রিওয়ার্ড এখন রিডিম করা যাবে।</p>
              {redeemableOrderToken && redeemableInvoiceToken && (
                <Button
                  href={`/order/${redeemableOrderToken}/invoice/${redeemableInvoiceToken}`}
                  size="sm"
                  className="mt-2"
                >
                  রিওয়ার্ড রিডিম করুন
                </Button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-ink">
                রিডিম করতে কমপক্ষে {formatTaka(wallet.minRedemption)} রিওয়ার্ড প্রয়োজন।
              </p>
              <p className="mt-1 text-sm text-ink-soft">আর {formatTaka(shortfall)} হলে রিডিম করতে পারবেন।</p>
            </>
          )}
        </div>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">রিওয়ার্ড হিস্টোরি</p>
        {history.length > 0 ? (
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={i} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">রেফারেল</p>
                    <p className="text-ink-faint">
                      অর্ডার: {h.orderNumber} · {formatDate(h.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-ink">{formatTaka(h.amount)}</p>
                    {h.eligibleValue != null && h.commissionRate != null && (
                      <p className="text-xs text-ink-faint">
                        {formatTaka(h.eligibleValue)} × {Math.round(h.commissionRate * 1000) / 10}%
                      </p>
                    )}
                    <p className="text-xs text-ink-faint">{HISTORY_STATUS_LABELS[h.status]}</p>
                  </div>
                </div>
                <p className="mt-1.5 border-t border-border pt-1.5 text-xs text-ink-faint">
                  {HISTORY_STATUS_EXPLANATIONS[h.status]}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p className="text-sm font-medium text-ink">এখনও কোনো রেফারেল নেই।</p>
            <p className="mt-1 text-sm text-ink-soft">
              আপনার রেফারেল লিংকটি পরিচিতদের সঙ্গে শেয়ার করলে এখানে ফলাফল দেখা যাবে।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
