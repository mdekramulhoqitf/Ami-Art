"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";
import { uploadImage, deleteImage } from "@/lib/supabase/storage";
import { portfolioItemSchema, validateImageFile } from "@/lib/validation";
import type { Database } from "@/lib/types";

type PortfolioUpdate = Database["public"]["Tables"]["portfolio_items"]["Update"];

export type PortfolioFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseFormData(formData: FormData) {
  return portfolioItemSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category") || undefined,
    description: formData.get("description") || undefined,
    alt_text: formData.get("alt_text") || undefined,
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
    display_order: formData.get("display_order") || 0,
  });
}

export async function createPortfolioItem(
  _prevState: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  await requireUser();

  const validated = parseFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const file = formData.get("image") as File | null;
  const imageError = validateImageFile(file);
  if (imageError || !file || file.size === 0) {
    return { message: imageError ?? "প্রকল্পের একটি ছবি আবশ্যক।" };
  }

  const supabase = await createClient();
  const imageUrl = await uploadImage(supabase, "portfolio", file);

  const { error } = await supabase.from("portfolio_items").insert({
    ...validated.data,
    image_url: imageUrl,
  });

  if (error) return { message: "প্রকল্পটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" };

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/portfolio");
}

export async function updatePortfolioItem(
  id: string,
  _prevState: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  await requireUser();

  const validated = parseFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const file = formData.get("image") as File | null;
  const imageError = validateImageFile(file);
  if (imageError) return { message: imageError };

  const supabase = await createClient();
  const update: PortfolioUpdate = { ...validated.data };

  if (file && file.size > 0) {
    const { data: existing } = await supabase
      .from("portfolio_items")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    update.image_url = await uploadImage(supabase, "portfolio", file);
    if (existing?.image_url) await deleteImage(supabase, "portfolio", existing.image_url);
  }

  const { error } = await supabase.from("portfolio_items").update(update).eq("id", id);
  if (error) return { message: "প্রকল্পটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" };

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/portfolio");
}

export async function deletePortfolioItem(id: string) {
  await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("portfolio_items")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("portfolio_items").delete().eq("id", id);
  if (existing?.image_url) await deleteImage(supabase, "portfolio", existing.image_url);

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
}

export async function togglePortfolioActive(id: string, isActive: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("portfolio_items").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
}

export async function togglePortfolioFeatured(id: string, isFeatured: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("portfolio_items").update({ is_featured: isFeatured }).eq("id", id);
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
}
