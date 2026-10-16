import { createClient } from "@/lib/supabase/server";
import type { Invoice, InvoiceItem } from "@/lib/types";

export async function getInvoicesForOrder(orderId: string): Promise<Invoice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("order_id", orderId)
    .order("version", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLatestInvoiceForOrder(orderId: string): Promise<Invoice | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("order_id", orderId)
    .eq("is_latest", true)
    .maybeSingle();
  return data ?? null;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function getInvoicesByIds(ids: string[]): Promise<Map<string, Invoice>> {
  if (ids.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase.from("invoices").select("*").in("id", ids);
  if (error) throw new Error(error.message);
  return new Map((data ?? []).map((invoice) => [invoice.id, invoice]));
}

export async function getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type InvoiceStats = {
  total: number;
  sent: number;
  totalDue: number;
  totalPaid: number;
};

export async function getInvoiceStats(): Promise<InvoiceStats> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("status, due_amount, paid_amount")
    .eq("is_latest", true);
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  return {
    total: rows.length,
    sent: rows.filter((r) => r.status !== "draft").length,
    totalDue: rows.reduce((sum, r) => sum + Number(r.due_amount), 0),
    totalPaid: rows.reduce((sum, r) => sum + Number(r.paid_amount), 0),
  };
}
