"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";
import { uploadImage, deleteImage } from "@/lib/supabase/storage";
import { serviceSchema, validateImageFile } from "@/lib/validation";
import type { Database } from "@/lib/types";

type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];
type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];

export type ServiceFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseFormData(formData: FormData) {
  return serviceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    price: formData.get("price") || undefined,
    category: formData.get("category") || undefined,
    image_alt: formData.get("image_alt") || undefined,
    aspect_ratio: formData.get("aspect_ratio") || "standard-4-3",
    custom_width: formData.get("custom_width") || undefined,
    custom_height: formData.get("custom_height") || undefined,
    display_order: formData.get("display_order") || 0,
    is_active: formData.get("is_active") === "on",
    service_type: formData.get("service_type") || "physical",
    product_category: formData.get("product_category") || "print_other",
    requires_delivery: formData.get("requires_delivery") === "on",
    pricing_model: formData.get("pricing_model") || "CUSTOM",
    rate: formData.get("rate") || undefined,
    design_fee: formData.get("design_fee") || 0,
    source_file_fee: formData.get("source_file_fee") || 0,
    minimum_charge: formData.get("minimum_charge") || undefined,
    minimum_quantity: formData.get("minimum_quantity") || undefined,
  });
}

// Fields from supabase/migrations/0004_pricing_engine.sql. Until that
// migration is actually run against the live database, these columns don't
// exist — sending them in an insert/update/upsert makes PostgREST reject
// the whole row, which used to surface as a useless generic failure and
// silently blocked saving *every* field, not just pricing. Stripping them
// on that specific error keeps core service editing working regardless of
// migration timing; pricing config saves the moment the migration is
// applied, no code change needed then.
//
// PostgREST returns PGRST204 ("Could not find the 'X' column of 'Y' in the
// schema cache") for an insert/update whose JSON body references a column
// its schema cache doesn't know about — this is the code that actually
// fires for a real admin save. 42703 is the raw Postgres "column does not
// exist" error, which only ever surfaces on a plain select — kept here too
// as a defensive fallback, not the primary case.
const PENDING_MIGRATION_COLUMNS = [
  "pricing_model",
  "rate",
  "design_fee",
  "source_file_fee",
  "minimum_charge",
  "minimum_quantity",
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

function stripPricingFields<T extends Record<string, unknown>>(data: T): T {
  const copy = { ...data };
  for (const col of PENDING_MIGRATION_COLUMNS) delete copy[col as keyof T];
  return copy;
}

function friendlySaveError(error: { code?: string; message?: string } | null) {
  if (error?.code === "23505") return "এই নামে ইতিমধ্যে একটি সেবা আছে।";
  // Admin-only screen — safe to surface the real reason instead of a dead-end
  // generic message that gives no way to diagnose the actual failure.
  return error?.message
    ? `সেবাটি সংরক্ষণ করা যায়নি: ${error.message}`
    : "সেবাটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।";
}

export async function createService(
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await requireUser();

  const validated = parseFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const file = formData.get("image") as File | null;
  const imageError = validateImageFile(file);
  if (imageError) return { message: imageError };

  const supabase = await createClient();
  const insert: ServiceInsert = { ...validated.data };

  if (file && file.size > 0) {
    insert.image_url = await uploadImage(supabase, "services", file);
  }

  let { error } = await supabase.from("services").insert(insert);
  if (isPendingMigrationColumnError(error)) {
    ({ error } = await supabase.from("services").insert(stripPricingFields(insert)));
  }
  if (error) return { message: friendlySaveError(error) };

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/services");
}

export async function updateService(
  id: string,
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await requireUser();

  const validated = parseFormData(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: "নিচের ভুলগুলো ঠিক করুন।" };
  }

  const file = formData.get("image") as File | null;
  const imageError = validateImageFile(file);
  if (imageError) return { message: imageError };

  const supabase = await createClient();
  const update: ServiceUpdate = { ...validated.data };

  if (file && file.size > 0) {
    const { data: existing } = await supabase
      .from("services")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    update.image_url = await uploadImage(supabase, "services", file);
    if (existing?.image_url) await deleteImage(supabase, "services", existing.image_url);
  }

  let { error } = await supabase.from("services").update(update).eq("id", id);
  if (isPendingMigrationColumnError(error)) {
    ({ error } = await supabase.from("services").update(stripPricingFields(update)).eq("id", id));
  }
  if (error) return { message: friendlySaveError(error) };

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/services");
}

export async function deleteService(id: string) {
  await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("services")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("services").delete().eq("id", id);
  if (existing?.image_url) await deleteImage(supabase, "services", existing.image_url);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("services").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}
