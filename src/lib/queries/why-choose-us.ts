import { createAnonClient, createClient } from "@/lib/supabase/server";
import type { WhyChooseUsItem } from "@/lib/types";

export async function getActiveWhyChooseUsItems(): Promise<WhyChooseUsItem[]> {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("why_choose_us_items")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getAllWhyChooseUsItems(): Promise<WhyChooseUsItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("why_choose_us_items")
    .select("*")
    .order("display_order", { ascending: true });
  // Throw a real Error (not the raw PostgREST error object) — Next.js's
  // RSC error boundary handles a genuine Error instance far faster and
  // more predictably in dev mode than an arbitrary thrown object.
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getWhyChooseUsItemById(id: string): Promise<WhyChooseUsItem | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("why_choose_us_items").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}
