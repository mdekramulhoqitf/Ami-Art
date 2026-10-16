import Link from "next/link";
import {
  Building2,
  Plus,
  UserPlus,
  CalendarClock,
  AlertCircle,
  Sparkles,
  FileText,
  Clock,
  Lightbulb,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/site/EmptyState";
import { getBusinesses, getCrmSummary, getRecentActivity } from "@/lib/queries/businesses";
import { getCustomersWithOpportunities } from "@/lib/queries/customers";
import { requireCapability } from "@/lib/permissions";
import type { BusinessStatus } from "@/lib/types";

const STATUS_LABELS: Record<BusinessStatus, string> = {
  prospect: "প্রসপেক্ট",
  lead: "লিড",
  customer: "গ্রাহক",
  inactive: "নিষ্ক্রিয়",
};

const STATUS_TONE: Record<BusinessStatus, "primary" | "accent" | "success" | "neutral"> = {
  prospect: "neutral",
  lead: "accent",
  customer: "success",
  inactive: "neutral",
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

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: BusinessStatus }>;
}) {
  await requireCapability("view_businesses");
  const params = await searchParams;
  const [businesses, summary, recentActivity, opportunities] = await Promise.all([
    getBusinesses({ search: params.q, status: params.status }),
    getCrmSummary(),
    getRecentActivity(6),
    getCustomersWithOpportunities(),
  ]);

  const summaryTiles = [
    { icon: CalendarClock, label: "আজকের ফলো-আপ", value: summary.followupsToday, tone: "primary" as const },
    { icon: AlertCircle, label: "বকেয়া ফলো-আপ", value: summary.followupsOverdue, tone: "danger" as const },
    { icon: Sparkles, label: "নতুন ব্যবসা (৭ দিন)", value: summary.newBusinessesThisWeek, tone: "neutral" as const },
    { icon: UserPlus, label: "আগ্রহী লিড", value: summary.interestedLeads, tone: "primary" as const },
    { icon: FileText, label: "অপেক্ষমাণ কোটেশন", value: summary.pendingQuotations, tone: "neutral" as const },
    { icon: Lightbulb, label: "ফলো-আপের সুযোগ", value: opportunities.length, tone: "neutral" as const },
  ];

  return (
    <div>
      <PageHeader
        title="ব্যবসা ও লিড"
        description="সম্ভাব্য ও বিদ্যমান গ্রাহক ব্যবসার তালিকা পরিচালনা করুন।"
        action={
          <div className="flex flex-wrap gap-2">
            <Button href="/admin/businesses/new?status=lead" variant="secondary" size="sm">
              <UserPlus className="h-4 w-4" />
              নতুন লিড যোগ করুন
            </Button>
            <Button href="/admin/businesses/new" size="sm">
              <Plus className="h-4 w-4" />
              নতুন ব্যবসা যোগ করুন
            </Button>
          </div>
        }
      />

      {/* Command center summary strip */}
      <div className="mb-6 rounded-2xl bg-dark-soft p-5">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">আজকের অবস্থা</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {summaryTiles.map((tile) => (
            <div key={tile.label} className="rounded-xl border border-white/10 bg-dark p-4">
              <tile.icon
                className={`h-4 w-4 ${tile.tone === "danger" ? "text-accent-500" : "text-white"}`}
              />
              <p className="mt-2 text-2xl font-semibold text-white">{tile.value}</p>
              <p className="mt-0.5 text-xs text-white/60">{tile.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form className="mb-6 flex flex-wrap gap-2">
            <input
              type="text"
              name="q"
              defaultValue={params.q}
              placeholder="নাম, ফোন বা এলাকা দিয়ে খুঁজুন..."
              className="h-11 min-w-[220px] flex-1 rounded-lg border border-border bg-surface px-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="h-11 rounded-lg border border-border bg-surface px-3.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="">সব স্ট্যাটাস</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              খুঁজুন
            </Button>
          </form>

          {businesses.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="এখনও কোনো ব্যবসা যোগ করা হয়নি।"
              description="আপনার প্রথম সম্ভাব্য গ্রাহক ব্যবসা যোগ করে শুরু করুন।"
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="divide-y divide-border">
                {businesses.map((b) => (
                  <Link
                    key={b.id}
                    href={`/admin/businesses/${b.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-muted"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-ink">{b.name}</p>
                        <Badge tone={STATUS_TONE[b.business_status]}>{STATUS_LABELS[b.business_status]}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-ink-soft">
                        {[b.category, b.area, b.phone].filter(Boolean).join(" · ") || "কোনো বিস্তারিত তথ্য নেই"}
                      </p>
                      {b.next_followup_at && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-primary-700">
                          <Clock className="h-3 w-3" />
                          পরবর্তী ফলো-আপ: {new Date(b.next_followup_at).toLocaleDateString("en-BD")}
                        </p>
                      )}
                    </div>
                    {b.priority_level && b.priority_level !== "normal" && (
                      <Badge tone={b.priority_level === "urgent" ? "danger" : "accent"}>
                        {b.priority_level === "urgent" ? "জরুরি" : b.priority_level === "high" ? "উচ্চ" : "কম"}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-ink">সাম্প্রতিক কার্যক্রম</h2>
          {recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-ink-faint">এখনও কোনো কার্যক্রম নেই।</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentActivity.map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="font-medium text-ink">
                    {ACTIVITY_LABELS[a.type] ?? a.type}
                    {a.business_name && <span className="text-ink-faint"> · {a.business_name}</span>}
                  </p>
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
