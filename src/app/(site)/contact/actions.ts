"use server";

import { createClient } from "@/lib/supabase/server";
import { contactFormSchema } from "@/lib/validation";

export type ContactFormState = {
  success: boolean;
  message?: string;
  errors?: Partial<Record<"name" | "contact" | "service" | "message", string[]>>;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validated = contactFormSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    service: formData.get("service") || undefined,
    message: formData.get("message"),
  });

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "নিচের তথ্যগুলো একটু ঠিক করে দিন।",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: validated.data.name,
      contact: validated.data.contact,
      service: validated.data.service ?? null,
      message: validated.data.message,
    });

    if (error) {
      return {
        success: false,
        message: "মেসেজ পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা সরাসরি ফোন করুন।",
      };
    }

    return { success: true, message: "ধন্যবাদ — আপনার মেসেজ পাঠানো হয়েছে। শীঘ্রই আমরা যোগাযোগ করব।" };
  } catch {
    return {
      success: false,
      message: "মেসেজ পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা সরাসরি ফোন করুন।",
    };
  }
}
