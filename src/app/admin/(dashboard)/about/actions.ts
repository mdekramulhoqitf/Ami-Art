"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getUploadedImageUrl, deleteImage } from "@/lib/supabase/storage";
import { aboutContentSchema } from "@/lib/validation";

export type AboutFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

// Fields from supabase/migrations/0005_owner_section.sql. Until that
// migration is actually run, these columns don't exist — sending them in an
// upsert makes PostgREST reject the *entire* write, which silently blocked
// saving every About field, not just the owner section. Stripping them on
// that specific error keeps core About editing working regardless of
// migration timing.
//
// PostgREST returns PGRST204 ("Could not find the 'X' column of 'Y' in the
// schema cache") for an insert/update/upsert whose JSON body references a
// column PostgREST's schema cache doesn't know about — this is the code
// that actually fires for a real admin save. 42703 is the raw Postgres
// "column does not exist" error, which only ever surfaces on a plain
// select — kept here too as a defensive fallback, not the primary case.
const PENDING_MIGRATION_COLUMNS = [
  "owner_image_url",
  "owner_name",
  "owner_designation",
  "owner_short_bio",
  "owner_bio",
  "owner_experience",
  "owner_location",
  "owner_phone",
  "owner_email",
  "owner_cta_text",
  "owner_cta_link",
  "owner_show",
] as const;

function isPendingMigrationColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error || !error.message) return false;
  const looksLikeMissingColumn =
    error.code === "PGRST204" ||
    error.code === "42703" ||
    /could not find.*column/i.test(error.message);
  if (!looksLikeMissingColumn) return false;
  return PENDING_MIGRATION_COLUMNS.some((col) => error.message?.includes(col));
}

function stripOwnerFields(data: Record<string, unknown>) {
  const copy = { ...data };
  for (const col of PENDING_MIGRATION_COLUMNS) delete copy[col];
  return copy;
}

function parseJsonArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((i) => i.title || i.description) : [];
  } catch {
    return [];
  }
}

export async function updateAboutContent(
  _prevState: AboutFormState,
  formData: FormData
): Promise<AboutFormState> {
  await requireUser();

  const validated = aboutContentSchema.safeParse({
    heading: formData.get("heading"),
    story: formData.get("story"),
    mission: formData.get("mission"),
    vision: formData.get("vision"),
    why_choose_us: parseJsonArray(formData.get("why_choose_us")),
    process_steps: parseJsonArray(formData.get("process_steps")),
    owner_name: formData.get("owner_name") || undefined,
    owner_designation: formData.get("owner_designation") || undefined,
    owner_short_bio: formData.get("owner_short_bio") || undefined,
    owner_bio: formData.get("owner_bio") || undefined,
    owner_experience: formData.get("owner_experience") || undefined,
    owner_location: formData.get("owner_location") || undefined,
    owner_phone: formData.get("owner_phone") || undefined,
    owner_email: formData.get("owner_email") || undefined,
    owner_cta_text: formData.get("owner_cta_text") || undefined,
    owner_cta_link: formData.get("owner_cta_link") || undefined,
    owner_show: formData.get("owner_show") === "on",
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "নিচের ভুলগুলো ঠিক করুন।",
      success: false,
    };
  }

  const imageUrl = getUploadedImageUrl(formData, "image", "about");
  const ownerImageUrl = getUploadedImageUrl(formData, "owner_image", "about");

  const supabase = await createClient();
  const update: Record<string, unknown> = { id: 1, ...validated.data };

  if (imageUrl) {
    const { data: existing } = await supabase
      .from("about_content")
      .select("image_url")
      .eq("id", 1)
      .maybeSingle();
    update.image_url = imageUrl;
    if (existing?.image_url && existing.image_url !== imageUrl) {
      await deleteImage(supabase, "about", existing.image_url);
    }
  }

  if (ownerImageUrl) {
    const { data: existing } = await supabase
      .from("about_content")
      .select("owner_image_url")
      .eq("id", 1)
      .maybeSingle();
    update.owner_image_url = ownerImageUrl;
    if (existing?.owner_image_url && existing.owner_image_url !== ownerImageUrl) {
      await deleteImage(supabase, "about", existing.owner_image_url);
    }
  }

  let { error } = await supabase.from("about_content").upsert(update);
  if (isPendingMigrationColumnError(error)) {
    ({ error } = await supabase.from("about_content").upsert(stripOwnerFields(update)));
  }
  if (error) {
    console.error("[updateAboutContent] failed:", error);
    return {
      message: `সংরক্ষণ করা যায়নি: ${error.message}`,
      success: false,
    };
  }

  revalidatePath("/admin/about");
  revalidatePath("/about");
  revalidatePath("/");
  return { message: "About পাতা সফলভাবে হালনাগাদ হয়েছে।", success: true };
}
