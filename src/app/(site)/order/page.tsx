import type { Metadata } from "next";
import { OrderForm } from "./OrderForm";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { getActiveServices } from "@/lib/queries/services";
import { getSiteSettings } from "@/lib/queries/site";
import { getReorderDataByToken } from "@/lib/queries/orders";
import { getRewardWalletByToken } from "@/lib/queries/rewards";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: "ঘরে বসে অর্ডার করুন",
    description: `${site.business_name}-এ ঘরে বসে অর্ডার করুন — আপনার কাজের বিস্তারিত লিখুন, ছবি সংযুক্ত করুন এবং অর্ডার পাঠান।`,
  };
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; ref?: string; reorder?: string }>;
}) {
  const [services, params] = await Promise.all([getActiveServices(), searchParams]);
  const [reorderData, reorderWallet] = params.reorder
    ? await Promise.all([getReorderDataByToken(params.reorder), getRewardWalletByToken(params.reorder)])
    : [null, null];

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-600">
            আপনার কাজের তথ্য দিন
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            <Highlight text="আপনি কী কাজ করাতে চান?" pick="কাজ" />
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            আপনার প্রয়োজনটা যতটা সহজভাবে পারেন লিখুন। সাইজ, ডিজাইন বা টেকনিক্যাল বিষয় না জানলেও
            সমস্যা নেই — প্রয়োজনে আমরা পরবর্তী ধাপে আপনাকে গাইড করব।
          </p>
        </div>
        <OrderForm
          services={services}
          initialServiceId={params.service}
          initialReferralCode={params.ref}
          reorderData={reorderData}
          reorderAvailableReward={reorderWallet?.available ?? null}
        />
      </Container>
    </section>
  );
}

export const dynamic = "force-dynamic";
