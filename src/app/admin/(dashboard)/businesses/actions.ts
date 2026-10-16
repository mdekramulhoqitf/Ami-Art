"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCapability } from "@/lib/permissions";
import { findPossibleDuplicates, type PossibleDuplicate } from "@/lib/queries/businesses";
import {
  businessSchema,
  businessContactSchema,
  opportunitySchema,
  activityNoteSchema,
  quotationHeaderSchema,
} from "@/lib/validation";
import type { InvoiceItemDraft } from "@/components/admin/InvoiceItemsEditor";
import type { OpportunityStage } from "@/lib/types";

export type BusinessFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  possibleDuplicates?: PossibleDuplicate[];
};

function parseBusinessForm(formData: FormData) {
  return businessSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    subcategory: formData.get("subcategory") || undefined,
    area: formData.get("area") || undefined,
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    website: formData.get("website") || undefined,
    facebook: formData.get("facebook") || undefined,
    instagram: formData.get("instagram") || undefined,
    google_maps_url: formData.get("google_maps_url") || undefined,
    source: formData.get("source") || undefined,
    source_url: formData.get("source_url") || undefined,
    source_type: formData.get("source_type") || undefined,
    collected_by: formData.get("collected_by") || undefined,
    verification_status: formData.get("verification_status") || "unverified",
    business_status: formData.get("business_status") || "prospect",
    estimated_size: formData.get("estimated_size") || undefined,
    estimated_printing_need: formData.get("estimated_printing_need") || undefined,
    estimated_printing_frequency: formData.get("estimated_printing_frequency") || undefined,
    potential_value: formData.get("potential_value") || undefined,
    priority_level: formData.get("priority_level") || "normal",
    new_business_flag: formData.get("new_business_flag") === "on",
    rebranding_flag: formData.get("rebranding_flag") === "on",
    promotional_activity_flag: formData.get("promotional_activity_flag") === "on",
    seasonal_demand: formData.get("seasonal_demand") || undefined,
    existing_supplier_known: formData.get("existing_supplier_known") === "on",
    tags: formData.get("tags") || undefined,
    notes: formData.get("notes") || undefined,
    next_followup_at: formData.get("next_followup_at") || undefined,
  });
}

export async function createBusiness(
  _prevState: BusinessFormState,
  formData: FormData
): Promise<BusinessFormState> {
  await requireCapability("create_businesses");

  const validated = parseBusinessForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const skipDuplicateCheck = formData.get("skip_duplicate_check") === "1";
  if (!skipDuplicateCheck) {
    const duplicates = await findPossibleDuplicates(validated.data.name, validated.data.phone);
    if (duplicates.length > 0) {
      return {
        message: "একই নাম বা ফোন নম্বরের ব্যবসা আগে থেকেই আছে বলে মনে হচ্ছে।",
        possibleDuplicates: duplicates,
      };
    }
  }

  const { tags, potential_value, source_type, next_followup_at, ...rest } = validated.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      ...rest,
      source_type: source_type || null,
      potential_value: potential_value === "" ? null : potential_value,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      next_followup_at: next_followup_at ? new Date(next_followup_at).toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !data) return { message: "ব্যবসাটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" };

  await supabase.from("activity_log").insert({
    business_id: data.id,
    type: "created",
    body: "ব্যবসা যোগ করা হয়েছে",
  });

  revalidatePath("/admin/businesses");
  redirect(`/admin/businesses/${data.id}`);
}

export async function updateBusiness(
  id: string,
  _prevState: BusinessFormState,
  formData: FormData
): Promise<BusinessFormState> {
  await requireCapability("edit_businesses");

  const validated = parseBusinessForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const { tags, potential_value, source_type, next_followup_at, ...rest } = validated.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      ...rest,
      source_type: source_type || null,
      potential_value: potential_value === "" ? null : potential_value,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      next_followup_at: next_followup_at ? new Date(next_followup_at).toISOString() : null,
    })
    .eq("id", id);

  if (error) return { message: "ব্যবসাটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" };

  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${id}`);
  redirect(`/admin/businesses/${id}`);
}

/** Soft — flips business_status to 'inactive'. Never a hard delete; nothing
    about a business record disappears, matching this project's existing
    orders.is_archived precedent rather than the hard-delete pattern used by
    purely presentational content (services/portfolio/etc). */
export async function archiveBusiness(id: string) {
  await requireCapability("archive_businesses");
  const supabase = await createClient();
  await supabase.from("businesses").update({ business_status: "inactive" }).eq("id", id);
  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${id}`);
}

