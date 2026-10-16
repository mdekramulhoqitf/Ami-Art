"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";
import { invoiceSchema } from "@/lib/validation";
import { computeInvoiceTotals } from "@/lib/pricing";
import type { Database, InvoiceStatus } from "@/lib/types";

type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
type InvoiceItemInsert = Database["public"]["Tables"]["invoice_items"]["Insert"];

export type InvoiceFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseInvoiceFormData(formData: FormData) {
  const itemsRaw = formData.get("items");
  let items: unknown[] = [];
  try {
    items = itemsRaw && typeof itemsRaw === "string" ? JSON.parse(itemsRaw) : [];
  } catch {
    items = [];
  }

  return invoiceSchema.safeParse({
    customer_name: formData.get("customer_name"),
    customer_phone: formData.get("customer_phone"),
    customer_email: formData.get("customer_email") || undefined,
    customer_address: formData.get("customer_address") || undefined,
    invoice_date: formData.get("invoice_date"),
    items,
    design_charge: formData.get("design_charge") || 0,
    delivery_charge: formData.get("delivery_charge") || 0,
    courier_charge: formData.get("courier_charge") || 0,
    other_charge: formData.get("other_charge") || 0,
    discount: formData.get("discount") || 0,
    paid_amount: formData.get("paid_amount") || 0,
    estimated_completion: formData.get("estimated_completion") || undefined,
    delivery_method: formData.get("delivery_method") || undefined,
    delivery_address: formData.get("delivery_address") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createInvoice(
  orderId: string,
  _prevState: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  await requireUser();

  const validated = parseInvoiceFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const supabase = await createClient();

  const { data: numberData, error: numberError } = await supabase.rpc("next_invoice_number");
  if (numberError || !numberData) {
    return { message: "ইনভয়েস নম্বর তৈরি করা যায়নি। আবার চেষ্টা করুন।" };
  }

  const totals = computeInvoiceTotals(validated.data.items, {
    design_charge: validated.data.design_charge,
    delivery_charge: validated.data.delivery_charge,
    courier_charge: validated.data.courier_charge,
    other_charge: validated.data.other_charge,
    discount: validated.data.discount,
    paid_amount: validated.data.paid_amount,
  });

  const insert: InvoiceInsert = {
    order_id: orderId,
    invoice_number: numberData,
    version: 1,
    is_latest: true,
    status: "draft",
    invoice_date: validated.data.invoice_date,
    customer_name: validated.data.customer_name,
    customer_phone: validated.data.customer_phone,
    customer_email: validated.data.customer_email || null,
    customer_address: validated.data.customer_address || null,
    subtotal: totals.subtotal,
    design_charge: validated.data.design_charge,
    delivery_charge: validated.data.delivery_charge,
    courier_charge: validated.data.courier_charge,
    other_charge: validated.data.other_charge,
    discount: validated.data.discount,
    total: totals.total,
    paid_amount: validated.data.paid_amount,
    due_amount: totals.due_amount,
    estimated_completion: validated.data.estimated_completion || null,
    delivery_method: validated.data.delivery_method || null,
    delivery_address: validated.data.delivery_address || null,
    notes: validated.data.notes || null,
  };

  const { data: invoice, error } = await supabase.from("invoices").insert(insert).select("id").single();
  if (error || !invoice) {
    return { message: "ইনভয়েস তৈরি করা যায়নি। আবার চেষ্টা করুন।" };
  }

  const itemRows: InvoiceItemInsert[] = totals.items.map((item, i) => ({
    invoice_id: invoice.id,
    service_name: item.service_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total,
    display_order: i,
  }));
  await supabase.from("invoice_items").insert(itemRows);

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}/invoice/${invoice.id}`);
}

export async function updateInvoice(
  invoiceId: string,
  orderId: string,
  _prevState: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  await requireUser();

  const validated = parseInvoiceFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const supabase = await createClient();

  const totals = computeInvoiceTotals(validated.data.items, {
    design_charge: validated.data.design_charge,
    delivery_charge: validated.data.delivery_charge,
    courier_charge: validated.data.courier_charge,
    other_charge: validated.data.other_charge,
    discount: validated.data.discount,
    paid_amount: validated.data.paid_amount,
  });

  const { error } = await supabase
    .from("invoices")
    .update({
      invoice_date: validated.data.invoice_date,
      customer_name: validated.data.customer_name,
      customer_phone: validated.data.customer_phone,
      customer_email: validated.data.customer_email || null,
      customer_address: validated.data.customer_address || null,
      subtotal: totals.subtotal,
      design_charge: validated.data.design_charge,
      delivery_charge: validated.data.delivery_charge,
      courier_charge: validated.data.courier_charge,
      other_charge: validated.data.other_charge,
      discount: validated.data.discount,
      total: totals.total,
      paid_amount: validated.data.paid_amount,
      due_amount: totals.due_amount,
      estimated_completion: validated.data.estimated_completion || null,
      delivery_method: validated.data.delivery_method || null,
      delivery_address: validated.data.delivery_address || null,
      notes: validated.data.notes || null,
    })
    .eq("id", invoiceId);

  if (error) {
    return { message: "ইনভয়েস সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" };
  }

  await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
  const itemRows: InvoiceItemInsert[] = totals.items.map((item, i) => ({
    invoice_id: invoiceId,
    service_name: item.service_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total,
    display_order: i,
  }));
  await supabase.from("invoice_items").insert(itemRows);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}/invoice/${invoiceId}`);
  redirect(`/admin/orders/${orderId}/invoice/${invoiceId}`);
}

/**
 * "Edit" on a non-draft invoice creates a new version instead of mutating
 * what the customer has already been shown. Returns the new invoice's id.
 */
export async function createInvoiceVersion(invoiceId: string, orderId: string): Promise<string | null> {
  await requireUser();
  const supabase = await createClient();

  const { data: current } = await supabase.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
  if (!current) return null;

  const { data: currentItems } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("display_order", { ascending: true });

  await supabase.from("invoices").update({ is_latest: false }).eq("id", invoiceId);

  const insert: InvoiceInsert = {
    order_id: current.order_id,
    invoice_number: current.invoice_number,
    version: current.version + 1,
    is_latest: true,
    status: "draft",
    invoice_date: current.invoice_date,
    customer_name: current.customer_name,
    customer_phone: current.customer_phone,
    customer_email: current.customer_email,
    customer_address: current.customer_address,
    subtotal: current.subtotal,
    design_charge: current.design_charge,
    delivery_charge: current.delivery_charge,
    courier_charge: current.courier_charge,
    other_charge: current.other_charge,
    discount: current.discount,
    total: current.total,
    paid_amount: current.paid_amount,
    due_amount: current.due_amount,
    estimated_completion: current.estimated_completion,
    delivery_method: current.delivery_method,
    delivery_address: current.delivery_address,
    notes: current.notes,
  };

  const { data: newInvoice, error } = await supabase.from("invoices").insert(insert).select("id").single();
  if (error || !newInvoice) return null;

  if (currentItems && currentItems.length > 0) {
    const itemRows: InvoiceItemInsert[] = currentItems.map((item, i) => ({
      invoice_id: newInvoice.id,
      service_name: item.service_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
      display_order: i,
    }));
    await supabase.from("invoice_items").insert(itemRows);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  return newInvoice.id;
}

export type SendInvoiceState = { success: boolean; message?: string };

export async function sendInvoiceMessage(
  invoiceId: string,
  orderId: string,
  _prevState: SendInvoiceState,
  formData: FormData
): Promise<SendInvoiceState> {
  await requireUser();
  const supabase = await createClient();

  const { data: invoice } = await supabase.from("invoices").select("status").eq("id", invoiceId).maybeSingle();
  if (!invoice) return { success: false, message: "ইনভয়েসটি পাওয়া যায়নি।" };

  if (invoice.status === "draft") {
    await supabase.from("invoices").update({ status: "sent" }).eq("id", invoiceId);
  }

  const note = (formData.get("message") as string | null)?.trim();
  const message =
    note ||
    "আপনার কাজের বিস্তারিত দেখে একটি ইনভয়েস তৈরি করা হয়েছে। নিচে আপনার ইনভয়েস দেওয়া হলো।";

  const { error } = await supabase.from("order_messages").insert({
    order_id: orderId,
    sender_type: "admin",
    message_type: "invoice",
    invoice_id: invoiceId,
    message,
  });

  if (error) return { success: false, message: "ইনভয়েস পাঠানো যায়নি। আবার চেষ্টা করুন।" };

  await supabase.from("orders").update({ updated_at: new Date().toISOString() }).eq("id", orderId);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}/invoice/${invoiceId}`);
  return { success: true };
}

export async function updateInvoicePaymentStatus(
  invoiceId: string,
  orderId: string,
  status: InvoiceStatus,
  paidAmount: number
) {
  await requireUser();
  const supabase = await createClient();

  const { data: invoice } = await supabase.from("invoices").select("total").eq("id", invoiceId).maybeSingle();
  if (!invoice) return;

  const dueAmount = Math.max(invoice.total - paidAmount, 0);

  await supabase
    .from("invoices")
    .update({ status, paid_amount: paidAmount, due_amount: dueAmount })
    .eq("id", invoiceId);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}/invoice/${invoiceId}`);
}
