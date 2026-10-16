import Link from "next/link";
import { Clock, AlertCircle, CalendarClock, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/site/EmptyState";
import { getFollowupsToday, getOverdueFollowupsList, getUpcomingFollowups } from "@/lib/queries/followups";
import { getCustomersWithOpportunities, type RetentionPriority } from "@/lib/queries/customers";
import { requireCapability } from "@/lib/permissions";
import { ScheduleFollowUpForm } from "@/components/admin/ScheduleFollowUpForm";
import { FollowUpRow } from "./FollowUpRow";

const PRIORITY_LABELS: Record<RetentionPriority, string> = {
  high: "উচ্চ",
  medium: "মাঝারি",
  low: "কম",
};

const PRIORITY_TONE: Record<RetentionPriority, "primary" | "neutral"> = {
  high: "primary",
  medium: "neutral",
  low: "neutral",
};

function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-danger">
      <p className="font-medium">এই তালিকাটি লোড করা যায়নি।</p>
      <p className="mt-0.5 text-xs">{message}</p>
    </div>
  );
}

export default async function FollowUpsPage() {
  await requireCapability("view_leads");
  const [today, overdue, upcoming, opportunities] = await Promise.all([
    getFollowupsToday(),
    getOverdueFollowupsList(),
    getUpcomingFollowups(),
    getCustomersWithOpportunities(),
  ]);

  return (
    <div>
      <PageHeader title="ফলো-আপ" description="আজ কাকে যোগাযোগ করতে হবে, তা এক নজরে দেখুন।" />

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-danger">
            <AlertCircle className="h-4 w-4" /> বকেয়া ({overdue.error ? "?" : overdue.data.length})
          </h2>
          {overdue.error ? (
            <ErrorBanner message={overdue.error} />
          ) : overdue.data.length === 0 ? (
            <EmptyState icon={AlertCircle} title="কোনো বকেয়া ফলো-আপ নেই।" description="সবকিছু সময়মতো করা হয়েছে।" />
          ) : (
            <ul className="space-y-3">
              {overdue.data.map((f) => (
                <FollowUpRow key={f.id} item={f} tone="danger" />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Clock className="h-4 w-4" /> আজকের ফলো-আপ ({today.error ? "?" : today.data.length})
          </h2>
          {today.error ? (
            <ErrorBanner message={today.error} />
          ) : today.data.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="আজ কোনো ফলো-আপ নির্ধারিত নেই।"
              description="ব্যবসা বা গ্রাহকের প্রোফাইল থেকে নতুন ফলো-আপ নির্ধারণ করতে পারেন।"
            />
          ) : (
            <ul className="space-y-3">
              {today.data.map((f) => (
                <FollowUpRow key={f.id} item={f} tone="primary" />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
            <CalendarClock className="h-4 w-4" /> আসন্ন (পরবর্তী ১৪ দিন) ({upcoming.error ? "?" : upcoming.data.length})
          </h2>
          {upcoming.error ? (
            <ErrorBanner message={upcoming.error} />
          ) : upcoming.data.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="আসন্ন কোনো ফলো-আপ নেই।"
              description="পরবর্তী ১৪ দিনের মধ্যে কিছু নির্ধারণ করা নেই।"
            />
          ) : (
            <ul className="space-y-3">
              {upcoming.data.map((f) => (
                <FollowUpRow key={f.id} item={f} tone="neutral" />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
            <Lightbulb className="h-4 w-4" /> গ্রাহক সুযোগ ({opportunities.length})
          </h2>
          {opportunities.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title="এই মুহূর্তে কোনো সম্ভাব্য সুযোগ নেই।"
              description="আগের অর্ডারের ভিত্তিতে সময়মতো এখানে সাজেশন দেখা যাবে।"
            />
          ) : (
            <ul className="space-y-3">
              {opportunities.map((o) => (
                <li key={o.customerId} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/customers/${o.customerId}`}
                        className="text-sm font-semibold text-ink hover:text-primary-700 hover:underline"
                      >
                        {o.customerName}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink-faint">
                        {o.customerNumber} · {o.opportunity.lastCompletedService} —{" "}
                        {o.opportunity.daysSinceLastCompleted} দিন আগে
                      </p>
                    </div>
                    <Badge tone={PRIORITY_TONE[o.opportunity.priority]}>
                      {PRIORITY_LABELS[o.opportunity.priority]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-ink-soft">{o.opportunity.reason}</p>
                  <div className="mt-3">
                    {o.opportunity.existingFollowUpId ? (
                      <p className="text-xs font-medium text-ink-faint">ফলো-আপ ইতিমধ্যে নির্ধারিত</p>
                    ) : (
                      <ScheduleFollowUpForm
                        customerId={o.customerId}
                        defaultReason="repeat_opportunity"
                        defaultNotes={o.opportunity.reason}
                        triggerLabel="ফলো-আপ তৈরি করুন"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
