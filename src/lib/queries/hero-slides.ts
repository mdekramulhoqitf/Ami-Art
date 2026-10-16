import { createAnonClient, createClient } from "@/lib/supabase/server";
import type { HeroSlide } from "@/lib/types";

export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getHeroSlideById(id: string): Promise<HeroSlide | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("hero_slides").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}
