import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FilePlus, Headset, User, Building2, Users, FileText, CalendarClock, Gift } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ScheduleFollowUpForm } from "@/components/admin/ScheduleFollowUpForm";
import { FollowUpInlineActions } from "@/components/admin/FollowUpInlineActions";
import { InvoiceMessageCard } from "@/components/site/InvoiceMessageCard";
import { getOrderById, getOrderAttachments, getOrderMessages } from "@/lib/queries/orders";
import { getLatestInvoiceForOrder, getInvoicesByIds } from "@/lib/queries/invoices";
import { getBusinessById, getQuotationByOrderId } from "@/lib/queries/businesses";
import { getCustomerById } from "@/lib/queries/customers";
import { getFollowupsForOrder, isFollowUpOverdue, getNextPendingFollowUp } from "@/lib/queries/followups";
import { getReferralForOrder } from "@/lib/queries/referrals";
import { getRedemptionForOrder } from "@/lib/queries/rewards";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/lib/order-status";
import { DELIVERY_METHOD_LABELS, getPaymentBadge, PAYMENT_BADGE_LABELS, PAYMENT_BADGE_TONE } from "@/lib/invoice-status";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { FollowUpReason } from "@/lib/types";
import { archiveOrder } from "../actions";
import { StatusSelect } from "./StatusSelect";
import { AttachmentList } from "./AttachmentList";
import { AdminReplyForm } from "./AdminReplyForm";
import { MarkAsReadOnView } from "./MarkAsReadOnView";
import { CustomFieldsDisplay } from "./CustomFieldsDisplay";

const FOLLOWUP_REASON_LABELS: Record<FollowUpReason, string> = {
  new_lead: "নতুন লিড",
  interested_lead: "আগ্রহী লিড",
  quotation_sent: "কোটেশন পাঠানো হয়েছে",
  quotation_pending: "কোটেশন অপেক্ষমাণ",
  negotiation: "আলোচনা চলছে",
  order_confirmation: "অর্ডার নিশ্চিতকরণ",
  production_update: "প্রোডাকশন আপডেট",
  delivery: "ডেলিভারি",
  post_order_checkin: "অর্ডার পরবর্তী খোঁজখবর",
  repeat_opportunity: "পুনরায় অর্ডারের সুযোগ",
  other: "অন্যান্য",
};

const REFERRAL_STATUS_LABELS: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  approved: "অনুমোদিত",
  rejected: "বাতিল",
};

