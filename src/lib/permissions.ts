import { createClient, requireUser } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/types";

export type Capability =
  | "view_businesses"
  | "create_businesses"
  | "edit_businesses"
  | "archive_businesses"
  | "view_leads"
  | "manage_leads"
  | "view_customers"
  | "manage_customers"
  | "view_quotations"
  | "create_quotations"
  | "view_orders"
  | "manage_orders"
  | "view_revenue"
  | "manage_campaigns"
  | "manage_content"
  | "manage_settings"
  | "manage_users";

/**
 * Static capability matrix — every role's access is a fixed, readable list,
 * not a computed/inferred score. "owner" is the only role with revenue
 * visibility and user management; the other three roles never see those
 * capabilities regardless of which page they can reach.
 */
const ROLE_CAPABILITIES: Record<AdminRole, Capability[] | "all"> = {
  owner: "all",
  staff: [
    "view_businesses",
    "create_businesses",
    "edit_businesses",
    "view_leads",
    "manage_leads",
    "view_customers",
    "manage_customers",
    "view_quotations",
    "create_quotations",
    "view_orders",
    "manage_orders",
  ],
  marketing: [
    "view_businesses",
    "create_businesses",
    "edit_businesses",
    "view_leads",
    "manage_leads",
    "manage_campaigns",
    "manage_content",
  ],
  sales: [
    "view_businesses",
    "create_businesses",
    "edit_businesses",
    "view_leads",
    "manage_leads",
    "view_customers",
    "manage_customers",
    "view_quotations",
    "create_quotations",
    "view_orders",
  ],
};

/**
 * A signed-in admin with no `admin_roles` row is treated as "owner" — this
 * is a deliberate fail-open default so the existing single admin account
 * (which predates this table) keeps its current full access. To actually
 * restrict someone, an owner must explicitly insert a restricted role row
 * for them; the absence of a row is never itself a restriction.
 */
export async function getCurrentAdminRole(): Promise<AdminRole> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("admin_id", user.id)
    .maybeSingle();
  return data?.role ?? "owner";
}

export function roleHasCapability(role: AdminRole, capability: Capability): boolean {
  const allowed = ROLE_CAPABILITIES[role];
  return allowed === "all" || allowed.includes(capability);
}

/**
 * Server-action / page guard. Always checks the *current* session and role
 * server-side — never trust a client-side "can I see this button" check as
 * the actual enforcement, per the project's security rule.
 */
export async function requireCapability(capability: Capability) {
  const user = await requireUser();
  const role = await getCurrentAdminRole();
  if (!roleHasCapability(role, capability)) {
    throw new Error(`FORBIDDEN: role "${role}" is missing capability "${capability}"`);
  }
  return { user, role };
}
