import { createClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/lib/types";

export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUnreadMessageCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);
  return count ?? 0;
}
