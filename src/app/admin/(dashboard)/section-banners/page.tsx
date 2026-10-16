import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Pencil } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAllSectionBanners } from "@/lib/queries/section-banners";
import type { SectionBannerSlug } from "@/lib/types";

const SLUG_LABELS: Record<SectionBannerSlug, string> = {
  about: "আমাদের সম্পর্কে",
  services: "আমাদের সেবাসমূহ",
  portfolio: "আমাদের কাজ",
  why_choose_us: "কেন আমাদের বেছে নেবেন",
  contact: "যোগাযোগ",
};

const SLUG_PUBLIC_PATHS: Record<SectionBannerSlug, string> = {
  about: "/about",
  services: "/services",
  portfolio: "/portfolio",
  why_choose_us: "/",
  contact: "/contact",
};

export default async function SectionBannersAdminPage() {
  const banners = await getAllSectionBanners();

  return (
    <div>
      <PageHeader
        title="সেকশন কভার ছবি"
        description="ওয়েবসাইটের প্রতিটি প্রধান পাতার উপরের কভার ছবি পরিচালনা করুন — সম্পূর্ণ ঐচ্ছিক, না দিলে পাতার আগের ডিজাইনই থাকবে।"
      />

      <ul className="space-y-3">
        {banners.map((banner) => {
          const slug = banner.slug as SectionBannerSlug;
          return (
            <li
              key={banner.slug}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                  {banner.image_url ? (
                    <Image src={banner.image_url} alt="" fill className="object-cover" sizes="112px" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-ink-faint" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink">
                      {SLUG_LABELS[slug] ?? banner.title ?? banner.slug}
                    </p>
                    <StatusBadge active={banner.is_visible} />
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">
                    {banner.image_url ? "কভার ছবি সেট করা আছে" : "কোনো কভার ছবি নেই — ডিফল্ট ডিজাইন দেখা যাচ্ছে"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={SLUG_PUBLIC_PATHS[slug] ?? "/"}
                  target="_blank"
                  className="rounded-lg px-3 py-2 text-xs font-medium text-ink-soft hover:bg-muted hover:text-ink"
                >
                  প্রিভিউ
                </Link>
                <Link
                  href={`/admin/section-banners/${banner.slug}/edit`}
                  aria-label="সম্পাদনা"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-muted hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const dynamic = "force-dynamic";
