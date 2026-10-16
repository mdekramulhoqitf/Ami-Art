"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import { uploadImage, deleteImage } from "@/lib/supabase/storage";
import { validateImageFile } from "@/lib/validation";
import type { Database } from "@/lib/types";

type LogosUpdate = Database["public"]["Tables"]["logos"]["Update"];

export type LogoFormState = {
  message?: string;
  success?: boolean;
};

const FIELDS = [
  { form: "primary_logo", column: "primary_logo_url" },
  { form: "light_logo", column: "light_logo_url" },
  { form: "dark_logo", column: "dark_logo_url" },
  { form: "favicon", column: "favicon_url" },
] as const;

export async function updateLogos(
  _prevState: LogoFormState,
  formData: FormData
): Promise<LogoFormState> {
  await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase.from("logos").select("*").eq("id", 1).maybeSingle();
  const update: LogosUpdate = {};
  let hasUpdate = false;

  for (const field of FIELDS) {
    const file = formData.get(field.form) as File | null;
    if (!file || file.size === 0) continue;

    const imageError = validateImageFile(file);
    if (imageError) return { message: imageError, success: false };

    const url = await uploadImage(supabase, "logos", file);
    update[field.column] = url;
    hasUpdate = true;

    const oldUrl = existing?.[field.column as keyof typeof existing] as string | null | undefined;
    if (oldUrl) await deleteImage(supabase, "logos", oldUrl);
  }

  if (!hasUpdate) {
    return { message: "আপলোড করতে অন্তত একটি ছবি নির্বাচন করুন।", success: false };
  }

  const { error } = await supabase.from("logos").upsert({ id: 1, ...update });
  if (error) return { message: "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।", success: false };

  revalidatePath("/admin/logo");
  revalidatePath("/", "layout");
  return { message: "ব্র্যান্ডিং সফলভাবে হালনাগাদ হয়েছে।", success: true };
}

export async function removeLogoAsset(column: (typeof FIELDS)[number]["column"]) {
  await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase.from("logos").select("*").eq("id", 1).maybeSingle();
  const oldUrl = existing?.[column as keyof typeof existing] as string | null | undefined;
  if (oldUrl) await deleteImage(supabase, "logos", oldUrl);

  const update: LogosUpdate = { id: 1, [column]: null };
  await supabase.from("logos").upsert(update);

  revalidatePath("/admin/logo");
  revalidatePath("/", "layout");
}
