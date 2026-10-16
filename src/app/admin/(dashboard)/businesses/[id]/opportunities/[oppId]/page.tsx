import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  getBusinessById,
  getOpportunityById,
  getOpportunityQuotations,
  getOpportunityActivity,
} from "@/lib/queries/businesses";
import { StageSelect, QuotationForm, QuotationCard } from "./OpportunityDetailClient";
import { NoteQuickAdd } from "../../QuickAddForms";
import { requireCapability } from "@/lib/permissions";

const ACTIVITY_LABELS: Record<string, string> = {
  created: "তৈরি হয়েছে",
  researched: "রিসার্চ করা হয়েছে",
  contacted: "যোগাযোগ করা হয়েছে",
  message_sent: "বার্তা পাঠানো হয়েছে",
  call_made: "কল করা হয়েছে",
  response_received: "উত্তর পাওয়া গেছে",
  quotation_sent: "কোটেশন পাঠানো হয়েছে",
  followup: "ফলো-আপ",
  status_changed: "স্ট্যাটাস পরিবর্তন",
  note_added: "নোট যোগ হয়েছে",
  won: "সফল",
  lost: "ব্যর্থ",
  customer_created: "গ্রাহক প্রোফাইল তৈরি হয়েছে",
  order_placed: "অর্ডার স্থাপন করা হয়েছে",
  reward_earned: "পয়েন্ট অর্জিত হয়েছে",
  reward_redeemed: "পয়েন্ট রিডিম করা হয়েছে",
};

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string; oppId: string }>;
}) {
  await requireCapability("view_quotations");
  const { id, oppId } = await params;
  const [business, opportunity] = await Promise.all([getBusinessById(id), getOpportunityById(oppId)]);
  if (!business || !opportunity || opportunity.business_id !== id) notFound();

  const [quotations, activity] = await Promise.all([
    getOpportunityQuotations(oppId),
    getOpportunityActivity(oppId),
  ]);

  const primaryContact = { name: business.name, phone: business.phone ?? "" };

  return (
    <div>
      <Link
        href={`/admin/businesses/${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        {business.name}
      </Link>

      <PageHeader
        title={opportunity.title}
        description={opportunity.service_category ?? undefined}
        action={<StageSelect opportunityId={oppId} businessId={id} currentStage={opportunity.stage} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">কোটেশন</h2>
            {quotations.length > 0 && (
              <div className="mb-4 space-y-3">
                {quotations.map((q) => (
                  <QuotationCard key={q.id} quotation={q} businessId={id} opportunityId={oppId} />
                ))}
              </div>
            )}
            <QuotationForm
              opportunityId={oppId}
              businessId={id}
              defaultCustomerName={primaryContact.name}
              defaultCustomerPhone={primaryContact.phone}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-ink">কার্যক্রম</h2>
          <div className="mt-3">
            <NoteQuickAdd businessId={id} opportunityId={oppId} />
          </div>
          {activity.length === 0 ? (
            <p className="mt-4 text-sm text-ink-faint">এখনও কোনো কার্যক্রম নেই।</p>
          ) : (
            <ul className="mt-4 space-y-3 border-t border-border pt-4">
              {activity.map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="font-medium text-ink">{ACTIVITY_LABELS[a.type] ?? a.type}</p>
                  {a.body && <p className="text-ink-soft">{a.body}</p>}
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {new Date(a.occurred_at).toLocaleString("en-BD")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
