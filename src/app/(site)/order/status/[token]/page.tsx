import { notFound } from "next/navigation";
import { User, Headset, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InvoiceMessageCard } from "@/components/site/InvoiceMessageCard";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/lib/order-status";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ReplyForm } from "./ReplyForm";
import { ReferralSection } from "./ReferralSection";
import { WalletSection } from "./WalletSection";
import { ReferralRulesSection } from "./ReferralRulesSection";
import { CustomerHubSection } from "./CustomerHubSection";
import { getReferralInfoByToken } from "@/lib/queries/referrals";
import { getRewardWalletByToken, getRewardHistoryByToken } from "@/lib/queries/rewards";
import { getCustomerHubByToken, getCustomerRecentOrdersByToken } from "@/lib/queries/orders";
import type { CustomerOrderView } from "@/lib/types";

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let data: unknown = null;
  try {
    const supabase = await createClient();
    ({ data } = await supabase.rpc("get_order_by_token", { p_token: token }));
  } catch {
    data = null;
  }

  if (!data) notFound();
  const order = data as unknown as CustomerOrderView;
  // Points the wallet's redeem CTA at this order's own real invoice when one
  // has a due balance — reuses the existing redemption flow on that invoice
  // page instead of inventing a second one; no new query, order.messages is
  // already fetched above.
  const redeemableInvoice = order.messages
    .filter((m) => m.message_type === "invoice" && m.invoice && m.invoice.due_amount > 0)
    .map((m) => m.invoice)
    .pop();
  const [referralInfo, wallet, rewardHistory, hub, recentOrders] = await Promise.all([
    getReferralInfoByToken(token),
    getRewardWalletByToken(token),
    getRewardHistoryByToken(token),
    getCustomerHubByToken(token),
    getCustomerRecentOrdersByToken(token),
  ]);

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-2xl">
        {hub && (
          <CustomerHubSection
            hub={hub}
            recentOrders={recentOrders}
            currentOrderNumber={order.order_number}
            referralEligible={referralInfo.eligible}
          />
        )}

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-faint">অর্ডারের অবস্থা</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">{order.order_number}</h1>
          </div>
          <Badge tone={ORDER_STATUS_TONE[order.status]} className="shrink-0">
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">নাম</dt>
              <dd className="font-medium text-ink">{order.customer_name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">কাজের ধরন</dt>
              <dd className="font-medium text-ink">{order.service_label}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">অর্ডারের সময়</dt>
              <dd className="font-medium text-ink">{formatDateTime(order.created_at)}</dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-border pt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              কাজের বিস্তারিত
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
              {order.description}
            </p>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <Button href={`/order?reorder=${token}`} variant="secondary" size="sm">
              <RotateCcw className="h-3.5 w-3.5" />
              আবার অর্ডার করুন
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-base font-semibold text-ink">আমাদের সাথে কথোপকথন</h2>

          {order.messages.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-muted px-5 py-8 text-center text-sm text-ink-soft">
              এখনও কোনো মেসেজ নেই। নিচে মেসেজ লিখে যোগাযোগ শুরু করুন।
            </p>
          ) : (
            <ul className="space-y-3">
              {order.messages.map((message, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex gap-3",
                    message.sender_type === "customer" && "flex-row-reverse"
                  )}
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
                        message.sender_type === "admin"
                          ? "bg-primary-50 text-ink"
                          : "bg-muted text-ink"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.message}</p>
                      <p className="mt-1 text-[11px] text-ink-faint">
                        {formatDateTime(message.created_at)}
                      </p>
                    </div>
                    {message.message_type === "invoice" && message.invoice && (
                      <InvoiceMessageCard
                        invoiceNumber={message.invoice.invoice_number}
                        total={message.invoice.total}
                        status={message.invoice.status}
                        estimatedCompletion={message.invoice.estimated_completion}
                        href={`/order/${token}/invoice/${message.invoice.access_token}`}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <ReplyForm token={token} />
        </div>

        <div id="referral" className="scroll-mt-20">
          <ReferralSection
            token={token}
            eligible={referralInfo.eligible}
            initialCode={referralInfo.referralCode}
            commissionRate={referralInfo.commissionRate}
          />
        </div>

        <WalletSection
          eligible={referralInfo.eligible}
          wallet={wallet}
          history={rewardHistory}
          redeemableOrderToken={redeemableInvoice ? token : null}
          redeemableInvoiceToken={redeemableInvoice?.access_token ?? null}
        />

        {referralInfo.eligible && (
          <ReferralRulesSection
            commissionRatePercent={
              referralInfo.commissionRate != null ? Math.round(referralInfo.commissionRate * 1000) / 10 : null
            }
            minRedemption={wallet.minRedemption}
          />
        )}
      </Container>
    </section>
  );
}

export const dynamic = "force-dynamic";
