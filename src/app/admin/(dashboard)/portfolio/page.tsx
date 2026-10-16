import Image from "next/image";
import Link from "next/link";
import { Images, Pencil, Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/site/EmptyState";
import { Button } from "@/components/ui/Button";
import { getAllPortfolioItems } from "@/lib/queries/portfolio";
import { cn } from "@/lib/utils";
import { deletePortfolioItem, togglePortfolioActive, togglePortfolioFeatured } from "./actions";

export default async function PortfolioAdminPage() {
  const items = await getAllPortfolioItems();

  return (
    <div>
      <PageHeader
        title="আমাদের কাজ"
        description="আপনার পোর্টফোলিও গ্যালারিতে দেখানো প্রকল্পগুলো পরিচালনা করুন।"
        action={
          <Button href="/admin/portfolio/new" size="sm">
            <Plus className="h-4 w-4" />
            নতুন প্রকল্প যোগ করুন
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={Images} title="এখনও কোনো প্রকল্প যোগ করা হয়নি।" description="আপনার প্রথম প্রকল্পের ছবি যোগ করে শুরু করুন।" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={item.image_url}
                  alt={item.alt_text || item.title}
                  fill
                  sizes="360px"
                  className="object-cover"
                />
                <form
                  action={togglePortfolioFeatured.bind(null, item.id, !item.is_featured)}
                  className="absolute right-2 top-2"
                >
                  <button
                    type="submit"
                    aria-label={item.is_featured ? "ফিচার তুলে নিন" : "হোমপেজে ফিচার করুন"}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full backdrop-blur",
                      item.is_featured ? "bg-accent-500 text-white" : "bg-white/80 text-ink-faint"
                    )}
                  >
                    <Star className="h-4 w-4" fill={item.is_featured ? "currentColor" : "none"} />
                  </button>
                </form>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                  <StatusBadge active={item.is_active} />
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  {item.category || "ক্যাটাগরিহীন"} · ক্রম {item.display_order}
                </p>

                <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
                  <Link
                    href={`/admin/portfolio/${item.id}/edit`}
                    aria-label="সম্পাদনা"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-muted hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <form action={togglePortfolioActive.bind(null, item.id, !item.is_active)}>
                    <button
                      type="submit"
                      className="rounded-lg px-2.5 h-8 text-xs font-medium text-ink-soft hover:bg-muted hover:text-ink"
                    >
                      {item.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                    </button>
                  </form>
                  <div className="ml-auto">
                    <ConfirmDialog
                      action={deletePortfolioItem.bind(null, item.id)}
                      title="প্রকল্পটি মুছে ফেলুন"
                      description={`"${item.title}" আপনার পোর্টফোলিও থেকে স্থায়ীভাবে মুছে ফেলা হবে।`}
                      confirmLabel="মুছে ফেলুন"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
