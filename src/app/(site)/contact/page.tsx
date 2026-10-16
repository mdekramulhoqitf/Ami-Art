import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/site/ContactForm";
import { SectionCoverImage } from "@/components/site/SectionCoverImage";
import { getContactSettings, getSiteSettings } from "@/lib/queries/site";
import { getActiveServices } from "@/lib/queries/services";
import { getActiveSectionBanner } from "@/lib/queries/section-banners";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: "যোগাযোগ",
    description: `সাইনেজ, প্রিন্টিং ও ডিজাইনের কাজের জন্য বরগুনার ${site.business_name}-এর সাথে যোগাযোগ করুন।`,
  };
}

export default async function ContactPage() {
  const [contactSettings, services, coverBanner] = await Promise.all([
    getContactSettings(),
    getActiveServices(),
    getActiveSectionBanner("contact"),
  ]);

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionCoverImage banner={coverBanner} />
        <SectionHeading
          eyebrow="আপনার কথা শুনতে আমরা প্রস্তুত"
          title="আপনার প্রয়োজনটা আমাদের বলুন"
          highlight="বলুন"
          description="কাজের ধরন, সাইজ বা ফাইল নিয়ে নিশ্চিত না হলেও সমস্যা নেই। আগে কথা বলতে চাইলেও যোগাযোগ করতে পারেন।"
          align="center"
        />

        <div className="mx-auto mt-6 max-w-5xl text-center">
          <p className="text-sm text-ink-soft">
            নির্দিষ্ট কাজের অর্ডার দিতে চান?{" "}
            <Link href="/order" className="inline-flex items-center gap-1 font-medium text-primary-700 hover:underline">
              ঘরে বসে অর্ডার করুন
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <a
                href={`tel:${contactSettings.phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-start gap-4 rounded-2xl border border-border p-5 transition-colors hover:border-primary-500"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-soft">মোবাইল</p>
                  <p className="mt-0.5 text-base font-semibold text-ink">
                    {contactSettings.phone}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${contactSettings.email}`}
                className="flex items-start gap-4 rounded-2xl border border-border p-5 transition-colors hover:border-primary-500"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-soft">ই-মেইল</p>
                  <p className="mt-0.5 text-base font-semibold text-ink">
                    {contactSettings.email}
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4 rounded-2xl border border-border p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-soft">ঠিকানা</p>
                  <p className="mt-0.5 text-base font-semibold text-ink">
                    {contactSettings.address}
                  </p>
                </div>
              </div>
            </div>

            {contactSettings.map_embed_url && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                <iframe
                  src={contactSettings.map_embed_url}
                  title="আমি আর্টের অবস্থান"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-64 w-full border-0"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:col-span-3">
            <ContactForm services={services} />
          </div>
        </div>
      </Container>
    </section>
  );
}

export const revalidate = 60;
