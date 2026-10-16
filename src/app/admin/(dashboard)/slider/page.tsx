import Image from "next/image";
import Link from "next/link";
import { Copy, GalleryHorizontalEnd, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/site/EmptyState";
import { Button } from "@/components/ui/Button";
import { getAllHeroSlides } from "@/lib/queries/hero-slides";
import { formatDate } from "@/lib/utils";
import { deleteHeroSlide, duplicateHeroSlide, toggleHeroSlideActive } from "./actions";

export default async function HeroSliderAdminPage() {
  const slides = await getAllHeroSlides();

  return (
    <div>
      <PageHeader
        title="হিরো ব্যানার"
        description="আপনার হোমপেজের উপরে দেখানো ঘূর্ণায়মান ব্যানারগুলো পরিচালনা করুন।"
        action={
          <Button href="/admin/slider/new" size="sm">
            <Plus className="h-4 w-4" />
            নতুন ব্যানার যোগ করুন
          </Button>
        }
      />

      {slides.length === 0 ? (
        <EmptyState
          icon={GalleryHorizontalEnd}
          title="এখনও কোনো ব্যানার যোগ করা হয়নি।"
          description="ডিফল্ট হোমপেজ হিরো পরিবর্তন করতে আপনার প্রথম ব্যানার যোগ করুন।"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <div key={slide.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative aspect-[16/9] bg-muted">
                <Image
                  src={slide.image_url}
                  alt={slide.alt_text || slide.title || "ব্যানার"}
                  fill
                  sizes="360px"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink">
                    {slide.title || "শিরোনামহীন ব্যানার"}
                  </p>
                  <StatusBadge active={slide.is_active} />
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  ক্রম {slide.display_order} · যোগ করা হয়েছে {formatDate(slide.created_at)}
                </p>

                <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
                  <Link
                    href={`/admin/slider/${slide.id}/edit`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-muted hover:text-ink"
                    aria-label="সম্পাদনা"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <form action={duplicateHeroSlide.bind(null, slide.id)}>
                    <button
                      type="submit"
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-muted hover:text-ink"
                      aria-label="কপি করুন"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={toggleHeroSlideActive.bind(null, slide.id, !slide.is_active)}>
                    <button
                      type="submit"
                      className="rounded-lg px-2.5 h-8 text-xs font-medium text-ink-soft hover:bg-muted hover:text-ink"
                    >
                      {slide.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                    </button>
                  </form>
                  <div className="ml-auto">
                    <ConfirmDialog
                      action={deleteHeroSlide.bind(null, slide.id)}
                      title="ব্যানারটি মুছে ফেলুন"
                      description="এই ব্যানারটি হোমপেজের স্লাইডার থেকে স্থায়ীভাবে মুছে ফেলা হবে।"
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
