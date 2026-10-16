import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PortfolioGrid } from "@/components/site/PortfolioGrid";
import { CTASection } from "@/components/site/CTASection";
import { SectionCoverImage } from "@/components/site/SectionCoverImage";
import { getActivePortfolioItems } from "@/lib/queries/portfolio";
import { getContactSettings, getSiteSettings } from "@/lib/queries/site";
import { getActiveSectionBanner } from "@/lib/queries/section-banners";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: "আমাদের কাজ",
    description: `${site.business_name}-এর সাইনেজ, প্রিন্ট ও ডিজাইনের নির্বাচিত প্রকল্প।`,
  };
}

export default async function PortfolioPage() {
  const [items, contactSettings, coverBanner] = await Promise.all([
    getActivePortfolioItems(),
    getContactSettings(),
    getActiveSectionBanner("portfolio"),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-muted py-20 sm:py-24">
        <div aria-hidden="true" className="dot-grid-bg absolute inset-0 opacity-[0.3]" />
        <Container className="relative">
          <SectionCoverImage banner={coverBanner} />
          <SectionHeading
            eyebrow="আমাদের কাজ"
            title="যে কাজগুলো করেছি"
            highlight="করেছি"
            description="বিভিন্ন ধরনের ডিজাইন, প্রিন্ট ও সাইনেজ কাজের কিছু উদাহরণ।"
            align="center"
          />
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <PortfolioGrid items={items} />
        </Container>
      </section>

      <CTASection phone={contactSettings.phone} />
    </>
  );
}

export const revalidate = 60;
