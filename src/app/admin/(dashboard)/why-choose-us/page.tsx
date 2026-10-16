import Link from "next/link";
import { Award, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/site/EmptyState";
import { Button } from "@/components/ui/Button";
import { WHY_CHOOSE_US_ICONS, DEFAULT_WHY_CHOOSE_US_ICON } from "@/components/site/why-choose-us-icons";
import { getAllWhyChooseUsItems } from "@/lib/queries/why-choose-us";
import { deleteWhyChooseUsItem, toggleWhyChooseUsActive } from "./actions";

export default async function WhyChooseUsAdminPage() {
  const items = await getAllWhyChooseUsItems();

  return (
    <div>
      <PageHeader
        title="কেন Ami Art থেকে নেবেন?"
        description="হোমপেজের Why Choose Us সেকশনে দেখানো সুবিধাগুলো পরিচালনা করুন।"
        action={
          <Button href="/admin/why-choose-us/new" size="sm">
            <Plus className="h-4 w-4" />
            নতুন সুবিধা যোগ করুন
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={Award} title="এখনও কোনো সুবিধা যোগ করা হয়নি।" description="গ্রাহকদের জন্য প্রথম সুবিধাটি যোগ করে শুরু করুন।" />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const Icon = (item.icon && WHY_CHOOSE_US_ICONS[item.icon]) || DEFAULT_WHY_CHOOSE_US_ICON;
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                        <StatusBadge active={item.is_active} />
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{item.description}</p>
                      <p className="mt-1.5 text-xs text-ink-faint">ক্রম {item.display_order}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/why-choose-us/${item.id}/edit`}
                      aria-label="সম্পাদনা"
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-muted hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={toggleWhyChooseUsActive.bind(null, item.id, !item.is_active)}>
                      <button
                        type="submit"
                        className="h-9 rounded-lg px-2.5 text-xs font-medium text-ink-soft hover:bg-muted hover:text-ink"
                      >
                        {item.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                      </button>
                    </form>
                    <ConfirmDialog
                      action={deleteWhyChooseUsItem.bind(null, item.id)}
                      title="সুবিধাটি মুছে ফেলুন"
                      description={`"${item.title}" স্থায়ীভাবে মুছে ফেলা হবে।`}
                      confirmLabel="মুছে ফেলুন"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
