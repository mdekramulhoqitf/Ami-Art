"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCapability } from "@/lib/permissions";

export async function addCustomerNote(customerId: string, formData: FormData) {
  await requireCapability("manage_customers");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const supabase = await createClient();
  await supabase.from("activity_log").insert({
    customer_id: customerId,
    type: "note_added",
    body,
  });
  revalidatePath(`/admin/customers/${customerId}`);
}

export async function updateRewardRule(ruleKey: string, formData: FormData) {
  await requireCapability("manage_settings");
  const supabase = await createClient();

  const pointsRaw = formData.get("points");
  const rateRaw = formData.get("rate");
  const isActive = formData.get("is_active") === "on";

  await supabase
    .from("reward_rules")
    .update({
      points: pointsRaw !== null && pointsRaw !== "" ? Number(pointsRaw) : null,
      rate: rateRaw !== null && rateRaw !== "" ? Number(rateRaw) : null,
      is_active: isActive,
    })
    .eq("rule_key", ruleKey);

  revalidatePath("/admin/reward-rules");
}
