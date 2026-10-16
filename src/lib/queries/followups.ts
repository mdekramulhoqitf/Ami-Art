import { createClient } from "@/lib/supabase/server";
import { startOfTodayDhaka, endOfTodayDhaka, daysFromTodayDhaka } from "@/lib/timezone";
import type { FollowUp } from "@/lib/types";

export type FollowUpWithTarget = FollowUp & {
  business_name: string | null;
  customer_name: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withTargetNames(row: any): FollowUpWithTarget {
  return {
    ...(row as FollowUp),
    business_name: row.businesses?.name ?? null,
    customer_name: row.customers?.name ?? null,
  };
}

const SELECT_WITH_TARGETS = "*, businesses(name), customers(name)";

/** Every follow_ups read below (the widgets embedded on business/customer/
    order detail pages) degrades to an empty/zero result on error instead of
    throwing — follow-ups are enhancement data layered onto already-working
    pages there, so a missing table must never break those pages. */

export type FollowUpListResult = { data: FollowUpWithTarget[]; error: string | null };

/** The dedicated /admin/followups page, by contrast, IS the primary
    surface for this data — a real database/permission error there must
    never be silently presented as "no follow-ups", so these three return
    the error alongside the (possibly stale/empty) data instead of
    swallowing it. */

export async function getFollowupsToday(): Promise<FollowUpListResult> {
  const supabase = await createClient();
  const startOfDay = startOfTodayDhaka();
  const endOfDay = endOfTodayDhaka();

  const { data, error } = await supabase
    .from("follow_ups")
    .select(SELECT_WITH_TARGETS)
    .eq("status", "pending")
    .gte("scheduled_at", startOfDay.toISOString())
    .lte("scheduled_at", endOfDay.toISOString())
    .order("scheduled_at", { ascending: true });
  return { data: (data ?? []).map(withTargetNames), error: error?.message ?? null };
}

export async function getOverdueFollowupsList(): Promise<FollowUpListResult> {
  const supabase = await createClient();
  const startOfDay = startOfTodayDhaka();

  const { data, error } = await supabase
    .from("follow_ups")
    .select(SELECT_WITH_TARGETS)
    .eq("status", "pending")
    .lt("scheduled_at", startOfDay.toISOString())
    .order("scheduled_at", { ascending: true });
  return { data: (data ?? []).map(withTargetNames), error: error?.message ?? null };
}

export async function getUpcomingFollowups(days = 14): Promise<FollowUpListResult> {
  const supabase = await createClient();
  const endOfDay = endOfTodayDhaka();
  const horizon = new Date(daysFromTodayDhaka(days + 1).getTime() - 1);

  const { data, error } = await supabase
    .from("follow_ups")
    .select(SELECT_WITH_TARGETS)
    .eq("status", "pending")
    .gt("scheduled_at", endOfDay.toISOString())
    .lte("scheduled_at", horizon.toISOString())
    .order("scheduled_at", { ascending: true });
  return { data: (data ?? []).map(withTargetNames), error: error?.message ?? null };
}

export async function getFollowupsForBusiness(businessId: string): Promise<FollowUp[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .select("*")
    .eq("business_id", businessId)
    .order("scheduled_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getFollowupsForCustomer(customerId: string): Promise<FollowUp[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .select("*")
    .eq("customer_id", customerId)
    .order("scheduled_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getFollowupsForOrder(orderId: string): Promise<FollowUp[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .select("*")
    .eq("order_id", orderId)
    .order("scheduled_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

/** Plain helper, not a component/hook — the "now" comparison for overdue
    state belongs here, not inline in a page render body. */
export function isFollowUpOverdue(scheduledAt: string): boolean {
  return new Date(scheduledAt).getTime() < Date.now();
}

/** The earliest-scheduled pending follow-up in a list already ordered
    scheduled_at DESC (the query functions above all sort that way) — i.e.
    the one most due for action right now. */
export function getNextPendingFollowUp<T extends { status: string; scheduled_at: string }>(
  items: T[]
): T | null {
  const pending = items.filter((f) => f.status === "pending");
  return pending.length > 0 ? pending[pending.length - 1] : null;
}

export async function getFollowupById(id: string): Promise<FollowUp | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("follow_ups").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export type FollowUpCounts = { today: number; overdue: number; upcoming: number };

export async function getFollowUpCounts(): Promise<FollowUpCounts> {
  const supabase = await createClient();
  const startOfDay = startOfTodayDhaka();
  const endOfDay = endOfTodayDhaka();

  try {
    const [today, overdue, upcoming] = await Promise.all([
      supabase
        .from("follow_ups")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("scheduled_at", startOfDay.toISOString())
        .lte("scheduled_at", endOfDay.toISOString()),
      supabase
        .from("follow_ups")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .lt("scheduled_at", startOfDay.toISOString()),
      supabase
        .from("follow_ups")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .gt("scheduled_at", endOfDay.toISOString()),
    ]);
    return {
      today: today.count ?? 0,
      overdue: overdue.count ?? 0,
      upcoming: upcoming.count ?? 0,
    };
  } catch {
    return { today: 0, overdue: 0, upcoming: 0 };
  }
}
