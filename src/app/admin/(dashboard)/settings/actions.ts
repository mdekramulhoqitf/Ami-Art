"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import { siteSettingsSchema, deliverySettingsSchema } from "@/lib/validation";

export type SiteSettingsFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

function parseJsonArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((i) => i.title || i.description) : [];
  } catch {
    return [];
  }
}

export async function updateSiteSettings(
  _prevState: SiteSettingsFormState,
  formData: FormData
): Promise<SiteSettingsFormState> {
  await requireUser();

  const validated = siteSettingsSchema.safeParse({
    business_name: formData.get("business_name"),
    tagline: formData.get("tagline"),
    intro_heading: formData.get("intro_heading"),
    intro_body: formData.get("intro_body"),
    meta_title: formData.get("meta_title"),
    meta_description: formData.get("meta_description"),
    trust_badges: parseJsonArray(formData.get("trust_badges")),
    capability_highlights: parseJsonArray(formData.get("capability_highlights")),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "নিচের ভুলগুলো ঠিক করুন।",
      success: false,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({ id: 1, ...validated.data });
  if (error) return { message: "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।", success: false };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { message: "সেটিংস সফলভাবে হালনাগাদ হয়েছে।", success: true };
}

export type DeliverySettingsFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function updateDeliverySettings(
  _prevState: DeliverySettingsFormState,
  formData: FormData
): Promise<DeliverySettingsFormState> {
  await requireUser();

  const validated = deliverySettingsSchema.safeParse({
    courier_fee: formData.get("courier_fee") || 0,
    local_delivery_fee: formData.get("local_delivery_fee") || 0,
    free_delivery_threshold: formData.get("free_delivery_threshold") || undefined,
    enabled: formData.get("enabled") === "on",
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "নিচের ভুলগুলো ঠিক করুন।",
      success: false,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    delivery_settings: {
      courier_fee: validated.data.courier_fee,
      local_delivery_fee: validated.data.local_delivery_fee,
      free_delivery_threshold: validated.data.free_delivery_threshold ?? null,
      enabled: validated.data.enabled,
    },
  });
  if (error) return { message: "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।", success: false };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { message: "ডেলিভারি সেটিংস হালনাগাদ হয়েছে।", success: true };
}
