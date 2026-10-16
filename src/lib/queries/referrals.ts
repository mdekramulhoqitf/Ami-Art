import { createClient } from "@/lib/supabase/server";
import type { Referral } from "@/lib/types";

export type ReferralInfo = {
  eligible: boolean;
  referralCode: string | null;
  commissionRate: number | null;
};

/** Token-gated — the public order-status page has no customer login, so
    identity is proven via the order's own access_token, same as
    get_order_by_token. Degrades to "not eligible" on any error rather than
    throwing, matching this codebase's convention that enhancement data must
    never break the core page. */
export async function getReferralInfoByToken(token: string): Promise<ReferralInfo> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_referral_info_by_token", { p_token: token });
  if (error || !data || data.length === 0) {
    return { eligible: false, referralCode: null, commissionRate: null };
  }
  const row = data[0];
  return {
    eligible: row.out_eligible,
    referralCode: row.out_referral_code,
    commissionRate: row.out_commission_rate,
  };
}

export type ReferralWithReferrer = Referral & {
  referrer_name: string | null;
  referrer_customer_number: string | null;
};

// referrals has two FKs into customers (referrer + referred), so the
// embed must be disambiguated with !referrals_referrer_customer_id_fkey —
// the plain `customers(name)` shorthand used elsewhere (follow_ups) only
// works when a table has a single FK to the target.
export async function getReferralForOrder(orderId: string): Promise<ReferralWithReferrer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("referrals")
    .select("*, customers!referrals_referrer_customer_id_fkey(name, customer_number)")
    .eq("referred_order_id", orderId)
    .maybeSingle();
  if (error || !data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  const { customers: referrer, ...referral } = row;
  return {
    ...(referral as Referral),
    referrer_name: referrer?.name ?? null,
    referrer_customer_number: referrer?.customer_number ?? null,
  };
}

export type AdminReferralRow = {
  id: string;
  referrerName: string;
  referrerCustomerNumber: string;
  referrerCustomerId: string;
  referralCode: string;
  referredOrderId: string;
  referredOrderNumber: string;
  referredCustomerName: string | null;
  eligibleValue: number | null;
  commissionRate: number | null;
  commissionAmount: number | null;
  status: Referral["status"];
  createdAt: string;
  approvedAt: string | null;
};

export type AdminReferralFilters = { status?: Referral["status"]; search?: string };

/** Admin-only — no per-customer scoping (RLS already restricts this table
    to authenticated/admin sessions only). Small dataset by nature (one row
    per referred order), so search/status filtering happens in JS after one
    fetch rather than building a cross-embed PostgREST filter. */
export async function getAllReferrals(filters: AdminReferralFilters = {}): Promise<AdminReferralRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("referrals")
    .select(
      "id, referral_code, status, eligible_value, commission_rate, commission_amount, created_at, approved_at, referrer_customer_id, referred_order_id, referrer:customers!referrals_referrer_customer_id_fkey(name, customer_number), referred_order:orders!referrals_referred_order_id_fkey(order_number), referred_customer:customers!referrals_referred_customer_id_fkey(name)"
    )
    .order("created_at", { ascending: false });
  if (error) return [];

  let rows = (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any): AdminReferralRow | null => {
      if (!row.referrer || !row.referred_order) return null;
      return {
        id: row.id,
        referrerName: row.referrer.name,
        referrerCustomerNumber: row.referrer.customer_number,
        referrerCustomerId: row.referrer_customer_id,
        referralCode: row.referral_code,
        referredOrderId: row.referred_order_id,
        referredOrderNumber: row.referred_order.order_number,
        referredCustomerName: row.referred_customer?.name ?? null,
        eligibleValue: row.eligible_value,
        commissionRate: row.commission_rate,
        commissionAmount: row.commission_amount,
        status: row.status,
        createdAt: row.created_at,
        approvedAt: row.approved_at,
      };
    })
    .filter((r): r is AdminReferralRow => r !== null);

  if (filters.status) {
    rows = rows.filter((r) => r.status === filters.status);
  }
  if (filters.search?.trim()) {
    const term = filters.search.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.referrerName.toLowerCase().includes(term) ||
        r.referralCode.toLowerCase().includes(term) ||
        r.referredOrderNumber.toLowerCase().includes(term) ||
        r.referrerCustomerNumber.toLowerCase().includes(term)
    );
  }
  return rows;
}

export type ReferredOrderSummary = {
  order_id: string;
  order_number: string;
  created_at: string;
  status: Referral["status"];
  commission_amount: number | null;
};

export async function getReferralsByCustomer(customerId: string): Promise<ReferredOrderSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("referrals")
    .select("status, commission_amount, orders!referrals_referred_order_id_fkey(id, order_number, created_at)")
    .eq("referrer_customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) return [];

  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => ({
      order_id: row.orders?.id as string | undefined,
      order_number: row.orders?.order_number as string | undefined,
      created_at: row.orders?.created_at as string | undefined,
      status: row.status as Referral["status"],
      commission_amount: row.commission_amount as number | null,
    }))
    .filter((r): r is ReferredOrderSummary => Boolean(r.order_id && r.order_number && r.created_at));
}
