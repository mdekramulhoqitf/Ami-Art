"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";
import { uploadImage, deleteImage } from "@/lib/supabase/storage";
import { heroSlideSchema, validateImageFile } from "@/lib/validation";
import type { Database } from "@/lib/types";

type HeroSlideUpdate = Database["public"]["Tables"]["hero_slides"]["Update"];

export type HeroSlideFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseFormData(formData: FormData) {
  return heroSlideSchema.safeParse({
    title: formData.get("title") || undefined,
    subtitle: formData.get("subtitle") || undefined,
    cta_label: formData.get("cta_label") || undefined,
    cta_url: formData.get("cta_url") || undefined,
    alt_text: formData.get("alt_text") || undefined,
    display_order: formData.get("display_order") || 0,
    is_active: formData.get("is_active") === "on",
  });
}

export async function createHeroSlide(
  _prevState: HeroSlideFormState,
  formData: FormData
): Promise<HeroSlideFormState> {
  await requireUser();

  const validated = parseFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const file = formData.get("image") as File | null;
  const imageError = validateImageFile(file);
  if (imageError || !file || file.size === 0) {
    return { message: imageError ?? "একটি ছবি আবশ্যক।" };
  }

  const mobileFile = formData.get("mobile_image") as File | null;
  const mobileImageError = validateImageFile(mobileFile);
  if (mobileImageError) return { message: mobileImageError };

  const supabase = await createClient();
  const imageUrl = await uploadImage(supabase, "hero-sliders", file);
  const mobileImageUrl =
    mobileFile && mobileFile.size > 0 ? await uploadImage(supabase, "hero-sliders", mobileFile) : null;

  const { error } = await supabase.from("hero_slides").insert({
    ...validated.data,
    image_url: imageUrl,
    mobile_image_url: mobileImageUrl,
  });

  if (error) return { message: "ব্যানারটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" };

  revalidatePath("/admin/slider");
  revalidatePath("/");
  redirect("/admin/slider");
}

export async function updateHeroSlide(
  id: string,
  _prevState: HeroSlideFormState,
  formData: FormData
): Promise<HeroSlideFormState> {
  await requireUser();

  const validated = parseFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const file = formData.get("image") as File | null;
  const imageError = validateImageFile(file);
  if (imageError) return { message: imageError };

  const mobileFile = formData.get("mobile_image") as File | null;
  const mobileImageError = validateImageFile(mobileFile);
  if (mobileImageError) return { message: mobileImageError };

  const supabase = await createClient();

  const update: HeroSlideUpdate = { ...validated.data };

  if ((file && file.size > 0) || (mobileFile && mobileFile.size > 0)) {
    const { data: existing } = await supabase
      .from("hero_slides")
      .select("image_url, mobile_image_url")
      .eq("id", id)
      .maybeSingle();

    if (file && file.size > 0) {
      update.image_url = await uploadImage(supabase, "hero-sliders", file);
      if (existing?.image_url) await deleteImage(supabase, "hero-sliders", existing.image_url);
    }
    if (mobileFile && mobileFile.size > 0) {
      update.mobile_image_url = await uploadImage(supabase, "hero-sliders", mobileFile);
      if (existing?.mobile_image_url) await deleteImage(supabase, "hero-sliders", existing.mobile_image_url);
    }
  }

  const { error } = await supabase.from("hero_slides").update(update).eq("id", id);
  if (error) return { message: "ব্যানারটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" };

  revalidatePath("/admin/slider");
  revalidatePath("/");
  redirect("/admin/slider");
}

export async function removeHeroSlideMobileImage(id: string) {
  await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("hero_slides")
    .select("mobile_image_url")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("hero_slides").update({ mobile_image_url: null }).eq("id", id);
  if (existing?.mobile_image_url) await deleteImage(supabase, "hero-sliders", existing.mobile_image_url);

  revalidatePath("/admin/slider");
  revalidatePath("/");
}

export async function deleteHeroSlide(id: string) {
  await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("hero_slides")
    .select("image_url, mobile_image_url")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("hero_slides").delete().eq("id", id);
  if (existing?.image_url) await deleteImage(supabase, "hero-sliders", existing.image_url);
  if (existing?.mobile_image_url) await deleteImage(supabase, "hero-sliders", existing.mobile_image_url);

  revalidatePath("/admin/slider");
  revalidatePath("/");
}

export async function toggleHeroSlideActive(id: string, isActive: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("hero_slides").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/slider");
  revalidatePath("/");
}

export async function duplicateHeroSlide(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { data: existing } = await supabase.from("hero_slides").select("*").eq("id", id).maybeSingle();
  if (!existing) return;

  await supabase.from("hero_slides").insert({
    image_url: existing.image_url,
    mobile_image_url: existing.mobile_image_url,
    alt_text: existing.alt_text,
    title: existing.title ? `${existing.title} (কপি)` : existing.title,
    subtitle: existing.subtitle,
    cta_label: existing.cta_label,
    cta_url: existing.cta_url,
    is_active: existing.is_active,
    display_order: existing.display_order,
  });

  revalidatePath("/admin/slider");
}