export async function addBusinessContact(
  businessId: string,
  _prevState: BusinessFormState,
  formData: FormData
): Promise<BusinessFormState> {
  await requireCapability("edit_businesses");

  const validated = businessContactSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    is_primary: formData.get("is_primary") === "on",
    notes: formData.get("notes") || undefined,
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("business_contacts")
    .insert({ ...validated.data, business_id: businessId });
  if (error) return { message: "কন্ট্যাক্ট যোগ করা যায়নি।" };

  revalidatePath(`/admin/businesses/${businessId}`);
  return { message: "কন্ট্যাক্ট যোগ হয়েছে।" };
}

export async function deleteBusinessContact(id: string, businessId: string) {
  await requireCapability("edit_businesses");
  const supabase = await createClient();
  await supabase.from("business_contacts").delete().eq("id", id);
  revalidatePath(`/admin/businesses/${businessId}`);
}

export async function createOpportunity(
  businessId: string,
  _prevState: BusinessFormState,
  formData: FormData
): Promise<BusinessFormState> {
  await requireCapability("manage_leads");

  const validated = opportunitySchema.safeParse({
    title: formData.get("title"),
    service_category: formData.get("service_category") || undefined,
    stage: formData.get("stage") || "new",
    estimated_value: formData.get("estimated_value") || undefined,
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const { estimated_value, ...rest } = validated.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      ...rest,
      business_id: businessId,
      estimated_value: estimated_value === "" ? null : estimated_value,
    })
    .select("id")
    .single();
  if (error || !data) return { message: "সুযোগ যোগ করা যায়নি।" };

  await supabase.from("activity_log").insert({
    business_id: businessId,
    opportunity_id: data.id,
    type: "created",
    body: `সুযোগ যোগ করা হয়েছে: ${validated.data.title}`,
  });

  revalidatePath(`/admin/businesses/${businessId}`);
  redirect(`/admin/businesses/${businessId}/opportunities/${data.id}`);
}

export async function updateOpportunityStage(id: string, businessId: string, stage: OpportunityStage) {
  await requireCapability("manage_leads");
  const supabase = await createClient();
  await supabase.from("opportunities").update({ stage }).eq("id", id);
  await supabase.from("activity_log").insert({
    business_id: businessId,
    opportunity_id: id,
    type: "status_changed",
    body: `ধাপ পরিবর্তন হয়েছে: ${stage}`,
  });
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath(`/admin/businesses/${businessId}/opportunities/${id}`);
}

export async function addActivityNote(
  businessId: string,
  opportunityId: string | null,
  _prevState: BusinessFormState,
  formData: FormData
): Promise<BusinessFormState> {
  await requireCapability("manage_leads");

  const validated = activityNoteSchema.safeParse({ body: formData.get("body") });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নোট লিখুন।" };
  }

  const supabase = await createClient();
  await supabase.from("activity_log").insert({
    business_id: businessId,
    opportunity_id: opportunityId,
    type: "note_added",
    body: validated.data.body,
  });

  revalidatePath(`/admin/businesses/${businessId}`);
  if (opportunityId) revalidatePath(`/admin/businesses/${businessId}/opportunities/${opportunityId}`);
  return { message: "নোট যোগ হয়েছে।" };
}

