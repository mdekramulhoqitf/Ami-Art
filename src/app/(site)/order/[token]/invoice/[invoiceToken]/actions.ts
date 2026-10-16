"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RedeemRewardState = {
  success: boolean;
  amount?: number;
  message?: string;
};

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

const MESSAGE_MAP: Record<string, string> = {
  order_not_found: "অর্ডারটি পাওয়া যায়নি।",
  order_cancelled: "এই অর্ডারটি বাতিল হয়ে গেছে।",
  no_customer: "Reward প্রযোজ্য নয়।",
  no_due_amount: "এই ইনভয়েসে কোনো বকেয়া নেই।",
  no_balance: "আপনার কোনো ব্যবহারযোগ্য Reward নেই।",
  already_redeemed: "এই অর্ডারে ইতিমধ্যে Reward ব্যবহার করা হয়েছে।",
};

export async function redeemReward(orderToken: string, invoiceToken: string): Promise<RedeemRewardState> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("redeem_reward_by_token", { p_token: orderToken });
    if (error) throw error;
    if (!data || data.length === 0) {
      return { success: false, message: "Reward ব্যবহার করা যায়নি। আবার চেষ্টা করুন।" };
    }

    const result = data[0];
    if (!result.out_success) {
      // below_minimum needs the real configured threshold + the customer's
      // untouched balance in the sentence — built here instead of a static
      // MESSAGE_MAP entry so ৳300 is never hardcoded outside reward_rules.
      if (result.out_message === "below_minimum") {
        return {
          success: false,
          message: `রিডিম করতে কমপক্ষে ${formatTaka(result.out_min_redemption)} রিওয়ার্ড প্রয়োজন। আপনার বর্তমান ব্যালেন্স ${formatTaka(result.out_new_available)} অপরিবর্তিত আছে।`,
        };
      }
      return { success: false, message: MESSAGE_MAP[result.out_message] ?? "Reward ব্যবহার করা যায়নি।" };
    }

    revalidatePath(`/order/${orderToken}/invoice/${invoiceToken}`);
    revalidatePath(`/order/status/${orderToken}`);
    return { success: true, amount: result.out_amount };
  } catch {
    return { success: false, message: "Reward ব্যবহার করা যায়নি। আবার চেষ্টা করুন।" };
  }
}
