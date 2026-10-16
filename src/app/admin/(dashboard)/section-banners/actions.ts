"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getUploadedImageUrl, deleteImage } from "@/lib/supabase/storage";
import { sectionBannerSchema } from "@/lib/validation";
import type { Database, SectionBannerSlug } from "@/lib/types";

type SectionBannerInsert = Database["public"]["Tables"]["section_banners"]["Insert"];

export type SectionBannerFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

// Every public page this banner can appear on, so a save always shows up
// immediately without waiting for the homepage's 60s ISR window.
const SLUG_PUBLIC_PATHS: Record<SectionBannerSlug, string> = {
  about: "/about",
  services: "/services",
  portfolio: "/portfolio",
  why_choose_us: "/",
  contact: "/contact",
};

function revalidateForSlug(slug: string) {
  revalidatePath("/admin/section-banners");
  const path = SLUG_PUBLIC_PATHS[slug as SectionBannerSlug];
  if (path) revalidatePath(path);
}

export async function updateSectionBanner(
  slug: string,
  _prevState: SectionBannerFormState,
  formData: FormData
): Promise<SectionBannerFormState> {
  await requireUser();

  const validated = sectionBannerSchema.safeParse({
    title: formData.get("title") ?? "",
    short_description: formData.get("short_description") ?? "",
    detailed_description: formData.get("detailed_description") ?? "",
    alt_text: formData.get("alt_text") ?? "",
    image_position: formData.get("image_position") || "center",
    overlay_enabled: formData.get("overlay_enabled") === "on",
    overlay_style: formData.get("overlay_style") || "dark",
    is_visible: formData.get("is_visible") === "on",
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "নিচের ভুলগুলো ঠিক করুন।",
      success: false,
    };
  }

  const imageUrl = getUploadedImageUrl(formData, "image", "about");

  const supabase = await createClient();
  // Optional text fields: an intentionally-cleared field must overwrite the
  // stored value with null, not be silently dropped from the upsert payload
  // (a dropped/undefined key leaves the previous value untouched instead).
  const { title, short_description, detailed_description, alt_text, ...rest } = validated.data;
  const update: SectionBannerInsert = {
    slug,
    ...rest,
    title: title || null,
    short_description: short_description || null,
    detailed_description: detailed_description || null,
    alt_text: alt_text || null,
  };

  if (imageUrl) {
    const { data: existing } = await supabase
      .from("section_banners")
      .select("image_url")
      .eq("slug", slug)
      .maybeSingle();
    update.image_url = imageUrl;
    if (existing?.image_url && existing.image_url !== imageUrl) {
      await deleteImage(supabase, "about", existing.image_url);
    }
  }

  const { error } = await supabase.from("section_banners").upsert(update);
  if (error) {
    console.error("[updateSectionBanner] failed:", error);
    return { message: `সংরক্ষণ করা যায়নি: ${error.message}`, success: false };
  }

  revalidateForSlug(slug);
  return { message: "কভার ছবি সফলভাবে হালনাগাদ হয়েছে।", success: true };
}

export async function removeSectionBannerImage(slug: string) {
  await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("section_banners")
    .select("image_url")
    .eq("slug", slug)
    .maybeSingle();

  await supabase.from("section_banners").update({ image_url: null, image_path: null }).eq("slug", slug);
  if (existing?.image_url) await deleteImage(supabase, "about", existing.image_url);

  revalidateForSlug(slug);
}
