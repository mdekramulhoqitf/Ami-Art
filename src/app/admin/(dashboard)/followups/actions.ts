"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCapability } from "@/lib/permissions";
import type { FollowUpReason } from "@/lib/types";

/** businesses.next_followup_at (Phase 1) stays the fast pointer the
    already-verified dashboard reads — every write below keeps it in sync
    rather than replacing it, so nothing already built has to change. */
async function syncBusinessNextFollowup(businessId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follow_ups")
    .select("scheduled_at")
    .eq("business_id", businessId)
    .eq("status", "pending")
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  await supabase.from("businesses").update({ next_followup_at: data?.scheduled_at ?? null }).eq("id", businessId);
}

function revalidateFollowupSurfaces(
  businessId: string | null,
  customerId: string | null,
  orderId: string | null = null
) {
  revalidatePath("/admin/followups");
  revalidatePath("/admin/businesses");
  revalidatePath("/admin");
  if (businessId) revalidatePath(`/admin/businesses/${businessId}`);
  if (customerId) revalidatePath(`/admin/customers/${customerId}`);
  if (orderId) revalidatePath(`/admin/orders/${orderId}`);
}

export type ScheduleFollowUpInput = {
  businessId?: string | null;
  customerId?: string | null;
  opportunityId?: string | null;
  quotationId?: string | null;
  orderId?: string | null;
  reason: FollowUpReason;
  scheduledAt: string;
  notes?: string;
  nextAction?: string;
};

export async function scheduleFollowUp(input: ScheduleFollowUpInput) {
  await requireCapability("manage_leads");
  const supabase = await createClient();

  const { error } = await supabase.from("follow_ups").insert({
    business_id: input.businessId || null,
    customer_id: input.customerId || null,
    opportunity_id: input.opportunityId || null,
    quotation_id: input.quotationId || null,
    order_id: input.orderId || null,
    reason: input.reason,
    scheduled_at: input.scheduledAt,
    notes: input.notes || null,
    next_action: input.nextAction || null,
  });
  if (error) throw new Error(error.message);

  if (input.businessId) await syncBusinessNextFollowup(input.businessId);
  revalidateFollowupSurfaces(input.businessId ?? null, input.customerId ?? null, input.orderId ?? null);
}

async function setFollowUpStatus(id: string, status: "completed" | "skipped", note?: string) {
  await requireCapability("manage_leads");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("follow_ups")
    .select("business_id, customer_id, order_id, notes")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return;

  const mergedNotes = note ? [existing.notes, note].filter(Boolean).join("\n") : existing.notes;

  await supabase
    .from("follow_ups")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
      notes: mergedNotes,
    })
    .eq("id", id);

  if (existing.business_id) await syncBusinessNextFollowup(existing.business_id);
  revalidateFollowupSurfaces(existing.business_id, existing.customer_id, existing.order_id);
}

export async function markContacted(id: string) {
  await setFollowUpStatus(id, "completed", "যোগাযোগ করা হয়েছে");
}

export async function completeFollowUp(id: string) {
  await setFollowUpStatus(id, "completed");
}

export async function skipFollowUp(id: string) {
  await setFollowUpStatus(id, "skipped");
}

export async function postponeFollowUp(id: string, newScheduledAt: string) {
  await requireCapability("manage_leads");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("follow_ups")
    .select("business_id, customer_id, order_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return;

  await supabase.from("follow_ups").update({ scheduled_at: newScheduledAt }).eq("id", id);

  if (existing.business_id) await syncBusinessNextFollowup(existing.business_id);
  revalidateFollowupSurfaces(existing.business_id, existing.customer_id, existing.order_id);
}

export async function addFollowUpNote(id: string, note: string) {
  await requireCapability("manage_leads");
  if (!note.trim()) return;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("follow_ups")
    .select("business_id, customer_id, order_id, notes")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return;

  const mergedNotes = [existing.notes, note.trim()].filter(Boolean).join("\n");
  await supabase.from("follow_ups").update({ notes: mergedNotes }).eq("id", id);
  revalidateFollowupSurfaces(existing.business_id, existing.customer_id, existing.order_id);
}
