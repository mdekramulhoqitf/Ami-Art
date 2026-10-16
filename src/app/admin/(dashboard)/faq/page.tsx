import Link from "next/link";
import { HelpCircle, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/site/EmptyState";
import { Button } from "@/components/ui/Button";
import { getAllFaqItems } from "@/lib/queries/faq";
import { deleteFaqItem, toggleFaqActive } from "./actions";

export default async function FaqAdminPage() {
  const items = await getAllFaqItems();

  return (
    <div>
      <PageHeader
        title="সচরাচর জিজ্ঞাসা (FAQ)"
        description="ওয়েবসাইটের FAQ সেকশনে দেখানো প্রশ্ন ও উত্তর পরিচালনা করুন।"
        action={
          <Button href="/admin/faq/new" size="sm">
            <Plus className="h-4 w-4" />
            নতুন প্রশ্ন যোগ করুন
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={HelpCircle} title="এখনও কোনো প্রশ্ন যোগ করা হয়নি।" description="গ্রাহকদের সাধারণ প্রশ্নের উত্তর যোগ করে শুরু করুন।" />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{item.question}</p>
                    <StatusBadge active={item.is_active} />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{item.answer}</p>
                  <p className="mt-1.5 text-xs text-ink-faint">ক্রম {item.display_order}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/faq/${item.id}/edit`}
                    aria-label="সম্পাদনা"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-muted hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <form action={toggleFaqActive.bind(null, item.id, !item.is_active)}>
                    <button
                      type="submit"
                      className="h-9 rounded-lg px-2.5 text-xs font-medium text-ink-soft hover:bg-muted hover:text-ink"
                    >
                      {item.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                    </button>
                  </form>
                  <ConfirmDialog
                    action={deleteFaqItem.bind(null, item.id)}
                    title="প্রশ্নটি মুছে ফেলুন"
                    description={`"${item.question}" স্থায়ীভাবে মুছে ফেলা হবে।`}
                    confirmLabel="মুছে ফেলুন"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
