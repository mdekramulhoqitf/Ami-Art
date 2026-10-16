"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import { contactSettingsSchema } from "@/lib/validation";

export type ContactSettingsFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

function parseSocialLinks(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((i) => i.platform && i.url) : [];
  } catch {
    return [];
  }
}

export async function updateContactSettings(
  _prevState: ContactSettingsFormState,
  formData: FormData
): Promise<ContactSettingsFormState> {
  await requireUser();

  const validated = contactSettingsSchema.safeParse({
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    map_embed_url: formData.get("map_embed_url") || "",
    social_links: parseSocialLinks(formData.get("social_links")),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "নিচের ভুলগুলো ঠিক করুন।",
      success: false,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_settings").upsert({
    id: 1,
    ...validated.data,
    map_embed_url: validated.data.map_embed_url || null,
  });

  if (error) return { message: "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।", success: false };

  revalidatePath("/admin/contact");
  revalidatePath("/contact");
  revalidatePath("/", "layout");
  return { message: "যোগাযোগের তথ্য হালনাগাদ হয়েছে।", success: true };
}

export async function markMessageRead(id: string, isRead: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  revalidatePath("/admin/contact");
  revalidatePath("/admin");
}

export async function deleteMessage(id: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("contact_messages").delete().eq("id", id);
  revalidatePath("/admin/contact");
  revalidatePath("/admin");
}
