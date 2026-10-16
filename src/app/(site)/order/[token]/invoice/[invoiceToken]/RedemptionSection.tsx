"use client";

import { useState, useTransition } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { redeemReward } from "./actions";

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function RedemptionSection({
  orderToken,
  invoiceToken,
  dueAmount,
  availableBalance,
  initialRedeemedAmount,
  minRedemption,
}: {
  orderToken: string;
  invoiceToken: string;
  dueAmount: number;
  availableBalance: number;
  initialRedeemedAmount: number | null;
  minRedemption: number | null;
}) {
  const [redeemed, setRedeemed] = useState(initialRedeemedAmount);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (redeemed == null && (availableBalance <= 0 || dueAmount <= 0)) return null;

  // Below the configured minimum — the server refuses this the same way
  // (redeem_reward_by_token checks reward_rules.referral_min_redemption
  // before touching anything), this just explains it up front instead of
  // making the customer click a button that will fail.
  const belowMinimum =
    redeemed == null && minRedemption != null && availableBalance < minRedemption;

  const payable = redeemed != null ? Math.max(dueAmount - redeemed, 0) : dueAmount;
  const usable = Math.min(availableBalance, dueAmount);

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-5 print:hidden">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Gift className="h-4 w-4" /> AMI ART Reward
      </h2>

      {redeemed != null ? (
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Reward</dt>
            <dd className="font-medium text-ink">-{formatTaka(redeemed)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5">
            <dt className="font-medium text-ink">প্রদেয়</dt>
            <dd className="font-semibold text-ink">{formatTaka(payable)}</dd>
          </div>
        </dl>
      ) : (
        <>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">বকেয়া</dt>
              <dd className="font-medium text-ink">{formatTaka(dueAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Available Reward</dt>
              <dd className="font-medium text-ink">{formatTaka(availableBalance)}</dd>
            </div>
          </dl>
          {belowMinimum ? (
            <p className="mt-3 text-sm text-ink-soft">
              রিডিম করতে কমপক্ষে {formatTaka(minRedemption as number)} রিওয়ার্ড প্রয়োজন। আপনার বর্তমান ব্যালেন্স{" "}
              {formatTaka(availableBalance)} অপরিবর্তিত আছে।
            </p>
          ) : (
            <Button
              size="sm"
              className="mt-3"
              disabled={pending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await redeemReward(orderToken, invoiceToken);
                  if (result.success && result.amount != null) {
                    setRedeemed(result.amount);
                  } else {
                    setError(result.message ?? "Reward ব্যবহার করা যায়নি।");
                  }
                });
              }}
            >
              {pending ? "প্রয়োগ হচ্ছে..." : `Reward ব্যবহার করুন (সর্বোচ্চ ${formatTaka(usable)})`}
            </Button>
          )}
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </>
      )}

      <a
        href={`/order/status/${orderToken}#referral`}
        className="mt-4 inline-block text-xs font-medium text-primary-700 hover:underline"
      >
        আপনার Referral Wallet দেখুন →
      </a>
    </div>
  );
}
