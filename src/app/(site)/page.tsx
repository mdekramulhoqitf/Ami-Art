import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hero } from "@/components/site/Hero";
import { ServiceCard } from "@/components/site/ServiceCard";
import { SERVICE_ICONS, DEFAULT_SERVICE_ICON } from "@/components/site/service-icons";
import { PortfolioCard } from "@/components/site/PortfolioCard";
import { CTASection } from "@/components/site/CTASection";
import { OwnerSection } from "@/components/site/OwnerSection";
import { OrderCtaButton } from "@/components/site/OrderCtaButton";
import { WhyChooseUsSection } from "@/components/site/WhyChooseUsSection";
import { FaqSection } from "@/components/site/FaqSection";
import { CurveDivider } from "@/components/site/CurveDivider";
import { SectionCoverImage } from "@/components/site/SectionCoverImage";
import { getActiveHeroSlides } from "@/lib/queries/hero-slides";
import { getActiveServices } from "@/lib/queries/services";
import { getFeaturedPortfolioItems } from "@/lib/queries/portfolio";
import { getAboutContent, getContactSettings, getSiteSettings } from "@/lib/queries/site";
import { getActiveWhyChooseUsItems } from "@/lib/queries/why-choose-us";
import { getActiveFaqItems } from "@/lib/queries/faq";
import { getActiveSectionBanner } from "@/lib/queries/section-banners";

export default async function HomePage() {
  const [slides, siteSettings, services, featured, about, contactSettings, whyChooseUs, faqItems, whyChooseUsBanner] =
    await Promise.all([
      getActiveHeroSlides(),
      getSiteSettings(),
      getActiveServices(),
      getFeaturedPortfolioItems(),
      getAboutContent(),
      getContactSettings(),
      getActiveWhyChooseUsItems(),
      getActiveFaqItems(),
      getActiveSectionBanner("why_choose_us"),
    ]);

  return (
    <>
      <Hero slides={slides} heading={siteSettings.intro_heading} body={siteSettings.intro_body} />

      {/* Quick service categories */}
      {services.length > 0 && (
        <section className="border-b border-border bg-surface py-6">
          <Container>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {services.slice(0, 6).map((service) => {
                const Icon = (service.icon && SERVICE_ICONS[service.icon]) || DEFAULT_SERVICE_ICON;
                return (
                  <Link
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="flex items-center gap-2 rounded-full border border-border bg-page px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-primary-500 hover:text-primary-700"
                  >
                    <Icon className="h-4 w-4 text-primary-600" strokeWidth={1.75} />
                    {service.title}
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Trust / intro */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="কেন আমাদের বেছে নেবেন"
            title="ছোট-বড় সব কাজেই একইভাবে যত্নশীল"
            highlight="যত্নশীল"
            description="বরগুনায় স্থানীয়ভাবে পরিচালিত, নিজস্ব প্রিন্টিং সুবিধাসহ — তাই কাজের মান ও সময় দুটোই আমাদের নিয়ন্ত্রণে থাকে।"
          />
          {siteSettings.trust_badges.length > 0 && (
            <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
              {siteSettings.trust_badges.map((badge) => (
                <div
                  key={badge.title}
                  className="rounded-2xl border border-border bg-surface p-6 text-center"
                >
                  <p className="text-base font-semibold text-ink">{badge.title}</p>
                  <p className="mt-1.5 text-sm text-ink-soft">{badge.description}</p>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Capabilities */}
      {siteSettings.capability_highlights.length > 0 && (
        <section className="bg-surface py-20 sm:py-24">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="আমরা কীভাবে সাহায্য করি"
              title="ডিজাইন থেকে প্রিন্ট—সবকিছু এক জায়গা থেকে"
              highlight="এক জায়গা থেকে"
              description="আপনার প্রয়োজনটা বললেই হবে। সাইজ, ডিজাইন বা টেকনিক্যাল বিষয় নিয়ে নিশ্চিত না থাকলেও সমস্যা নেই — বাকিটা আমরা বুঝিয়ে এগিয়ে নিই।"
            />
            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {siteSettings.capability_highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-surface p-5 text-center"
                >
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{item.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="bg-page py-20 sm:py-24">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="আমাদের সেবা"
                title="ব্যানার থেকে ভিজিটিং কার্ড, যা লাগবে সবই পাবেন"
                highlight="যা লাগবে সবই পাবেন"
                description="ব্যানার, সাইন, প্রিন্ট, পোশাক বা ডিজাইনের কাজ—যা লাগবে বলুন, আমরা বানিয়ে দিই।"
              />
              <Button href="/services" variant="secondary" className="shrink-0">
                সব সেবা দেখুন
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <OrderCtaButton />
            </div>
          </Container>
        </section>
      )}

      {/* How your work moves forward */}
      {about.process_steps.length > 0 && (
        <section className="bg-surface py-20 sm:py-24">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="প্রক্রিয়া"
              title="আপনার কাজ কীভাবে এগোবে"
              highlight="এগোবে"
              description="অর্ডার দেওয়ার পর কী হয়, তা আগে থেকেই স্পষ্ট থাকা উচিত।"
            />
            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {about.process_steps.map((step, i) => (
                <div key={step.title} className="text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                    {i + 1}
                  </div>
                  <p className="mt-4 text-base font-semibold text-ink">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Why choose us */}
      {whyChooseUs.length > 0 && (
        <>
          <CurveDivider fillClassName="fill-dark-soft" />
          <section className="bg-dark-soft py-20 sm:py-24">
            <Container>
              <SectionCoverImage banner={whyChooseUsBanner} />
              <SectionHeading
                align="center"
                eyebrow="কেন আমাদের বেছে নেবেন"
                title="কেন Ami Art থেকে নেবেন?"
                highlight="কেন"
                tone="dark"
              />
              <div className="mx-auto mt-14 max-w-5xl">
                <WhyChooseUsSection items={whyChooseUs} />
              </div>
            </Container>
          </section>
        </>
      )}

      {/* Featured portfolio */}
      {featured.length > 0 && (
        <section className="bg-surface py-20 sm:py-24">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="যে কাজগুলো করেছি"
                title="আমাদের কাজের কিছু উদাহরণ"
                highlight="উদাহরণ"
                description="বিভিন্ন ধরনের ডিজাইন, প্রিন্ট ও সাইনেজ কাজের কিছু নমুনা।"
              />
              <Button href="/portfolio" variant="secondary" className="shrink-0">
                সম্পূর্ণ পোর্টফোলিও দেখুন
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* About preview */}
      <section className="bg-surface py-20 sm:py-24">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="আমি আর্ট সম্পর্কে" title={about.heading} highlight="সম্পর্কে" />
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              {about.story}
            </p>
            <Button href="/about" variant="secondary" className="mt-7">
              বিস্তারিত দেখুন
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {about.why_choose_us.slice(0, 4).map((item) => (
              <div key={item.title} className="rounded-2xl bg-surface p-5 shadow-sm">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="bg-page py-20 sm:py-24">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="প্রশ্ন থাকলে জানুন"
              title="সচরাচর জিজ্ঞাসা"
              highlight="জিজ্ঞাসা"
              description="ডিজাইন বা সাইজ নিয়ে নিশ্চিত না থাকলেও অসুবিধা নেই — অর্ডারের আগে এখানে সাধারণ উত্তরগুলো দেখে নিন।"
            />
            <div className="mt-14">
              <FaqSection items={faqItems} />
            </div>
          </Container>
        </section>
      )}

      <OwnerSection about={about} />

      <CTASection phone={contactSettings.phone} />
    </>
  );
}

export const revalidate = 60;
