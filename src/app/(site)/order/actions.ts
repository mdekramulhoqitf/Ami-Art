"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { INCOMING_ORDER_FILE_PATH } from "@/lib/supabase/storage";
import { orderFormSchema, bannerFieldsSchema, validateOrderFileList, MAX_ORDER_FILES } from "@/lib/validation";
import { sendOrderNotificationEmail } from "@/lib/email";
import { calculateServicePrice, servicePricingConfig, type PricingOption } from "@/lib/pricing-engine";
import type { Json } from "@/lib/types";

/** Raw calculator inputs the client sends — never the computed total. The
 * server re-derives every price from the service's authoritative pricing
 * config so a tampered/forged total can never reach the database. */
type PricingInput = {
  widthValue?: number;
  heightValue?: number;
  unit?: "inch" | "feet" | "cm" | "mm";
  quantity: number;
  option: PricingOption;
  wantSourceFile?: boolean;
  deliveryFee?: number;
  discount?: number;
};

/** Files the customer's browser already uploaded to Storage — the files
 * themselves never ride in this action's body (Vercel caps it at 4.5 MB). */
const orderAttachmentsSchema = z
  .array(
    z.object({
      path: z.string().regex(INCOMING_ORDER_FILE_PATH),
      name: z.string().trim().min(1).max(255),
      type: z.string().max(255),
      size: z.number().int().nonnegative(),
    })
  )
  .max(MAX_ORDER_FILES);

export type OrderAttachment = z.infer<typeof orderAttachmentsSchema>[number];

