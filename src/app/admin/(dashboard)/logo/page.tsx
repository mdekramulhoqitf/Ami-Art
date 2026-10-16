import { PageHeader } from "@/components/admin/PageHeader";
import { LogoForm } from "./LogoForm";
import { getLogos } from "@/lib/queries/site";

export default async function LogoAdminPage() {
  const logos = await getLogos();

  return (
    <div>
      <PageHeader
        title="লোগো ও ব্র্যান্ডিং"
        description="আপনার লোগো ও ফেভিকন আপলোড করুন। পরিবর্তন সাথে সাথে পুরো ওয়েবসাইটে প্রয়োগ হবে।"
      />
      <LogoForm logos={logos} />
    </div>
  );
}

export const dynamic = "force-dynamic";
