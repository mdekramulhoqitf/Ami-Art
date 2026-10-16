import { createClient } from "@/lib/supabase/server";
import { startOfTodayDhaka, endOfTodayDhaka, daysFromTodayDhaka } from "@/lib/timezone";
import type {
  ActivityLogEntry,
  Business,
  BusinessContact,
  BusinessStatus,
  Opportunity,
  OpportunityStage,
  Quotation,
  QuotationItem,
} from "@/lib/types";

export type BusinessFilters = {
  search?: string;
  status?: BusinessStatus;
};

export async function getBusinesses(filters: BusinessFilters = {}): Promise<Business[]> {
  const supabase = await createClient();
  let query = supabase.from("businesses").select("*").order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("business_status", filters.status);
  } else {
    // No explicit status filter chosen — default to hiding archived
    // (inactive) businesses, matching how the existing orders list always
    // excludes archived orders by default. Selecting "নিষ্ক্রিয়" from the
    // status dropdown still shows them explicitly.
    query = query.neq("business_status", "inactive");
  }
  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,area.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function getBusinessContacts(businessId: string): Promise<BusinessContact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_contacts")
    .select("*")
    .eq("business_id", businessId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBusinessOpportunities(businessId: string): Promise<Opportunity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("opportunities").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function getOpportunityQuotations(opportunityId: string): Promise<Quotation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("quotations").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

/** Reverse lookup: which quotation (if any) converted into this order — the
    order itself has no quotation_id column, quotations.order_id is the only
    stored direction, so this queries that existing relationship in reverse
    rather than adding a new column. */
export async function getQuotationByOrderId(orderId: string): Promise<Quotation | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("quotations").select("*").eq("order_id", orderId).maybeSingle();
  return data ?? null;
}

export async function getQuotationItems(quotationId: string): Promise<QuotationItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("quotation_id", quotationId)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Timeline for one business — includes activity from every opportunity
    under it too, since a business's story spans all its opportunities. */
export async function getBusinessActivity(businessId: string): Promise<ActivityLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("business_id", businessId)
    .order("occurred_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOpportunityActivity(opportunityId: string): Promise<ActivityLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .order("occurred_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type PossibleDuplicate = { id: string; name: string; phone: string | null; matchedOn: string };

/** Foundation-level duplicate check: exact phone match or case-insensitive
    exact name match. Never auto-merges — the admin decides. */
export async function findPossibleDuplicates(
  name: string,
  phone: string | undefined
): Promise<PossibleDuplicate[]> {
  const supabase = await createClient();
  const conditions: string[] = [`name.ilike.${name.trim()}`];
  if (phone?.trim()) conditions.push(`phone.eq.${phone.trim()}`);

  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, phone")
    .or(conditions.join(","))
    .limit(5);
  if (error) throw new Error(error.message);

  return (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    phone: b.phone,
    matchedOn: b.phone && b.phone.trim() === phone?.trim() ? "phone" : "name",
  }));
}

export async function getOpenOpportunitiesByStage(stage: OpportunityStage): Promise<Opportunity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("stage", stage)
    .order("estimated_value", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type CrmSummary = {
  followupsToday: number;
  followupsOverdue: number;
  newBusinessesThisWeek: number;
  interestedLeads: number;
  pendingQuotations: number;
};

/** Command-center counts — every number here is a real count query, never
    an estimate or placeholder. Honest zeros are expected on a fresh CRM. */
export async function getCrmSummary(): Promise<CrmSummary> {
  const supabase = await createClient();
  const startOfDay = startOfTodayDhaka();
  const endOfDay = endOfTodayDhaka();
  const sevenDaysAgo = daysFromTodayDhaka(-7);

  const [followupsToday, followupsOverdue, newBusinesses, interestedLeads, pendingQuotations] =
    await Promise.all([
      supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .neq("business_status", "inactive")
        .gte("next_followup_at", startOfDay.toISOString())
        .lte("next_followup_at", endOfDay.toISOString()),
      supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .neq("business_status", "inactive")
        .lt("next_followup_at", startOfDay.toISOString()),
      supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .neq("business_status", "inactive")
        .gte("created_at", sevenDaysAgo.toISOString()),
      supabase
        .from("opportunities")
        .select("*", { count: "exact", head: true })
        .in("stage", ["interested", "negotiation"]),
      supabase
        .from("quotations")
        .select("*", { count: "exact", head: true })
        .in("status", ["sent", "viewed", "negotiating"]),
    ]);

  return {
    followupsToday: followupsToday.count ?? 0,
    followupsOverdue: followupsOverdue.count ?? 0,
    newBusinessesThisWeek: newBusinesses.count ?? 0,
    interestedLeads: interestedLeads.count ?? 0,
    pendingQuotations: pendingQuotations.count ?? 0,
  };
}

export type RecentActivityEntry = ActivityLogEntry & { business_name: string | null };

export async function getRecentActivity(limit = 8): Promise<RecentActivityEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*, businesses(name)")
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const business = (row as any).businesses as { name: string } | null;
    return { ...(row as ActivityLogEntry), business_name: business?.name ?? null };
  });
}
