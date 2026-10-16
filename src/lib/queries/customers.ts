import { createClient } from "@/lib/supabase/server";
import type { ActivityLogEntry, Customer, CustomerReward, Order, RewardRule } from "@/lib/types";

export type CustomerFilters = {
  search?: string;
};

export async function getCustomers(filters: CustomerFilters = {}): Promise<Customer[]> {
  const supabase = await createClient();
  let query = supabase.from("customers").select("*").order("last_order_at", { ascending: false, nullsFirst: false });

  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,customer_number.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function getCustomerByCustomerNumber(customerNumber: string): Promise<Customer | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("customer_number", customerNumber)
    .maybeSingle();
  return data ?? null;
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Sum of the latest invoice's paid_amount across every order this customer
    has placed — the only real "total spend" figure, never estimated. */
export async function getCustomerTotalSpend(customerId: string): Promise<number> {
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("id").eq("customer_id", customerId);
  const orderIds = (orders ?? []).map((o) => o.id);
  if (orderIds.length === 0) return 0;

  const { data: invoices } = await supabase
    .from("invoices")
    .select("paid_amount")
    .in("order_id", orderIds)
    .eq("is_latest", true);
  return (invoices ?? []).reduce((sum, inv) => sum + (inv.paid_amount ?? 0), 0);
}

export async function getCustomerRewards(customerId: string): Promise<CustomerReward[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_rewards")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Always derived from the ledger — never a cached balance, so it can never
    drift out of sync with the actual earn/redeem history. */
export async function getCustomerRewardBalance(customerId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("customer_rewards").select("points").eq("customer_id", customerId);
  return (data ?? []).reduce((sum, r) => sum + r.points, 0);
}

export async function getCustomerActivity(customerId: string): Promise<ActivityLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("customer_id", customerId)
    .order("occurred_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRewardRules(): Promise<RewardRule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("reward_rules").select("*").order("rule_key", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type RepeatOpportunityTone = "neutral" | "primary" | "success" | "accent";

export type CustomerInsight = {
  totalOrders: number;
  topService: { label: string; count: number } | null;
  daysSinceLastOrder: number | null;
  suggestedNextService: string | null;
  repeatOpportunity: { label: string; tone: RepeatOpportunityTone } | null;
};

/** Rule-based, transparent, explicitly not AI/predictive — counts each
    order's service_label and surfaces the most frequent one as a "possible
    next need" hint, purely derived from this customer's own order history. */
export function deriveCustomerInsight(orders: Order[]): CustomerInsight {
  const counts = new Map<string, number>();
  for (const o of orders) {
    counts.set(o.service_label, (counts.get(o.service_label) ?? 0) + 1);
  }
  let topService: { label: string; count: number } | null = null;
  for (const [label, count] of counts) {
    if (!topService || count > topService.count) topService = { label, count };
  }

  const lastOrder = orders[0];
  const daysSinceLastOrder = lastOrder
    ? Math.floor((Date.now() - new Date(lastOrder.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Simple deterministic buckets only — no scoring, no prediction. Silent
  // (null) whenever there isn't enough real history to say anything true.
  let repeatOpportunity: CustomerInsight["repeatOpportunity"] = null;
  if (orders.length === 0) {
    repeatOpportunity = null;
  } else if (orders.length === 1) {
    repeatOpportunity = { label: "নতুন গ্রাহক", tone: "neutral" };
  } else if (daysSinceLastOrder != null && daysSinceLastOrder <= 30) {
    repeatOpportunity = { label: "সক্রিয় ফিরতি গ্রাহক", tone: "success" };
  } else if (daysSinceLastOrder != null && daysSinceLastOrder > 90) {
    repeatOpportunity = { label: "পুনরায় যোগাযোগের সুযোগ", tone: "primary" };
  } else {
    repeatOpportunity = { label: "নিয়মিত গ্রাহক", tone: "neutral" };
  }

  return {
    totalOrders: orders.length,
    topService,
    daysSinceLastOrder,
    suggestedNextService: topService && topService.count >= 2 ? topService.label : null,
    repeatOpportunity,
  };
}

// Smallest safe default for this sprint — not yet admin-configurable.
// Deliberately a plain constant rather than a new reward_rules row: the
// sprint brief explicitly allows a documented default here and asks to
// prefer zero migrations. If the owner later wants this tunable from
// /admin/reward-rules, it can be added the same way referral_min_redemption
// was (one additive INSERT + one admin-page label) — not needed yet.
export const RETENTION_MIN_DAYS = 30; // don't suggest a follow-up sooner than this after a completed order
export const RETENTION_INACTIVE_DAYS = 90; // beyond this, treat the gap itself as a signal

export type RetentionPriority = "high" | "medium" | "low";

export type RetentionOpportunity = {
  reason: string;
  suggestedAction: string;
  priority: RetentionPriority;
  lastCompletedService: string;
  lastCompletedAt: string;
  daysSinceLastCompleted: number;
  completedCount: number;
  /** A pending follow-up already covers this customer — the UI must show
      "ফলো-আপ ইতিমধ্যে নির্ধারিত" and link to it instead of offering to
      create a duplicate. */
  existingFollowUpId: string | null;
};

/** Transparent, rule-based, explainable — deliberately not a numeric score.
    Every input and every resulting sentence is visible in this function; the
    "score" variable never leaves it or reaches the UI, it only selects one
    of exactly three priority labels.

    RULE A — a completed order exists and enough time has passed: baseline
             opportunity (this alone yields "low").
    RULE B — 2+ completed orders: repeat customer, worth more attention.
    RULE C — the same service repeats across completed orders.
    RULE D — the gap itself is long (>= RETENTION_INACTIVE_DAYS): win-back signal.
    RULE E — too recent (< RETENTION_MIN_DAYS since the last completed order):
             no opportunity at all, to avoid annoying a just-served customer. */
export function deriveRetentionOpportunity(
  orders: Order[],
  pendingFollowUpIds: string[]
): RetentionOpportunity | null {
  const completed = orders
    .filter((o) => o.status === "completed" && !o.is_archived)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (completed.length === 0) return null;

  const last = completed[0];
  const daysSince = Math.floor((Date.now() - new Date(last.created_at).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince < RETENTION_MIN_DAYS) return null;

  const serviceCounts = new Map<string, number>();
  for (const o of completed) {
    serviceCounts.set(o.service_label, (serviceCounts.get(o.service_label) ?? 0) + 1);
  }
  const repeatService = [...serviceCounts.values()].some((c) => c >= 2);

  let score = 0;
  if (completed.length >= 2) score++;
  if (repeatService) score++;
  if (daysSince >= RETENTION_INACTIVE_DAYS) score++;
  const priority: RetentionPriority = score >= 2 ? "high" : score === 1 ? "medium" : "low";

  const reasons: string[] = [];
  if (completed.length >= 2) reasons.push("এই গ্রাহক একাধিকবার অর্ডার করেছেন।");
  if (repeatService) reasons.push("আগে একই ধরনের কাজ করেছেন।");
  reasons.push(
    daysSince >= RETENTION_INACTIVE_DAYS
      ? "আগের অর্ডারের পর অনেকদিন হয়ে গেছে।"
      : "আগের অর্ডারের পর বেশ কিছুদিন হয়েছে।"
  );

  return {
    reason: reasons.join(" "),
    suggestedAction: "একবার যোগাযোগ করা যেতে পারে।",
    priority,
    lastCompletedService: last.service_label,
    lastCompletedAt: last.created_at,
    daysSinceLastCompleted: daysSince,
    completedCount: completed.length,
    existingFollowUpId: pendingFollowUpIds[0] ?? null,
  };
}

export type CustomerOpportunity = {
  customerId: string;
  customerName: string;
  customerNumber: string;
  opportunity: RetentionOpportunity;
};

/** Admin-wide "who deserves attention today" list — computed from exactly
    two extra queries (all completed orders, all pending follow-ups),
    grouped in JS per customer, never one query per customer. Small local
    business, small real dataset — this stays cheap regardless of customer
    count and avoids N+1 entirely. */
export async function getCustomersWithOpportunities(): Promise<CustomerOpportunity[]> {
  const supabase = await createClient();

  const [{ data: customers }, { data: orders }, { data: followUps }] = await Promise.all([
    supabase.from("customers").select("id, name, customer_number").gt("total_orders", 0),
    supabase
      .from("orders")
      .select("customer_id, service_label, status, is_archived, created_at")
      .eq("status", "completed")
      .eq("is_archived", false)
      .not("customer_id", "is", null),
    supabase.from("follow_ups").select("id, customer_id").eq("status", "pending").not("customer_id", "is", null),
  ]);

  if (!customers || customers.length === 0) return [];

  const ordersByCustomer = new Map<string, Order[]>();
  for (const o of orders ?? []) {
    const list = ordersByCustomer.get(o.customer_id as string) ?? [];
    list.push(o as unknown as Order);
    ordersByCustomer.set(o.customer_id as string, list);
  }

  const followUpsByCustomer = new Map<string, string[]>();
  for (const f of followUps ?? []) {
    const list = followUpsByCustomer.get(f.customer_id as string) ?? [];
    list.push(f.id);
    followUpsByCustomer.set(f.customer_id as string, list);
  }

  const results: CustomerOpportunity[] = [];
  for (const c of customers) {
    const opportunity = deriveRetentionOpportunity(
      ordersByCustomer.get(c.id) ?? [],
      followUpsByCustomer.get(c.id) ?? []
    );
    if (opportunity) {
      results.push({ customerId: c.id, customerName: c.name, customerNumber: c.customer_number, opportunity });
    }
  }

  const priorityRank: Record<RetentionPriority, number> = { high: 0, medium: 1, low: 2 };
  results.sort(
    (a, b) =>
      priorityRank[a.opportunity.priority] - priorityRank[b.opportunity.priority] ||
      b.opportunity.daysSinceLastCompleted - a.opportunity.daysSinceLastCompleted
  );
  return results;
}
