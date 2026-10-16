import { createClient } from "@/lib/supabase/server";
import type { Order, OrderAttachment, OrderMessage, OrderStatus } from "@/lib/types";

export type OrderFilters = {
  search?: string;
  status?: OrderStatus;
  serviceId?: string;
};

export async function getOrders(filters: OrderFilters = {}): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.serviceId) {
    query = query.eq("service_id", filters.serviceId);
  }
  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      `customer_name.ilike.%${term}%,phone.ilike.%${term}%,order_number.ilike.%${term}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export type CustomerHub = {
  customerId: string;
  customerNumber: string;
  customerName: string;
  businessName: string | null;
  phone: string;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
};

/** Token-gated — identity proven via the order's own access_token, same
    model as get_order_by_token: no customer login exists, so any customer
    surface must derive who's asking from an order they already hold.
    Returns null on any error/missing token — this is a convenience layer
    over one specific order's page, never something that should break it. */
export async function getCustomerHubByToken(token: string): Promise<CustomerHub | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_customer_hub_by_token", { p_token: token });
  if (error || !data || data.length === 0) return null;
  const row = data[0];
  return {
    customerId: row.out_customer_id,
    customerNumber: row.out_customer_number,
    customerName: row.out_customer_name,
    businessName: row.out_business_name,
    phone: row.out_phone,
    totalOrders: row.out_total_orders,
    activeOrders: row.out_active_orders,
    completedOrders: row.out_completed_orders,
  };
}

export type CustomerRecentOrder = {
  orderNumber: string;
  accessToken: string;
  serviceLabel: string;
  status: OrderStatus;
  createdAt: string;
  invoiceTotal: number | null;
  invoiceDue: number | null;
};

export async function getCustomerRecentOrdersByToken(token: string, limit = 5): Promise<CustomerRecentOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_customer_recent_orders_by_token", {
    p_token: token,
    p_limit: limit,
  });
  if (error || !data) return [];
  return data.map((row) => ({
    orderNumber: row.out_order_number,
    accessToken: row.out_access_token,
    serviceLabel: row.out_service_label,
    status: row.out_status as OrderStatus,
    createdAt: row.out_created_at,
    invoiceTotal: row.out_invoice_total,
    invoiceDue: row.out_invoice_due,
  }));
}

export type ReorderData = {
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string | null;
  businessName: string | null;
  serviceId: string | null;
  serviceLabel: string;
  description: string;
  quantity: string | null;
  customFields: Record<string, unknown> | null;
};

/** Token-gated — same identity model as get_order_by_token: the order's
    own access_token proves this is the customer's own order, no login
    exists. Returns null on any error/missing token rather than throwing —
    a reorder prefill is a convenience, never something that should break
    the order form if it fails. */
export async function getReorderDataByToken(token: string): Promise<ReorderData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_reorder_data_by_token", { p_token: token });
  if (error || !data || data.length === 0) return null;
  const row = data[0];
  return {
    orderNumber: row.out_order_number,
    customerName: row.out_customer_name,
    phone: row.out_phone,
    email: row.out_email,
    address: row.out_address,
    businessName: row.out_business_name,
    serviceId: row.out_service_id,
    serviceLabel: row.out_service_label,
    description: row.out_description,
    quantity: row.out_quantity,
    customFields: (row.out_custom_fields as Record<string, unknown>) ?? null,
  };
}

export async function getOrderAttachments(orderId: string): Promise<OrderAttachment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_attachments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrderMessages(orderId: string): Promise<OrderMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_messages")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUnreadOrderCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .eq("is_archived", false);
  return count ?? 0;
}

export async function getOrderStatusCounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("status")
    .eq("is_archived", false);
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const countWhere = (statuses: OrderStatus[]) =>
    rows.filter((r) => statuses.includes(r.status)).length;

  return {
    new: countWhere(["new"]),
    pending: countWhere(["new", "viewed", "contacted"]),
    inProgress: countWhere(["in_progress"]),
    completed: countWhere(["completed"]),
    total: rows.length,
  };
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type RecentCustomerMessage = OrderMessage & {
  order_number: string;
  customer_name: string;
};

export async function getRecentCustomerMessages(limit = 5): Promise<RecentCustomerMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_messages")
    .select("*, orders!inner(order_number, customer_name)")
    .eq("sender_type", "customer")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = (row as any).orders as { order_number: string; customer_name: string };
    return {
      ...(row as OrderMessage),
      order_number: orders.order_number,
      customer_name: orders.customer_name,
    };
  });
}
