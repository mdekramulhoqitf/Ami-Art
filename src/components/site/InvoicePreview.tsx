import {
  INVOICE_STATUS_LABELS,
  DELIVERY_METHOD_LABELS,
  getPaymentBadge,
  PAYMENT_BADGE_LABELS,
} from "@/lib/invoice-status";
import { toBengaliDigits, formatDateBengali } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { Numeral } from "@/components/ui/Numeral";
import type { DeliveryMethod, InvoiceStatus } from "@/lib/types";

export type InvoicePreviewItem = {
  service_name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type InvoicePreviewData = {
  invoiceNumber: string;
  version?: number;
  orderNumber: string;
  invoiceDate: string;
  status: InvoiceStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  items: InvoicePreviewItem[];
  subtotal: number;
  designCharge: number;
  deliveryCharge: number;
  courierCharge: number;
  otherCharge: number;
  discount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  /** Only an amount actually applied via redeem_reward_by_token() for THIS
   * order — never a raw wallet balance, pending/approved commission, or
   * anything not yet redeemed. Display-only: never written back into
   * subtotal/discount/total/due_amount, which stay exactly as stored. */
  redemptionAmount?: number | null;
  estimatedCompletion?: string | null;
  deliveryMethod?: DeliveryMethod | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  /** Real order fields, only available where the caller already has the
   * underlying order row (admin side). The customer-facing invoice page
   * reads from get_invoice_by_tokens(), which doesn't expose these — left
   * undefined there rather than invented. */
  orderServiceLabel?: string | null;
  orderRequiredDate?: string | null;
};

function taka(amount: number) {
  return `৳ ${toBengaliDigits(amount.toLocaleString("en-BD", { maximumFractionDigits: 2 }))}`;
}

export function InvoicePreview({
  data,
  logoUrl,
  businessName,
  businessAddress,
  businessPhone,
  businessEmail,
}: {
  data: InvoicePreviewData;
  logoUrl: string | null;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
}) {
  const hasOrderInfo = Boolean(
    data.orderServiceLabel || data.orderRequiredDate || data.estimatedCompletion
  );
  // due_amount is the stored source of truth for what's owed before reward;
  // redemptionAmount is the stored source of truth for reward applied — the
  // displayed payable is a pure read-time subtraction of the two, computed
  // once here. total/subtotal/discount are never touched.
  const hasRedemption = Boolean(data.redemptionAmount && data.redemptionAmount > 0);
  const paymentBadge = getPaymentBadge(data.total, data.paidAmount, data.redemptionAmount ?? 0);
  const payableAfterRedemption = hasRedemption
    ? Math.max(data.dueAmount - (data.redemptionAmount ?? 0), 0)
    : data.dueAmount;

  return (
    <div
      className="mx-auto w-full max-w-[800px] bg-white p-6 text-ink shadow-sm sm:p-10 print:max-w-none print:p-0 print:shadow-none"
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Logo logoUrl={logoUrl} businessName={businessName} imgClassName="h-11 sm:h-12" />
        <div className="text-left text-xs leading-relaxed text-ink-soft sm:text-right">
          <p>{businessAddress}</p>
          <p><Numeral>{toBengaliDigits(businessPhone)}</Numeral></p>
          <p>{businessEmail}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        <span className="h-[3px] flex-1 rounded-full bg-primary-600" />
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500" />
      </div>

      {/* Title + meta */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            ইনভয়েস<span className="text-accent-600">.</span>
          </h1>
          {data.version && data.version > 1 && (
            <p className="mt-1 text-xs font-semibold text-accent-600">
              সংস্করণ <Numeral>{toBengaliDigits(data.version)}</Numeral>
            </p>
          )}
        </div>
        <div className="space-y-0.5 text-sm sm:text-right">
          <p className="text-ink-soft">
            ইনভয়েস: <span className="font-semibold text-ink">{data.invoiceNumber}</span>
          </p>
          <p className="text-ink-soft">
            অর্ডার: <span className="font-semibold text-ink">{data.orderNumber}</span>
          </p>
          <p className="text-ink-soft">
            তারিখ:{" "}
            <span className="font-semibold text-ink">
              <Numeral>{formatDateBengali(data.invoiceDate)}</Numeral>
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
          {INVOICE_STATUS_LABELS[data.status]}
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-ink-soft">
          {PAYMENT_BADGE_LABELS[paymentBadge]}
        </span>
      </div>

      {/* Customer + order info */}
      <div className="mt-8 grid grid-cols-1 gap-6 border-y border-border py-6 sm:grid-cols-2 print:mt-6 print:py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">গ্রাহক</p>
          <p className="mt-2 text-base font-semibold text-ink">{data.customerName}</p>
          <p className="text-sm text-ink-soft">
            <Numeral>{toBengaliDigits(data.customerPhone)}</Numeral>
          </p>
          {data.customerEmail && <p className="text-sm text-ink-soft">{data.customerEmail}</p>}
          {data.customerAddress && <p className="text-sm text-ink-soft">{data.customerAddress}</p>}
        </div>
        {hasOrderInfo && (
          <div className="sm:border-l sm:border-border sm:pl-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
              অর্ডার সম্পর্কিত তথ্য
            </p>
            <dl className="mt-2 space-y-1.5 text-sm">
              {data.orderServiceLabel && <InfoRow label="অর্ডারের ধরন" value={data.orderServiceLabel} />}
              {data.orderRequiredDate && (
                <InfoRow
                  label="প্রয়োজনের তারিখ"
                  value={<Numeral>{formatDateBengali(data.orderRequiredDate)}</Numeral>}
                />
              )}
              {data.estimatedCompletion && (
                <InfoRow label="সম্ভাব্য সময়" value={data.estimatedCompletion} />
              )}
            </dl>
          </div>
        )}
      </div>

      {/* Items table */}
      <div className="mt-8 overflow-x-auto print:mt-6">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="bg-dark text-left text-xs uppercase tracking-wide text-white">
              <th className="rounded-l-lg py-3 pl-4 pr-2 font-semibold">ক্রম</th>
              <th className="py-3 px-2 font-semibold">সেবা / পণ্যের বিবরণ</th>
              <th className="py-3 px-2 text-right font-semibold">পরিমাণ</th>
              <th className="py-3 px-2 text-right font-semibold">একক মূল্য</th>
              <th className="rounded-r-lg py-3 pl-2 pr-4 text-right font-semibold">মোট</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className={cn("border-b border-border/70", i % 2 === 1 && "bg-muted/60")}>
                <td className="py-3 pl-4 pr-2 text-ink-soft">
                  <Numeral>{toBengaliDigits(String(i + 1).padStart(2, "0"))}</Numeral>
                </td>
                <td className="py-3 px-2 text-ink">{item.service_name}</td>
                <td className="py-3 px-2 text-right text-ink-soft">
                  <Numeral>{toBengaliDigits(item.quantity)}</Numeral>
                </td>
                <td className="py-3 px-2 text-right text-ink-soft">
                  <Numeral>{taka(item.unit_price)}</Numeral>
                </td>
                <td className="py-3 pl-2 pr-4 text-right font-medium text-ink">
                  <Numeral>{taka(item.total)}</Numeral>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Thank you / terms + Payment summary */}
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 print:mt-6">
        <div>
          <p className="text-sm font-semibold text-ink">আপনার আস্থার জন্য ধন্যবাদ</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            আপনার কাজটি যত্নসহকারে সম্পন্ন করার জন্য আমরা প্রতিশ্রুতিবদ্ধ।
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">শর্তাবলি</p>
          <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-ink-soft">
            <li>কাজের ধরন অনুযায়ী মূল্য পরিবর্তিত হতে পারে।</li>
            <li>অতিরিক্ত পরিবর্তন বা নতুন কাজের জন্য অতিরিক্ত মূল্য প্রযোজ্য হতে পারে।</li>
            <li>নির্ধারিত সময় অনুযায়ী কাজ সরবরাহ করা হবে।</li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">মূল্য সারসংক্ষেপ</p>
          <div className="mt-2 space-y-1.5 text-sm">
            <Row label="উপমোট" value={taka(data.subtotal)} />
            {data.designCharge > 0 && <Row label="ডিজাইন চার্জ" value={taka(data.designCharge)} />}
            {data.deliveryCharge > 0 && <Row label="ডেলিভারি চার্জ" value={taka(data.deliveryCharge)} />}
            {data.courierCharge > 0 && <Row label="কুরিয়ার চার্জ" value={taka(data.courierCharge)} />}
            {data.otherCharge > 0 && <Row label="অন্যান্য চার্জ" value={taka(data.otherCharge)} />}
            {data.discount > 0 && <Row label="ছাড়" value={`-${taka(data.discount)}`} />}
            {data.paidAmount > 0 && (
              <Row label={hasRedemption ? "নগদে পরিশোধ" : "পরিশোধিত"} value={taka(data.paidAmount)} />
            )}
            {hasRedemption && <Row label="রিওয়ার্ড ব্যবহার" value={`-${taka(data.redemptionAmount ?? 0)}`} />}
          </div>
          {hasRedemption && (
            <p className="mt-1.5 text-xs text-ink-faint">আপনার reward balance থেকে ব্যবহার করা হয়েছে।</p>
          )}

          <div className="mt-3 flex items-center justify-between rounded-lg bg-dark px-4 py-3">
            <span className="text-sm font-semibold text-white">সর্বমোট</span>
            <span className="text-xl font-bold text-white">
              <Numeral>{taka(data.total)}</Numeral>
            </span>
          </div>

          {payableAfterRedemption > 0 && (
            <div className="mt-2 flex items-center justify-between text-sm font-semibold text-accent-700">
              <span>বাকি</span>
              <span>
                <Numeral>{taka(payableAfterRedemption)}</Numeral>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Delivery */}
      {data.deliveryMethod && (
        <div className="mt-8 rounded-xl border border-border p-5 text-sm print:mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">ডেলিভারি পদ্ধতি</p>
          <p className="mt-1 font-medium text-ink">{DELIVERY_METHOD_LABELS[data.deliveryMethod]}</p>
          {data.deliveryAddress && (
            <>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">ঠিকানা</p>
              <p className="mt-1 text-ink-soft">{data.deliveryAddress}</p>
            </>
          )}
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">অতিরিক্ত নোট</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{data.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 border-t border-border pt-6 print:mt-8">
        <div className="flex items-center gap-1.5">
          <span className="h-[3px] flex-1 rounded-full bg-primary-600" />
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-ink-soft sm:grid-cols-3 sm:text-center">
          <div className="sm:text-left">
            <p className="font-semibold text-ink">{businessName}</p>
            <p>ডিজিটাল সাইন • প্রিন্টিং • ডিজাইন</p>
          </div>
          <div>
            <p><Numeral>{toBengaliDigits(businessPhone)}</Numeral></p>
            <p>{businessEmail}</p>
          </div>
          <div className="sm:text-right">
            <p>{businessAddress}</p>
          </div>
        </div>
        <p className="mt-5 text-center text-xs font-medium text-ink-soft">আপনার আস্থার জন্য ধন্যবাদ।</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink-soft">
      <span>{label}</span>
      <span className="font-medium text-ink">
        <Numeral>{value}</Numeral>
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
