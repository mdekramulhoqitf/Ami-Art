import { createAnonClient, createClient } from "@/lib/supabase/server";
import type { PortfolioItem } from "@/lib/types";

export async function getActivePortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getFeaturedPortfolioItems(limit = 6): Promise<PortfolioItem[]> {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getAllPortfolioItems(): Promise<PortfolioItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPortfolioItemById(id: string): Promise<PortfolioItem | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("portfolio_items").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}
