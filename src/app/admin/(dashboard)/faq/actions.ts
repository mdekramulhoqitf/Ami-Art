"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";
import { faqItemSchema } from "@/lib/validation";

export type FaqFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseFormData(formData: FormData) {
  return faqItemSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    is_active: formData.get("is_active") === "on",
    display_order: formData.get("display_order") || 0,
  });
}

// New table from supabase/migrations/0006_faq_why_choose_us.sql. Until that
// migration is actually run, faq_items doesn't exist at all — PostgREST
// returns PGRST205 ("Could not find the table 'public.faq_items' in the
// schema cache") for every read/write. Surface that as a clear instruction
// instead of a raw error code the admin can't act on.
function friendlySaveError(error: { code?: string; message?: string } | null) {
  if (error?.code === "PGRST205") {
    return "FAQ টেবিলটি এখনও তৈরি হয়নি। supabase/migrations/0006_faq_why_choose_us.sql মাইগ্রেশনটি Supabase SQL Editor-এ চালান।";
  }
  return error?.message
    ? `প্রশ্নটি সংরক্ষণ করা যায়নি: ${error.message}`
    : "প্রশ্নটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।";
}

export async function createFaqItem(
  _prevState: FaqFormState,
  formData: FormData
): Promise<FaqFormState> {
  await requireUser();

  const validated = parseFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("faq_items").insert(validated.data);
  if (error) return { message: friendlySaveError(error) };

  revalidatePath("/admin/faq");
  revalidatePath("/");
  redirect("/admin/faq");
}

export async function updateFaqItem(
  id: string,
  _prevState: FaqFormState,
  formData: FormData
): Promise<FaqFormState> {
  await requireUser();

  const validated = parseFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("faq_items").update(validated.data).eq("id", id);
  if (error) return { message: friendlySaveError(error) };

  revalidatePath("/admin/faq");
  revalidatePath("/");
  redirect("/admin/faq");
}

export async function deleteFaqItem(id: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("faq_items").delete().eq("id", id);
  revalidatePath("/admin/faq");
  revalidatePath("/");
}

export async function toggleFaqActive(id: string, isActive: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("faq_items").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/faq");
  revalidatePath("/");
}
