import { cache } from "react";
import { createAnonClient, createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types";

export const getActiveServices = cache(async (): Promise<Service[]> => {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
});

export async function getAllServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getServiceById(id: string): Promise<Service | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}
