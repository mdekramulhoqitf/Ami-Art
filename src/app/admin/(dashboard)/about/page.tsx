import { PageHeader } from "@/components/admin/PageHeader";
import { AboutForm } from "./AboutForm";
import { getAboutContent } from "@/lib/queries/site";

export default async function AboutAdminPage() {
  const about = await getAboutContent();

  return (
    <div>
      <PageHeader title="আমাদের সম্পর্কে" description="আপনার About পাতায় দেখানো কনটেন্ট সম্পাদনা করুন।" />
      <AboutForm about={about} />
    </div>
  );
}

export const dynamic = "force-dynamic";
