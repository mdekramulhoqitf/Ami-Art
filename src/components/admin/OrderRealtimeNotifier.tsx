"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { Order } from "@/lib/types";

/**
 * Subscribes to new-order INSERT events via Supabase Realtime so the admin
 * gets an immediate notification without polling. RLS on `orders` only
 * allows `authenticated` to SELECT, which Realtime enforces too — so this
 * only ever receives events while logged in.
 */
export function OrderRealtimeNotifier() {
  const { notify } = useToast();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as Order;
          notify({
            title: "🔔 নতুন অর্ডার",
            message: `${order.customer_name} একটি নতুন ${order.service_label} অর্ডার পাঠিয়েছেন।`,
            href: `/admin/orders/${order.id}`,
          });
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