export type QuotationFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function saveQuotation(
  opportunityId: string,
  businessId: string,
  items: InvoiceItemDraft[],
  _prevState: QuotationFormState,
  formData: FormData
): Promise<QuotationFormState> {
  await requireCapability("create_quotations");

  const validated = quotationHeaderSchema.safeParse({
    customer_name: formData.get("customer_name"),
    customer_phone: formData.get("customer_phone"),
    customer_email: formData.get("customer_email") || undefined,
    customer_address: formData.get("customer_address") || undefined,
    discount: formData.get("discount") || 0,
    delivery_charge: formData.get("delivery_charge") || 0,
    delivery_method: formData.get("delivery_method") || undefined,
    delivery_address: formData.get("delivery_address") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const cleanItems = items
    .map((item) => ({
      service_name: item.service_name.trim(),
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
    }))
    .filter((item) => item.service_name && item.quantity > 0);

  if (cleanItems.length === 0) {
    return { message: "অন্তত একটি সেবা যোগ করুন।" };
  }

  const subtotal = cleanItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const { discount, delivery_charge, delivery_method, ...rest } = validated.data;
  const total = Math.max(0, subtotal - discount + delivery_charge);

  const supabase = await createClient();
  const { data: numberData } = await supabase.rpc("next_quotation_number");
  const quotationNumber = numberData ?? `AMI-Q-${Date.now()}`;

  const { data: quotation, error } = await supabase
    .from("quotations")
    .insert({
      ...rest,
      quotation_number: quotationNumber,
      opportunity_id: opportunityId,
      business_id: businessId,
      subtotal,
      discount,
      delivery_charge,
      total,
      delivery_method: delivery_method || null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !quotation) return { message: "কোটেশন সংরক্ষণ করা যায়নি।" };

  const { error: itemsError } = await supabase.from("quotation_items").insert(
    cleanItems.map((item, i) => ({
      quotation_id: quotation.id,
      service_name: item.service_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      display_order: i,
    }))
  );
  if (itemsError) return { message: "কোটেশনের আইটেম সংরক্ষণ করা যায়নি।" };

  await supabase.from("activity_log").insert({
    business_id: businessId,
    opportunity_id: opportunityId,
    type: "quotation_sent",
    body: `কোটেশন তৈরি হয়েছে: ${quotationNumber}`,
  });
  await supabase.from("opportunities").update({ stage: "quotation_sent" }).eq("id", opportunityId);

  revalidatePath(`/admin/businesses/${businessId}/opportunities/${opportunityId}`);
  redirect(`/admin/businesses/${businessId}/opportunities/${opportunityId}`);
}

export async function markQuotationSent(id: string, businessId: string, opportunityId: string) {
  await requireCapability("create_quotations");
  const supabase = await createClient();
  await supabase.from("quotations").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/admin/businesses/${businessId}/opportunities/${opportunityId}`);
}

export async function markQuotationNegotiating(id: string, businessId: string, opportunityId: string) {
  await requireCapability("create_quotations");
  const supabase = await createClient();
  await supabase.from("quotations").update({ status: "negotiating" }).eq("id", id);
  await supabase.from("activity_log").insert({
    business_id: businessId,
    opportunity_id: opportunityId,
    type: "status_changed",
    body: "কোটেশন নিয়ে আলোচনা শুরু হয়েছে",
  });
  revalidatePath(`/admin/businesses/${businessId}/opportunities/${opportunityId}`);
}

/** Marks that the customer has agreed to the quotation. This is a distinct
    step from converting it into an order — accept_quotation() (the RPC
    behind acceptQuotation() below) now requires this status first. */
export async function markQuotationAccepted(id: string, businessId: string, opportunityId: string) {
  await requireCapability("create_quotations");
  const supabase = await createClient();
  await supabase
    .from("quotations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", id);
  await supabase.from("activity_log").insert({
    business_id: businessId,
    opportunity_id: opportunityId,
    type: "status_changed",
    body: "কোটেশন গ্রাহক কর্তৃক গৃহীত হয়েছে",
  });
  revalidatePath(`/admin/businesses/${businessId}/opportunities/${opportunityId}`);
}

export async function markQuotationExpired(id: string, businessId: string, opportunityId: string) {
  await requireCapability("create_quotations");
  const supabase = await createClient();
  await supabase.from("quotations").update({ status: "expired" }).eq("id", id);
  revalidatePath(`/admin/businesses/${businessId}/opportunities/${opportunityId}`);
}

export async function rejectQuotation(id: string, businessId: string, opportunityId: string) {
  await requireCapability("create_quotations");
  const supabase = await createClient();
  await supabase
    .from("quotations")
    .update({ status: "rejected", rejected_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(`/admin/businesses/${businessId}/opportunities/${opportunityId}`);
}

export type AcceptQuotationResult = { success: boolean; message: string; orderId?: string };

/** The one path from a quotation into the existing orders/invoices tables —
    delegates to the atomic accept_quotation() Postgres function so the
    quotation, the new order, the new invoice and the activity log entry
    either all happen or none do. */
export async function acceptQuotation(
  id: string,
  businessId: string,
  opportunityId: string
): Promise<AcceptQuotationResult> {
  await requireCapability("manage_orders");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_quotation", { p_quotation_id: id });

  if (error || !data || data.length === 0) {
    return { success: false, message: error?.message ?? "কোটেশনটি অর্ডারে রূপান্তর করা যায়নি।" };
  }

  revalidatePath(`/admin/businesses/${businessId}/opportunities/${opportunityId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  return {
    success: true,
    message: `অর্ডার তৈরি হয়েছে: ${data[0].out_order_number}`,
    orderId: data[0].out_order_id,
  };
}
