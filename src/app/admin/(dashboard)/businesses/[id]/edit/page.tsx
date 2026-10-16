import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { BusinessForm } from "../../BusinessForm";
import { updateBusiness } from "../../actions";
import { getBusinessById } from "@/lib/queries/businesses";
import { requireCapability } from "@/lib/permissions";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCapability("edit_businesses");
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business) notFound();

  return (
    <div>
      <PageHeader title="ব্যবসা সম্পাদনা করুন" description={business.name} />
      <BusinessForm business={business} action={updateBusiness.bind(null, id)} />
    </div>
  );
}

export const dynamic = "force-dynamic";
