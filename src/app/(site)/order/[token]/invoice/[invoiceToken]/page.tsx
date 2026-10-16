import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { PrintButton } from "@/components/ui/PrintButton";
import { InvoicePreview, type InvoicePreviewData } from "@/components/site/InvoicePreview";
import { RedemptionSection } from "./RedemptionSection";
import { getLogos, getContactSettings, getSiteSettings } from "@/lib/queries/site";
import { getRewardWalletByToken, getOrderRedemptionByToken } from "@/lib/queries/rewards";
import type { CustomerInvoiceView } from "@/lib/types";

export default async function CustomerInvoicePage({
  params,
}: {
  params: Promise<{ token: string; invoiceToken: string }>;
}) {
  const { token, invoiceToken } = await params;

  let data: unknown = null;
  try {
    const supabase = await createClient();
    const result = await supabase.rpc("get_invoice_by_tokens", {
      p_order_token: token,
      p_invoice_token: invoiceToken,
    });
    data = result.data;
  } catch {
    data = null;
  }

  if (!data) notFound();
  const invoice = data as unknown as CustomerInvoiceView;

  const [logos, contactSettings, siteSettings, wallet, redeemedAmount] = await Promise.all([
    getLogos(),
    getContactSettings(),
    getSiteSettings(),
    getRewardWalletByToken(token),
    getOrderRedemptionByToken(token),
  ]);

  const previewData: InvoicePreviewData = {
    invoiceNumber: invoice.invoice_number,
    version: invoice.version,
    orderNumber: invoice.order_number,
    invoiceDate: invoice.invoice_date,
    status: invoice.status,
    customerName: invoice.customer_name,
    customerPhone: invoice.customer_phone,
    customerEmail: invoice.customer_email,
    customerAddress: invoice.customer_address,
    items: invoice.items,
    subtotal: invoice.subtotal,
    designCharge: invoice.design_charge,
    deliveryCharge: invoice.delivery_charge,
    courierCharge: invoice.courier_charge,
    otherCharge: invoice.other_charge,
    discount: invoice.discount,
    total: invoice.total,
    paidAmount: invoice.paid_amount,
    dueAmount: invoice.due_amount,
    redemptionAmount: redeemedAmount,
    estimatedCompletion: invoice.estimated_completion,
    deliveryMethod: invoice.delivery_method,
    deliveryAddress: invoice.delivery_address,
    notes: invoice.notes,
  };

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href={`/order/status/${token}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            অর্ডারে ফিরে যান
          </Link>
          <div className="flex gap-2">
            <PrintButton label="প্রিন্ট করুন" icon="print" />
            <PrintButton label="PDF ডাউনলোড করুন" icon="download" />
          </div>
        </div>

        <InvoicePreview
          data={previewData}
          logoUrl={logos.primary_logo_url}
          businessName={siteSettings.business_name}
          businessAddress={contactSettings.address}
          businessPhone={contactSettings.phone}
          businessEmail={contactSettings.email}
        />

        <RedemptionSection
          orderToken={token}
          invoiceToken={invoiceToken}
          dueAmount={invoice.due_amount}
          availableBalance={wallet.available}
          initialRedeemedAmount={redeemedAmount}
          minRedemption={wallet.minRedemption}
        />
      </Container>
    </section>
  );
}

export const dynamic = "force-dynamic";
