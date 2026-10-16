import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Phone, MapPin, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  getBusinessById,
  getBusinessContacts,
  getBusinessOpportunities,
  getBusinessActivity,
} from "@/lib/queries/businesses";
import { getFollowupsForBusiness } from "@/lib/queries/followups";
import { requireCapability } from "@/lib/permissions";
import type { BusinessStatus, OpportunityStage, FollowUpReason } from "@/lib/types";
import { archiveBusiness } from "../actions";
import { ContactQuickAdd, OpportunityQuickAdd, NoteQuickAdd } from "./QuickAddForms";
import { ScheduleFollowUpForm } from "@/components/admin/ScheduleFollowUpForm";

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

const STATUS_LABELS: Record<BusinessStatus, string> = {
  prospect: "প্রসপেক্ট",
  lead: "লিড",
  customer: "গ্রাহক",
  inactive: "নিষ্ক্রিয়",
};

const STAGE_LABELS: Record<OpportunityStage, string> = {
  new: "নতুন",
  researching: "রিসার্চ চলছে",
  qualified: "যোগ্য বিবেচিত",
  contacted: "যোগাযোগ হয়েছে",
  interested: "আগ্রহী",
  quotation_sent: "কোটেশন পাঠানো হয়েছে",
  negotiation: "আলোচনা চলছে",
  won: "সফল",
  lost: "ব্যর্থ",
  follow_up: "ফলো-আপ",
};

const STAGE_TONE: Record<OpportunityStage, "primary" | "accent" | "success" | "danger" | "neutral"> = {
  new: "neutral",
  researching: "neutral",
  qualified: "primary",
  contacted: "primary",
  interested: "accent",
  quotation_sent: "accent",
  negotiation: "accent",
  won: "success",
  lost: "danger",
  follow_up: "accent",
};

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

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCapability("view_businesses");
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business) notFound();

  const [contacts, opportunities, activity, followUps] = await Promise.all([
    getBusinessContacts(id),
    getBusinessOpportunities(id),
    getBusinessActivity(id),
    getFollowupsForBusiness(id),
  ]);
  const pendingFollowUps = followUps.filter((f) => f.status === "pending");

  return (
    <div>
      <PageHeader
        title={business.name}
        description={[business.category, business.area].filter(Boolean).join(" · ") || undefined}
        action={
          <div className="flex gap-2">
            <Button href={`/admin/businesses/${id}/edit`} variant="secondary" size="sm">
              <Pencil className="h-4 w-4" />
              সম্পাদনা করুন
            </Button>
            {business.business_status !== "inactive" && (
              <ConfirmDialog
                action={archiveBusiness.bind(null, id)}
                title="ব্যবসাটি নিষ্ক্রিয় করুন"
                description={`"${business.name}" নিষ্ক্রিয় হিসেবে চিহ্নিত হবে। কোনো তথ্য মুছে যাবে না।`}
                confirmLabel="নিষ্ক্রিয় করুন"
              />
            )}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge tone="primary">{STATUS_LABELS[business.business_status]}</Badge>
        {business.priority_level && business.priority_level !== "normal" && (
          <Badge tone={business.priority_level === "urgent" ? "danger" : "accent"}>
            অগ্রাধিকার: {business.priority_level === "urgent" ? "জরুরি" : business.priority_level === "high" ? "উচ্চ" : "কম"}
          </Badge>
        )}
        <Badge tone="neutral">যাচাই: {business.verification_status}</Badge>
        {business.tags.map((tag) => (
          <Badge key={tag} tone="neutral">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Follow-ups */}
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink">ফলো-আপ</h2>
              <ScheduleFollowUpForm businessId={id} />
            </div>
            {pendingFollowUps.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {pendingFollowUps.map((f) => (
                  <li key={f.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium text-ink">{FOLLOWUP_REASON_LABELS[f.reason]}</p>
                    <p className="text-ink-faint">
                      {new Date(f.scheduled_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-faint">কোনো নির্ধারিত ফলো-আপ নেই।</p>
            )}
          </div>

          {/* Profile */}
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink">মূল তথ্য</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {business.address && (
                <div className="flex items-start gap-2 text-ink-soft">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {business.address}
                </div>
              )}
              {business.phone && (
                <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-ink-soft hover:text-ink">
                  <Phone className="h-4 w-4 shrink-0" /> {business.phone}
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-ink-soft hover:text-ink"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" /> {business.website}
                </a>
              )}
            </dl>
            {business.notes && (
              <p className="mt-4 whitespace-pre-wrap border-t border-border pt-3 text-sm text-ink-soft">
                {business.notes}
              </p>
            )}
          </div>

          {/* Contacts */}
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink">কন্ট্যাক্ট</h2>
            {contacts.length > 0 && (
              <ul className="mt-3 space-y-2">
                {contacts.map((c) => (
                  <li key={c.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium text-ink">
                      {c.name} {c.is_primary && <Badge tone="primary">প্রধান</Badge>}
                    </p>
                    <p className="text-ink-faint">{[c.role, c.phone, c.email].filter(Boolean).join(" · ")}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <ContactQuickAdd businessId={id} />
            </div>
          </div>

          {/* Opportunities */}
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink">সুযোগ (Opportunities)</h2>
            {opportunities.length > 0 && (
              <ul className="mt-3 space-y-2">
                {opportunities.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/admin/businesses/${id}/opportunities/${o.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm hover:border-primary-500"
                    >
                      <div>
                        <p className="font-medium text-ink">{o.title}</p>
                        {o.estimated_value != null && (
                          <p className="text-ink-faint">৳ {o.estimated_value.toLocaleString("en-BD")}</p>
                        )}
                      </div>
                      <Badge tone={STAGE_TONE[o.stage]}>{STAGE_LABELS[o.stage]}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <OpportunityQuickAdd businessId={id} />
            </div>
          </div>
        </div>

        {/* Activity timeline */}
        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-ink">কার্যক্রম</h2>
          <div className="mt-3">
            <NoteQuickAdd businessId={id} opportunityId={null} />
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
