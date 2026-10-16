import { createClient } from "@/lib/supabase/server";

export type RewardWallet = {
  available: number;
  pending: number;
  totalEarned: number;
  redeemed: number;
  referralCount: number;
  minRedemption: number | null;
};

const EMPTY_WALLET: RewardWallet = {
  available: 0,
  pending: 0,
  totalEarned: 0,
  redeemed: 0,
  referralCount: 0,
  minRedemption: null,
};

/** Token-gated — same identity model as every other customer-facing
    referral/reward function (the order's own access_token). Degrades to an
    empty wallet on any error, never throwing — this is enhancement data
    layered onto the order-status page, matching this codebase's convention
    that such data must never break the core page. */
export async function getRewardWalletByToken(token: string): Promise<RewardWallet> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_reward_wallet_by_token", { p_token: token });
  if (error || !data || data.length === 0) return EMPTY_WALLET;
  const row = data[0];
  return {
    available: row.out_available,
    pending: row.out_pending,
    totalEarned: row.out_total_earned,
    redeemed: row.out_redeemed,
    referralCount: row.out_referral_count,
    minRedemption: row.out_min_redemption,
  };
}

export type RewardHistoryEntry = {
  orderNumber: string;
  amount: number;
  status: "pending" | "available" | "redeemed";
  createdAt: string;
  eligibleValue: number | null;
  commissionRate: number | null;
};

export async function getRewardHistoryByToken(token: string): Promise<RewardHistoryEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_reward_history_by_token", { p_token: token });
  if (error || !data) return [];
  return data.map((row) => ({
    orderNumber: row.out_order_number,
    amount: row.out_amount,
    status: row.out_status as RewardHistoryEntry["status"],
    createdAt: row.out_created_at,
    eligibleValue: row.out_eligible_value,
    commissionRate: row.out_commission_rate,
  }));
}

/** Persisted post-redemption state for one order, read via the order's own
    token — the invoice page uses this so a redeemed amount survives reload
    without relying on client-only state. */
export async function getOrderRedemptionByToken(token: string): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_order_redemption_by_token", { p_token: token });
  if (error || !data || data.length === 0) return null;
  return data[0].out_amount;
}

/** Admin-side equivalent — admin already has full authenticated table
    access (RLS), so this reads reward_redemptions directly instead of
    going through the token-gated RPC built for the anon-facing page. */
export async function getRedemptionForOrder(orderId: string): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reward_redemptions")
    .select("amount")
    .eq("order_id", orderId)
    .eq("status", "applied")
    .maybeSingle();
  return data?.amount ?? null;
}

export type CustomerRewardSummary = {
  available: number;
  pending: number;
  totalEarned: number;
  redeemed: number;
  referralCount: number;
};

/** Admin-side equivalent of the wallet totals above — admin already has
    full authenticated table access (RLS), so this reads directly instead of
    going through the token-gated RPC built for the anon-facing page. */
export async function getRewardSummaryForCustomer(customerId: string): Promise<CustomerRewardSummary> {
  const supabase = await createClient();
  const [{ data: approved }, { data: pendingRows }, { data: redemptions }] = await Promise.all([
    supabase
      .from("referrals")
      .select("commission_amount, redeemed_amount")
      .eq("referrer_customer_id", customerId)
      .eq("status", "approved"),
    supabase
      .from("referrals")
      .select("commission_amount")
      .eq("referrer_customer_id", customerId)
      .eq("status", "pending"),
    supabase
      .from("reward_redemptions")
      .select("amount")
      .eq("customer_id", customerId)
      .eq("status", "applied"),
  ]);

  const available = (approved ?? []).reduce(
    (sum, r) => sum + ((r.commission_amount ?? 0) - r.redeemed_amount),
    0
  );
  const pending = (pendingRows ?? []).reduce((sum, r) => sum + (r.commission_amount ?? 0), 0);
  const redeemed = (redemptions ?? []).reduce((sum, r) => sum + r.amount, 0);

  return {
    available,
    pending,
    totalEarned: available + pending + redeemed,
    redeemed,
    referralCount: (approved ?? []).length,
  };
}
