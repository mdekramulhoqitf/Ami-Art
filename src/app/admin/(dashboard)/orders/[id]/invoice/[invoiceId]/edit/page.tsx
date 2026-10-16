import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { InvoiceForm } from "../../InvoiceForm";
import { updateInvoice } from "../../actions";
import { getInvoiceById, getInvoiceItems } from "@/lib/queries/invoices";
import { getOrderById } from "@/lib/queries/orders";
import { getContactSettings, getLogos, getSiteSettings } from "@/lib/queries/site";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string; invoiceId: string }>;
}) {
  const { id, invoiceId } = await params;
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice || invoice.order_id !== id) notFound();

  // Sent+ invoices are immutable — only a draft can be edited in place.
  // The order/invoice view pages offer "নতুন সংস্করণ তৈরি করুন" instead.
  if (invoice.status !== "draft") {
    redirect(`/admin/orders/${id}/invoice/${invoiceId}`);
  }

  const [order, items, logos, contactSettings, siteSettings] = await Promise.all([
    getOrderById(id),
    getInvoiceItems(invoiceId),
    getLogos(),
    getContactSettings(),
    getSiteSettings(),
  ]);
  if (!order) notFound();

  return (
    <div>
      <PageHeader title="ইনভয়েস সম্পাদনা করুন" description={`ইনভয়েস #${invoice.invoice_number}`} />
      <InvoiceForm
        invoice={invoice}
        items={items}
        orderId={id}
        orderNumber={order.order_number}
        logoUrl={logos.primary_logo_url}
        businessName={siteSettings.business_name}
        businessAddress={contactSettings.address}
        businessPhone={contactSettings.phone}
        businessEmail={contactSettings.email}
        action={updateInvoice.bind(null, invoiceId, id)}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
