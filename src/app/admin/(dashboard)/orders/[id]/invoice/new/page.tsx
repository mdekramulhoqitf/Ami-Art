import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { InvoiceForm } from "../InvoiceForm";
import { createInvoice } from "../actions";
import { getOrderById } from "@/lib/queries/orders";
import { getContactSettings, getLogos, getSiteSettings } from "@/lib/queries/site";
import type { DeliveryMethod } from "@/lib/types";

export default async function NewInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, logos, contactSettings, siteSettings] = await Promise.all([
    getOrderById(id),
    getLogos(),
    getContactSettings(),
    getSiteSettings(),
  ]);
  if (!order) notFound();

  const deliveryMethod = order.delivery_method as DeliveryMethod | null;
  const deliveryCharge = deliveryMethod === "local_delivery" ? siteSettings.delivery_settings.local_delivery_fee : 0;
  const courierCharge = deliveryMethod === "courier" ? siteSettings.delivery_settings.courier_fee : 0;

  return (
    <div>
      <PageHeader title="ইনভয়েস তৈরি করুন" description={`অর্ডার #${order.order_number}-এর জন্য কোটেশন/ইনভয়েস তৈরি করুন।`} />
      <InvoiceForm
        orderId={order.id}
        orderNumber={order.order_number}
        defaults={{
          customer_name: order.customer_name,
          customer_phone: order.phone,
          customer_email: order.email,
          customer_address: order.address,
          delivery_method: deliveryMethod,
          delivery_address: order.delivery_address,
          delivery_charge: deliveryCharge,
          courier_charge: courierCharge,
          service_label: order.service_label,
        }}
        logoUrl={logos.primary_logo_url}
        businessName={siteSettings.business_name}
        businessAddress={contactSettings.address}
        businessPhone={contactSettings.phone}
        businessEmail={contactSettings.email}
        action={createInvoice.bind(null, order.id)}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
