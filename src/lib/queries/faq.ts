import { createAnonClient, createClient } from "@/lib/supabase/server";
import type { FaqItem } from "@/lib/types";

export async function getActiveFaqItems(): Promise<FaqItem[]> {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("faq_items")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getAllFaqItems(): Promise<FaqItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faq_items")
    .select("*")
    .order("display_order", { ascending: true });
  // Throw a real Error (not the raw PostgREST error object) — Next.js's
  // RSC error boundary handles a genuine Error instance far faster and
  // more predictably in dev mode than an arbitrary thrown object.
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getFaqItemById(id: string): Promise<FaqItem | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("faq_items").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}
