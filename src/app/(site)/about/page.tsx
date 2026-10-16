import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTASection } from "@/components/site/CTASection";
import { SectionCoverImage } from "@/components/site/SectionCoverImage";
import { getAboutContent, getContactSettings, getSiteSettings } from "@/lib/queries/site";
import { getActiveSectionBanner } from "@/lib/queries/section-banners";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: "আমাদের সম্পর্কে",
    description: `${site.business_name} সম্পর্কে জানুন — বরগুনার একটি ডিজিটাল সাইন, প্রিন্টিং ও ডিজাইন প্রতিষ্ঠান।`,
  };
}

export default async function AboutPage() {
  const [about, contactSettings, coverBanner] = await Promise.all([
    getAboutContent(),
    getContactSettings(),
    getActiveSectionBanner("about"),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-muted py-20 sm:py-24">
        <div aria-hidden="true" className="dot-grid-bg absolute inset-0 opacity-[0.3]" />
        <Container className="relative">
          <SectionCoverImage banner={coverBanner} />
          <SectionHeading
            eyebrow="আমি আর্ট সম্পর্কে"
            title={about.heading}
            highlight="সম্পর্কে"
            align="center"
          />
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              আমাদের গল্প
            </h3>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">{about.story}</p>
          </div>
          <div className="space-y-10">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-600">
                লক্ষ্য
              </h3>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">{about.mission}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-600">
                ভবিষ্যৎ পরিকল্পনা
              </h3>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">{about.vision}</p>
            </div>
          </div>
        </Container>
      </section>

      {about.image_url && (
        <Container className="pb-4">
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={about.image_url}
              alt={about.heading}
              fill
              sizes="(min-width: 1024px) 1200px, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      )}

      {about.why_choose_us.length > 0 && (
        <section className="bg-muted py-20 sm:py-24">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="কেন আমাদের বেছে নেবেন"
              title="আমি আর্টকে যা আলাদা করে"
              highlight="আলাদা করে"
            />
            <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
              {about.why_choose_us.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-surface p-6">
                  <p className="text-base font-semibold text-ink">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {about.process_steps.length > 0 && (
        <section className="py-20 sm:py-24">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="আমরা যেভাবে কাজ করি"
              title="আমাদের কাজের ধাপ"
              highlight="ধাপ"
            />
            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {about.process_steps.map((step, i) => (
                <div key={step.title} className="text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                    {i + 1}
                  </div>
                  <p className="mt-4 text-base font-semibold text-ink">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CTASection phone={contactSettings.phone} />
    </>
  );
}

export const revalidate = 60;
