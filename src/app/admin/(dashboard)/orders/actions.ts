"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getSignedOrderFileUrl } from "@/lib/supabase/storage";
import { orderReplySchema } from "@/lib/validation";
import type { OrderStatus } from "@/lib/types";

export type AdminReplyState = {
  success: boolean;
  message?: string;
};

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function markOrderRead(id: string, isRead: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("orders").update({ is_read: isRead }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function archiveOrder(id: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("orders").update({ is_archived: true }).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function sendAdminReply(
  orderId: string,
  _prevState: AdminReplyState,
  formData: FormData
): Promise<AdminReplyState> {
  await requireUser();

  const validated = orderReplySchema.safeParse({ message: formData.get("message") });
  if (!validated.success) {
    return { success: false, message: "মেসেজ লিখুন।" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("order_messages").insert({
    order_id: orderId,
    sender_type: "admin",
    message: validated.data.message,
  });

  if (error) {
    return { success: false, message: "মেসেজ পাঠানো যায়নি। আবার চেষ্টা করুন।" };
  }

  await supabase.from("orders").update({ updated_at: new Date().toISOString() }).eq("id", orderId);

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function getFileDownloadUrl(path: string): Promise<string | null> {
  await requireUser();
  const supabase = await createClient();
  return getSignedOrderFileUrl(supabase, path, 120);
}
