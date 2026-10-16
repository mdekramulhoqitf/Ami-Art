"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { orderReplySchema } from "@/lib/validation";

export type ReplyState = {
  success: boolean;
  message?: string;
};

export async function addCustomerReply(
  token: string,
  _prevState: ReplyState,
  formData: FormData
): Promise<ReplyState> {
  const validated = orderReplySchema.safeParse({ message: formData.get("message") });
  if (!validated.success) {
    return { success: false, message: "মেসেজ লিখুন।" };
  }

  let data;
  try {
    const supabase = await createClient();
    const result = await supabase.rpc("add_customer_reply", {
      p_token: token,
      p_message: validated.data.message,
    });
    if (result.error) throw result.error;
    data = result.data;
  } catch {
    return { success: false, message: "মেসেজ পাঠানো যায়নি। আবার চেষ্টা করুন।" };
  }

  if (!data) {
    return { success: false, message: "মেসেজ পাঠানো যায়নি। আবার চেষ্টা করুন।" };
  }

  revalidatePath(`/order/status/${token}`);
  return { success: true };
}

export type GenerateReferralCodeState = {
  success: boolean;
  referralCode?: string;
  message?: string;
};

export async function generateReferralCode(token: string): Promise<GenerateReferralCodeState> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("generate_referral_code_by_token", { p_token: token });
    if (error) throw error;
    if (!data) return { success: false, message: "Referral Code তৈরি করা যায়নি।" };
    revalidatePath(`/order/status/${token}`);
    return { success: true, referralCode: data };
  } catch {
    return { success: false, message: "Referral Code তৈরি করা যায়নি। আবার চেষ্টা করুন।" };
  }
}
