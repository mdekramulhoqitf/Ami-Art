"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";
import { whyChooseUsItemSchema } from "@/lib/validation";

export type WhyChooseUsFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseFormData(formData: FormData) {
  return whyChooseUsItemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    icon: formData.get("icon") || undefined,
    is_active: formData.get("is_active") === "on",
    display_order: formData.get("display_order") || 0,
  });
}

// New table from supabase/migrations/0006_faq_why_choose_us.sql. See the
// matching comment in admin/faq/actions.ts — PGRST205 means the migration
// hasn't run yet, surfaced as a clear instruction instead of a raw code.
function friendlySaveError(error: { code?: string; message?: string } | null) {
  if (error?.code === "PGRST205") {
    return "Why Choose Us টেবিলটি এখনও তৈরি হয়নি। supabase/migrations/0006_faq_why_choose_us.sql মাইগ্রেশনটি Supabase SQL Editor-এ চালান।";
  }
  return error?.message
    ? `সুবিধাটি সংরক্ষণ করা যায়নি: ${error.message}`
    : "সুবিধাটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।";
}

export async function createWhyChooseUsItem(
  _prevState: WhyChooseUsFormState,
  formData: FormData
): Promise<WhyChooseUsFormState> {
  await requireUser();

  const validated = parseFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("why_choose_us_items").insert(validated.data);
  if (error) return { message: friendlySaveError(error) };

  revalidatePath("/admin/why-choose-us");
  revalidatePath("/");
  redirect("/admin/why-choose-us");
}

export async function updateWhyChooseUsItem(
  id: string,
  _prevState: WhyChooseUsFormState,
  formData: FormData
): Promise<WhyChooseUsFormState> {
  await requireUser();

  const validated = parseFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("why_choose_us_items").update(validated.data).eq("id", id);
  if (error) return { message: friendlySaveError(error) };

  revalidatePath("/admin/why-choose-us");
  revalidatePath("/");
  redirect("/admin/why-choose-us");
}

export async function deleteWhyChooseUsItem(id: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("why_choose_us_items").delete().eq("id", id);
  revalidatePath("/admin/why-choose-us");
  revalidatePath("/");
}

export async function toggleWhyChooseUsActive(id: string, isActive: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("why_choose_us_items").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/why-choose-us");
  revalidatePath("/");
}
