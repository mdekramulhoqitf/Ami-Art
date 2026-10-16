import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_TONE } from "@/lib/invoice-status";
import { Numeral } from "@/components/ui/Numeral";
import { toBengaliDigits } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/types";

export function InvoiceMessageCard({
  invoiceNumber,
  total,
  status,
  estimatedCompletion,
  href,
  viewLabel = "ইনভয়েস দেখুন",
}: {
  invoiceNumber: string;
  total: number;
  status: InvoiceStatus;
  estimatedCompletion?: string | null;
  href: string;
  viewLabel?: string;
}) {
  return (
    <div className="w-64 max-w-full rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <FileText className="h-4 w-4 text-primary-600" />
        ইনভয়েস
      </div>
      <p className="mt-2 text-xs text-ink-faint">ইনভয়েস #{invoiceNumber}</p>
      <div className="mt-2.5">
        <p className="text-xs text-ink-faint">সর্বমোট</p>
        <p className="text-lg font-bold text-ink">
          ৳ <Numeral>{toBengaliDigits(total.toLocaleString("en-BD"))}</Numeral>
        </p>
      </div>
      {estimatedCompletion && (
        <p className="mt-2 text-xs text-ink-soft">সম্ভাব্য সময়: {estimatedCompletion}</p>
      )}
      <div className="mt-3">
        <Badge tone={INVOICE_STATUS_TONE[status]}>{INVOICE_STATUS_LABELS[status]}</Badge>
      </div>
      <Link
        href={href}
        className="mt-3 block rounded-full bg-primary-600 px-4 py-2 text-center text-xs font-medium text-white hover:bg-primary-700"
      >
        {viewLabel}
      </Link>
    </div>
  );
}
