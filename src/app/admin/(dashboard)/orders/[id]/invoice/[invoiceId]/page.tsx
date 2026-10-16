import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PrintButton } from "@/components/ui/PrintButton";
import { InvoicePreview, type InvoicePreviewData } from "@/components/site/InvoicePreview";
import { INVOICE_STATUS_TONE, INVOICE_STATUS_LABELS } from "@/lib/invoice-status";
import { getInvoiceById, getInvoiceItems, getInvoicesForOrder } from "@/lib/queries/invoices";
import { getOrderById } from "@/lib/queries/orders";
import { getRedemptionForOrder } from "@/lib/queries/rewards";
import { getContactSettings, getLogos, getSiteSettings } from "@/lib/queries/site";
import { CreateVersionButton } from "./CreateVersionButton";
import { SendInvoiceForm } from "./SendInvoiceForm";
import { PaymentPanel } from "./PaymentPanel";

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string; invoiceId: string }>;
}) {
  const { id, invoiceId } = await params;
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice || invoice.order_id !== id) notFound();

  const [order, items, allVersions, logos, contactSettings, siteSettings, redemptionAmount] = await Promise.all([
    getOrderById(id),
    getInvoiceItems(invoiceId),
    getInvoicesForOrder(id),
    getLogos(),
    getContactSettings(),
    getSiteSettings(),
    getRedemptionForOrder(id),
  ]);
  if (!order) notFound();

  const versions = allVersions
    .filter((v) => v.invoice_number === invoice.invoice_number)
    .sort((a, b) => b.version - a.version);

  const previewData: InvoicePreviewData = {
    invoiceNumber: invoice.invoice_number,
    version: invoice.version,
    orderNumber: order.order_number,
    invoiceDate: invoice.invoice_date,
    status: invoice.status,
    customerName: invoice.customer_name,
    customerPhone: invoice.customer_phone,
    customerEmail: invoice.customer_email,
    customerAddress: invoice.customer_address,
    items: items.map((i) => ({
      service_name: i.service_name,
      quantity: Number(i.quantity),
      unit_price: Number(i.unit_price),
      total: Number(i.total),
    })),
    subtotal: Number(invoice.subtotal),
    designCharge: Number(invoice.design_charge),
    deliveryCharge: Number(invoice.delivery_charge),
    courierCharge: Number(invoice.courier_charge),
    otherCharge: Number(invoice.other_charge),
    discount: Number(invoice.discount),
    total: Number(invoice.total),
    paidAmount: Number(invoice.paid_amount),
    dueAmount: Number(invoice.due_amount),
    redemptionAmount,
    estimatedCompletion: invoice.estimated_completion,
    deliveryMethod: invoice.delivery_method,
    deliveryAddress: invoice.delivery_address,
    notes: invoice.notes,
    orderServiceLabel: order.service_label,
    orderRequiredDate: order.required_date,
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/admin/orders/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          অর্ডারে ফিরুন
        </Link>
        <Badge tone={INVOICE_STATUS_TONE[invoice.status]}>{INVOICE_STATUS_LABELS[invoice.status]}</Badge>
      </div>

      {versions.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 print:hidden">
          <span className="text-xs font-medium text-ink-faint">সংস্করণ:</span>
          {versions.map((v) => (
            <Link
              key={v.id}
              href={`/admin/orders/${id}/invoice/${v.id}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                v.id === invoiceId
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-border text-ink-soft hover:border-primary-500"
              }`}
            >
              সংস্করণ {v.version}
              {v.is_latest && " · সর্বশেষ"}
            </Link>
          ))}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2 print:hidden">
        {invoice.status === "draft" ? (
          <Link
            href={`/admin/orders/${id}/invoice/${invoiceId}/edit`}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Pencil className="h-4 w-4" />
            সম্পাদনা করুন
          </Link>
        ) : (
          <CreateVersionButton invoiceId={invoiceId} orderId={id} />
        )}
        <SendInvoiceForm invoiceId={invoiceId} orderId={id} />
        <PrintButton label="প্রিন্ট করুন" icon="print" />
        <PrintButton label="PDF ডাউনলোড করুন" icon="download" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <InvoicePreview
          data={previewData}
          logoUrl={logos.primary_logo_url}
          businessName={siteSettings.business_name}
          businessAddress={contactSettings.address}
          businessPhone={contactSettings.phone}
          businessEmail={contactSettings.email}
        />

        <div className="print:hidden">
          <PaymentPanel
            invoiceId={invoiceId}
            orderId={id}
            initialStatus={invoice.status}
            initialPaidAmount={Number(invoice.paid_amount)}
            total={Number(invoice.total)}
          />
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
