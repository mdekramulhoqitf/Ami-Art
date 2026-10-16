import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqSection } from "@/components/site/FaqSection";
import { getActiveFaqItems } from "@/lib/queries/faq";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "সাধারণ জিজ্ঞাসা",
    description:
      "অর্ডার, ডিজাইন, প্রিন্ট, মূল্য ও ডেলিভারি নিয়ে সাধারণ প্রশ্নগুলোর উত্তর।",
  };
}

export default async function FaqPage() {
  const faqItems = await getActiveFaqItems();

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="সাধারণ জিজ্ঞাসা"
          title="কিছু জানতে চান?"
          description="অর্ডার, ডিজাইন, প্রিন্ট বা ডেলিভারি নিয়ে সাধারণ প্রশ্নগুলোর উত্তর এখানে পাবেন।"
        />

        <div className="mt-14">
          {faqItems.length === 0 ? (
            <p className="text-center text-sm text-ink-soft">
              এখনও কোনো প্রশ্নোত্তর যোগ করা হয়নি। প্রয়োজনে সরাসরি যোগাযোগ করুন।
            </p>
          ) : (
            <FaqSection items={faqItems} visibleCount={Infinity} />
          )}
        </div>

        <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-base font-semibold text-ink">আপনার প্রশ্নের উত্তর এখানে না থাকলে?</p>
          <div className="mt-5">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-6 py-3 text-sm font-medium text-white hover:bg-primary-600"
            >
              আমাদের সাথে কথা বলুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            নির্দিষ্ট কাজের অর্ডার দিতে চান?{" "}
            <Link href="/order" className="font-medium text-primary-700 hover:underline">
              ঘরে বসে অর্ডার করুন
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
