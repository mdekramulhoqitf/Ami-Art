import { createAnonClient, createClient } from "@/lib/supabase/server";
import type { SectionBanner, SectionBannerSlug } from "@/lib/types";

/** Public: only returns a banner that's genuinely visible with an image set.
 * Any error (including the table not existing yet) degrades to null so a
 * missing/pending migration never breaks the page — it just falls back to
 * the section's existing default look. */
export async function getActiveSectionBanner(slug: SectionBannerSlug): Promise<SectionBanner | null> {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("section_banners")
      .select("*")
      .eq("slug", slug)
      .eq("is_visible", true)
      .maybeSingle();
    if (!data?.image_url) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAllSectionBanners(): Promise<SectionBanner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("section_banners").select("*").order("slug", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSectionBannerBySlug(slug: string): Promise<SectionBanner | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("section_banners").select("*").eq("slug", slug).maybeSingle();
  return data ?? null;
}
