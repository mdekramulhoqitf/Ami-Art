import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionBannerForm } from "../../SectionBannerForm";
import { getSectionBannerBySlug } from "@/lib/queries/section-banners";
import type { SectionBannerSlug } from "@/lib/types";

const SLUG_LABELS: Record<SectionBannerSlug, string> = {
  about: "আমাদের সম্পর্কে",
  services: "আমাদের সেবাসমূহ",
  portfolio: "আমাদের কাজ",
  why_choose_us: "কেন আমাদের বেছে নেবেন",
  contact: "যোগাযোগ",
};

export default async function EditSectionBannerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const banner = await getSectionBannerBySlug(slug);
  if (!banner) notFound();

  const label = SLUG_LABELS[slug as SectionBannerSlug] ?? banner.title ?? slug;

  return (
    <div>
      <PageHeader title={`কভার ছবি — ${label}`} description="এই সেকশনের কভার ছবি ও সেটিংস পরিচালনা করুন। ছবি না দিলে পাতার আগের ডিজাইনই থাকবে।" />
      <SectionBannerForm banner={banner} label={label} />
    </div>
  );
}

export const dynamic = "force-dynamic";
