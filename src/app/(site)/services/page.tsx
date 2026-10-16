import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { EmptyState } from "@/components/site/EmptyState";
import { CTASection } from "@/components/site/CTASection";
import { SectionCoverImage } from "@/components/site/SectionCoverImage";
import { getActiveServices } from "@/lib/queries/services";
import { getContactSettings, getSiteSettings } from "@/lib/queries/site";
import { getActiveSectionBanner } from "@/lib/queries/section-banners";
import { Wrench } from "lucide-react";
import type { Service } from "@/lib/types";

/** Groups services by their existing `category` field, preserving the order
    categories first appear in (i.e. admin's own display_order), rather than
    inventing a category ranking. Uncategorized services form one trailing,
    unlabeled group. */
function groupByCategory(services: Service[]): [string, Service[]][] {
  const groups = new Map<string, Service[]>();
  for (const service of services) {
    const key = service.category?.trim() || "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(service);
  }
  return Array.from(groups.entries());
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: "আমাদের সেবা",
    description: `${site.business_name}-এর ডিজিটাল সাইনবোর্ড, প্রিন্টিং ও গ্রাফিক ডিজাইন সেবা — বরগুনা।`,
  };
}

export default async function ServicesPage() {
  const [services, contactSettings, coverBanner] = await Promise.all([
    getActiveServices(),
    getContactSettings(),
    getActiveSectionBanner("services"),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-muted py-20 sm:py-24">
        <div aria-hidden="true" className="dot-grid-bg absolute inset-0 opacity-[0.3]" />
        <Container className="relative">
          <SectionCoverImage banner={coverBanner} />
          <SectionHeading
            eyebrow="আমাদের সেবা"
            title="আমরা যা যা করি"
            highlight="যা যা করি"
            description="সাইনবোর্ড থেকে ভিজিটিং কার্ড—নিচে সব সেবা দেওয়া আছে। যেটা লাগবে সেটাতে ক্লিক করুন।"
            align="center"
          />
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          {services.length > 0 ? (
            <div className="space-y-16">
              {groupByCategory(services).map(([category, items]) => (
                <div key={category}>
                  {category && (
                    <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-primary-600">
                      {category}
                    </h2>
                  )}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Wrench}
              title="সেবার তালিকা শীঘ্রই আসছে"
              description="আমরা আমাদের সম্পূর্ণ সেবার তালিকা প্রস্তুত করছি। সরাসরি যোগাযোগ করুন, আমরা সাহায্য করতে পারব।"
            />
          )}
        </Container>
      </section>

      <CTASection phone={contactSettings.phone} />
    </>
  );
}

export const revalidate = 60;