const REFERRAL_STATUS_TONE: Record<string, "primary" | "accent" | "neutral" | "success" | "danger"> = {
  pending: "neutral",
  approved: "success",
  rejected: "danger",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const [attachments, messages, latestInvoice, followUps, quotation, referral, redeemedAmount] = await Promise.all([
    getOrderAttachments(id),
    getOrderMessages(id),
    getLatestInvoiceForOrder(id),
    getFollowupsForOrder(id),
    getQuotationByOrderId(id),
    getReferralForOrder(id),
    getRedemptionForOrder(id),
  ]);
  const [linkedBusiness, linkedCustomer] = await Promise.all([
    order.business_id ? getBusinessById(order.business_id) : null,
    order.customer_id ? getCustomerById(order.customer_id) : null,
  ]);
  const pendingFollowUps = followUps.filter((f) => f.status === "pending");
  const nextFollowUp = getNextPendingFollowUp(followUps);
  const isOverdue = nextFollowUp ? isFollowUpOverdue(nextFollowUp.scheduled_at) : false;

  const invoiceIds = [
    ...new Set(
      messages
        .filter((m) => m.message_type === "invoice" && m.invoice_id)
        .map((m) => m.invoice_id as string)
    ),
  ];
  const invoiceMap = await getInvoicesByIds(invoiceIds);

  return (
    <div>
      <MarkAsReadOnView orderId={id} isRead={order.is_read} />

      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        অর্ডার তালিকায় ফিরুন
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">অর্ডার #{order.order_number}</h1>
          <p className="mt-1 text-sm text-ink-soft">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
          <ConfirmDialog
            action={archiveOrder.bind(null, id)}
            title="অর্ডারটি মুছে ফেলুন"
            description="আপনি কি নিশ্চিতভাবে এই অর্ডারটি মুছে ফেলতে চান?"
            confirmLabel="মুছে ফেলুন"
          />
        </div>
      </div>

      {nextFollowUp && (
        <div
          className={cn(
            "mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4",
            isOverdue ? "border-accent-300 bg-accent-50" : "border-border bg-muted"
          )}
        >
          <div className="flex items-center gap-2.5">
            <CalendarClock className={cn("h-4.5 w-4.5 shrink-0", isOverdue ? "text-danger" : "text-ink-soft")} />
            <p className="text-sm">
              <span className={cn("font-medium", isOverdue ? "text-danger" : "text-ink")}>
                {isOverdue ? "ফলো-আপ বকেয়া" : "পরবর্তী ফলো-আপ"}
              </span>
              <span className="text-ink-soft"> — {FOLLOWUP_REASON_LABELS[nextFollowUp.reason]} ·</span>{" "}
              <span className="text-ink-soft">
                {formatDateTime(nextFollowUp.scheduled_at)}
              </span>
            </p>
          </div>
          <Link href="/admin/followups" className="text-sm font-medium text-primary-700 hover:underline">
            সব ফলো-আপ দেখুন
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">গ্রাহকের তথ্য</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-ink-faint">নাম</dt>
                <dd className="font-medium text-ink">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">মোবাইল</dt>
                <dd className="font-medium text-ink">{order.phone}</dd>
              </div>
              {order.email && (
                <div>
                  <dt className="text-ink-faint">ই-মেইল</dt>
                  <dd className="font-medium text-ink">{order.email}</dd>
                </div>
              )}
              {order.address && (
                <div>
                  <dt className="text-ink-faint">ঠিকানা</dt>
                  <dd className="font-medium text-ink">{order.address}</dd>
                </div>
              )}
            </dl>
            {(linkedCustomer || linkedBusiness) && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                {linkedCustomer && (
                  <Link href={`/admin/customers/${linkedCustomer.id}`}>
                    <Badge tone="primary">
                      <Users className="mr-1 inline h-3 w-3" /> {linkedCustomer.customer_number} প্রোফাইল
                    </Badge>
                  </Link>
                )}
                {linkedBusiness && (
                  <Link href={`/admin/businesses/${linkedBusiness.id}`}>
                    <Badge tone="neutral">
                      <Building2 className="mr-1 inline h-3 w-3" /> {linkedBusiness.name}
                    </Badge>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">কাজের ধরন</h2>
            <p className="text-sm text-ink">{order.service_label}</p>

            <h2 className="mb-2 mt-5 text-sm font-semibold text-ink">কাজের বিস্তারিত</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
              {order.description}
            </p>

            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-faint">পরিমাণ</dt>
                <dd className="font-medium text-ink">{order.quantity || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-faint">প্রয়োজনের তারিখ</dt>
                <dd className="font-medium text-ink">
                  {order.required_date ? formatDateTime(order.required_date) : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-faint">বাজেট</dt>
                <dd className="font-medium text-ink">{order.budget || "আলোচনা সাপেক্ষে"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-faint">ডেলিভারি প্রয়োজন</dt>
                <dd className="font-medium text-ink">{order.delivery_required ? "হ্যাঁ" : "না"}</dd>
              </div>
              {order.delivery_required && order.delivery_method && (
                <div className="flex justify-between">
                  <dt className="text-ink-faint">ডেলিভারি পদ্ধতি</dt>
                  <dd className="font-medium text-ink">
                    {DELIVERY_METHOD_LABELS[order.delivery_method] ?? order.delivery_method}
                  </dd>
                </div>
              )}
              {order.delivery_required && order.delivery_address && (
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-ink-faint">ডেলিভারি ঠিকানা</dt>
                  <dd className="text-right font-medium text-ink">{order.delivery_address}</dd>
                </div>
              )}
            </dl>
          </div>

          {order.custom_fields && Object.keys(order.custom_fields as object).length > 0 && (
            <CustomFieldsDisplay customFields={order.custom_fields as Record<string, unknown>} />
          )}

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">সংযুক্ত ফাইল</h2>
            <AttachmentList attachments={attachments} />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">অর্ডারের অবস্থা</h2>
            <StatusSelect orderId={id} status={order.status} />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">কোটেশন / ইনভয়েস</h2>
            {quotation && (
              <Link
                href={`/admin/businesses/${quotation.business_id}/opportunities/${quotation.opportunity_id}`}
                className="mb-3 flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:underline"
              >
                <FileText className="h-3.5 w-3.5" /> কোটেশন {quotation.quotation_number} থেকে তৈরি
              </Link>
            )}
            {latestInvoice ? (
              <div className="space-y-2">
                <Link
                  href={`/admin/orders/${id}/invoice/${latestInvoice.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:border-primary-500"
                >
                  <span>ইনভয়েস দেখুন (#{latestInvoice.invoice_number})</span>
                  {(() => {
                    const badge = getPaymentBadge(latestInvoice.total, latestInvoice.paid_amount, redeemedAmount ?? 0);
                    return <Badge tone={PAYMENT_BADGE_TONE[badge]}>{PAYMENT_BADGE_LABELS[badge]}</Badge>;
                  })()}
                </Link>
              </div>
            ) : (
              <Button href={`/admin/orders/${id}/invoice/new`} size="sm" className="w-full">
                <FilePlus className="h-4 w-4" />
                কোটেশন / ইনভয়েস তৈরি করুন
              </Button>
            )}
          </div>

          {referral && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Gift className="h-4 w-4" /> রেফারেল সূত্র
              </h2>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-faint">রেফারার</dt>
                  <dd>
                    <Link
                      href={`/admin/customers/${referral.referrer_customer_id}`}
                      className="font-medium text-primary-700 hover:underline"
                    >
                      {referral.referrer_name ?? referral.referrer_customer_number ?? "—"}
                    </Link>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-faint">Referral Code</dt>
                  <dd className="font-medium text-ink">{referral.referral_code}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-faint">কমিশন স্ট্যাটাস</dt>
                  <dd>
                    <Badge tone={REFERRAL_STATUS_TONE[referral.status]}>
                      {REFERRAL_STATUS_LABELS[referral.status]}
                    </Badge>
                  </dd>
                </div>
                {referral.commission_amount != null && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-faint">কমিশন পরিমাণ</dt>
                    <dd className="font-medium text-ink">৳ {referral.commission_amount.toLocaleString("en-BD")}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink">ফলো-আপ</h2>
              <ScheduleFollowUpForm orderId={id} businessId={order.business_id ?? undefined} customerId={order.customer_id ?? undefined} />
            </div>
            {pendingFollowUps.length > 0 ? (
              <ul className="space-y-2">
                {pendingFollowUps.map((f) => {
                  const overdue = isFollowUpOverdue(f.scheduled_at);
                  return (
                    <li key={f.id} className="rounded-lg border border-border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-ink">{FOLLOWUP_REASON_LABELS[f.reason]}</p>
                        {overdue && <Badge tone="danger">বকেয়া</Badge>}
                      </div>
                      <p className="mt-0.5 text-ink-faint">{formatDateTime(f.scheduled_at)}</p>
                      {f.notes && <p className="mt-1.5 whitespace-pre-wrap text-ink-soft">{f.notes}</p>}
                      {f.next_action && <p className="mt-1 text-xs text-ink-faint">পরবর্তী পদক্ষেপ: {f.next_action}</p>}
                      <FollowUpInlineActions followUpId={f.id} />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-ink-faint">এই অর্ডারের জন্য এখনো কোনো ফলো-আপ নেই।</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">গ্রাহকের সাথে যোগাযোগ</h2>

            {messages.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted px-5 py-8 text-center text-sm text-ink-soft">
                এখনও কোনো মেসেজ নেই।
              </p>
            ) : (
              <ul className="space-y-3">
                {messages.map((message) => {
                  const invoice =
                    message.message_type === "invoice" && message.invoice_id
                      ? invoiceMap.get(message.invoice_id)
                      : null;

                  return (
                    <li
                      key={message.id}
                      className={cn("flex gap-3", message.sender_type === "admin" && "flex-row-reverse")}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          message.sender_type === "admin"
                            ? "bg-primary-100 text-primary-700"
                            : "bg-muted text-ink-soft"
                        )}
                      >
                        {message.sender_type === "admin" ? (
                          <Headset className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </span>
                      <div className="max-w-[85%] space-y-2">
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm",
                            message.sender_type === "admin" ? "bg-primary-50 text-ink" : "bg-muted text-ink"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{message.message}</p>
                          <p className="mt-1 text-[11px] text-ink-faint">
                            {formatDateTime(message.created_at)}
                          </p>
                        </div>
                        {invoice && (
                          <InvoiceMessageCard
                            invoiceNumber={invoice.invoice_number}
                            total={Number(invoice.total)}
                            status={invoice.status}
                            estimatedCompletion={invoice.estimated_completion}
                            href={`/admin/orders/${id}/invoice/${invoice.id}`}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <AdminReplyForm orderId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