export type OrderFormState = {
  success: boolean;
  orderNumber?: string;
  orderToken?: string;
  customerNumber?: string;
  isNewCustomer?: boolean;
  welcomePoints?: number;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitOrder(formData: FormData): Promise<OrderFormState> {
  const raw = {
    customer_name: formData.get("customer_name"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    business_name: formData.get("business_name") || undefined,
    service_id: formData.get("service_id") || undefined,
    service_label: formData.get("service_label"),
    description: formData.get("description"),
    quantity: formData.get("quantity") || undefined,
    required_date: formData.get("required_date") || undefined,
    budget_type: formData.get("budget_type") || undefined,
    budget: formData.get("budget") || undefined,
    delivery_required: formData.get("delivery_required") === "true",
    delivery_method: formData.get("delivery_method") || undefined,
    delivery_address: formData.get("delivery_address") || undefined,
  };

  const validated = orderFormSchema.safeParse(raw);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "নিচের তথ্যগুলো একটু ঠিক করে দিন।",
    };
  }

  let customFields: Json = {};
  try {
    const customFieldsRaw = formData.get("custom_fields");
    if (typeof customFieldsRaw === "string" && customFieldsRaw) {
      customFields = JSON.parse(customFieldsRaw);
    }
  } catch {
    customFields = {};
  }

  const productCategory = formData.get("product_category");
  if (productCategory === "banner" || productCategory === "signboard") {
    const dimensionCheck = bannerFieldsSchema.safeParse(customFields);
    if (!dimensionCheck.success) {
      return {
        success: false,
        errors: dimensionCheck.error.flatten().fieldErrors,
        message: "প্রস্থ ও উচ্চতা লিখুন।",
      };
    }
  }

  let attachmentsRaw: unknown = [];
  try {
    const value = formData.get("attachments");
    if (typeof value === "string" && value) attachmentsRaw = JSON.parse(value);
  } catch {
    attachmentsRaw = null;
  }
  const attachments = orderAttachmentsSchema.safeParse(attachmentsRaw);
  if (!attachments.success) {
    return { success: false, message: "ফাইলগুলো সংযুক্ত করা যায়নি। আবার চেষ্টা করুন।" };
  }
  const files = attachments.data;
  const fileError = validateOrderFileList(files);
  if (fileError) {
    return { success: false, message: fileError };
  }

  let supabase;
  let data;
  let pricingSnapshot: Json | null = null;
  try {
    supabase = await createClient();

    // Never trust a client-submitted total. If a pricing calculator was
    // shown, re-derive the price server-side from the service's own
    // authoritative rate/fees — the client only ever supplies the raw
    // dimensions/quantity/options it asked for, not a price.
    const pricingInputRaw = formData.get("pricing_input");
    if (
      validated.data.service_id &&
      typeof pricingInputRaw === "string" &&
      pricingInputRaw
    ) {
      try {
        const pricingInput = JSON.parse(pricingInputRaw) as PricingInput;
        const { data: serviceRow } = await supabase
          .from("services")
          .select("pricing_model, rate, design_fee, source_file_fee, minimum_charge, minimum_quantity")
          .eq("id", validated.data.service_id)
          .eq("is_active", true)
          .maybeSingle();

        if (serviceRow && serviceRow.pricing_model !== "CUSTOM") {
          const result = calculateServicePrice({
            config: servicePricingConfig(serviceRow),
            widthValue: pricingInput.widthValue,
            heightValue: pricingInput.heightValue,
            unit: pricingInput.unit,
            quantity: pricingInput.quantity,
            option: pricingInput.option,
            wantSourceFile: pricingInput.wantSourceFile,
            deliveryFee: pricingInput.deliveryFee,
            discount: pricingInput.discount,
          });

          if (result.ok && result.minimumQuantityWarning) {
            return { success: false, message: result.minimumQuantityWarning };
          }
          if (result.ok) {
            pricingSnapshot = { ...result, calculatedAt: new Date().toISOString() } as unknown as Json;
          }
        }
      } catch {
        // Malformed pricing_input shouldn't block order submission — the
        // order still goes through, just without a price snapshot.
      }
    }

    const rpcArgsBase = {
      p_customer_name: validated.data.customer_name,
      p_phone: validated.data.phone,
      p_email: validated.data.email || null,
      p_address: validated.data.address || null,
      p_service_id: validated.data.service_id || null,
      p_service_label: validated.data.service_label,
      p_description: validated.data.description,
      p_quantity: validated.data.quantity || null,
      p_required_date: validated.data.required_date || null,
      p_budget:
        validated.data.budget_type === "negotiable"
          ? "আলোচনা সাপেক্ষে"
          : validated.data.budget || null,
      p_delivery_required: validated.data.delivery_required,
      p_delivery_address: validated.data.delivery_address || null,
      p_delivery_method: validated.data.delivery_method || null,
      p_custom_fields: customFields,
    };

    let result = await supabase.rpc("submit_order", {
      ...rpcArgsBase,
      p_pricing_snapshot: pricingSnapshot,
    });

    // supabase/migrations/0004_pricing_engine.sql adds a p_pricing_snapshot
    // parameter to submit_order() — until that migration is actually run,
    // only the original (no-snapshot) signature exists, and PostgREST
    // rejects the call entirely (PGRST202: function not found) rather than
    // just ignoring the extra arg. Retry with the original signature so
    // order submission — the site's primary lead funnel — keeps working
    // regardless of migration timing; the pricing snapshot simply won't be
    // stored until the migration is applied.
    if (result.error?.code === "PGRST202") {
      result = await supabase.rpc("submit_order", rpcArgsBase);
    }

    if (result.error) throw result.error;
    data = result.data;
  } catch (err) {
    console.error("[submitOrder] failed:", err);
    return { success: false, message: "অর্ডারটি পাঠানো যায়নি। আবার চেষ্টা করুন।" };
  }

  if (!data || data.length === 0) {
    return { success: false, message: "অর্ডারটি পাঠানো যায়নি। আবার চেষ্টা করুন।" };
  }

  const order = data[0];

  for (const file of files) {
    try {
      await supabase.rpc("add_order_attachment", {
        p_order_id: order.id,
        p_file_name: file.name,
        p_file_path: file.path,
        p_file_url: file.path,
        p_file_type: file.type || "application/octet-stream",
        p_file_size: file.size,
      });
    } catch {
      // The order itself is already submitted successfully; one attachment
      // failing to record shouldn't fail the whole order. The admin can ask
      // the customer to resend it via the reply thread if needed.
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await sendOrderNotificationEmail({
    orderNumber: order.order_number,
    customerName: validated.data.customer_name,
    phone: validated.data.phone,
    serviceLabel: validated.data.service_label,
    description: validated.data.description,
    adminOrderUrl: `${siteUrl}/admin/orders/${order.id}`,
  });

  // Silently builds/updates the customer's CRM profile in the background —
  // never blocks or fails the order itself if this has a problem, same
  // fault-tolerant pattern as the attachment uploads above.
  let customerNumber: string | undefined;
  let isNewCustomer: boolean | undefined;
  let welcomePoints: number | undefined;
  try {
    const { data: linkData, error: linkError } = await supabase.rpc("link_customer_to_order", {
      p_order_id: order.id,
      p_name: validated.data.customer_name,
      p_phone: validated.data.phone,
      p_email: validated.data.email || null,
      p_area: null,
      p_business_name: validated.data.business_name || null,
    });
    if (!linkError && linkData && linkData.length > 0) {
      customerNumber = linkData[0].out_customer_number;
      isNewCustomer = linkData[0].out_is_new;
      welcomePoints = linkData[0].out_welcome_points || undefined;
    }
  } catch (err) {
    console.error("[submitOrder] customer linking failed:", err);
  }

  // Fault-tolerant, same pattern as attachment upload / customer linking
  // above: an invalid/unknown/missing referral code is silently ignored by
  // attribute_referral() itself, and any unexpected failure here must never
  // fail the order that has already been created successfully.
  const referralCode = formData.get("referral_code");
  if (typeof referralCode === "string" && referralCode.trim()) {
    try {
      await supabase.rpc("attribute_referral", {
        p_order_id: order.id,
        p_referral_code: referralCode.trim(),
      });
    } catch (err) {
      console.error("[submitOrder] referral attribution failed:", err);
    }
  }

  return {
    success: true,
    orderNumber: order.order_number,
    orderToken: order.access_token,
    customerNumber,
    isNewCustomer,
    welcomePoints,
  };
}
