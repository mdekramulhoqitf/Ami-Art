import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "./SettingsForm";
import { DeliverySettingsForm } from "./DeliverySettingsForm";
import { ImageSizeGuideTable } from "@/components/admin/ImageSizeGuide";
import { getSiteSettings } from "@/lib/queries/site";

export default async function SettingsAdminPage() {
  const siteSettings = await getSiteSettings();

  return (
    <div>
      <PageHeader title="ওয়েবসাইট সেটিংস" description="সাধারণ সাইট সেটিংস, হোমপেজের কনটেন্ট ও SEO।" />
      <div className="space-y-10">
        <SettingsForm siteSettings={siteSettings} />
        <DeliverySettingsForm deliverySettings={siteSettings.delivery_settings} />
        <div>
          <h2 className="mb-3 text-base font-semibold text-ink">ছবির মাপের গাইড</h2>
          <p className="mb-4 text-sm text-ink-soft">
            সাইটের যেকোনো জায়গায় ছবি আপলোডের আগে এই টেবিল দেখে নিন — কোন জায়গায় কোন মাপের ছবি লাগবে।
          </p>
          <ImageSizeGuideTable />
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
