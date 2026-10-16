import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "../../ServiceForm";
import { updateService } from "../../actions";
import { getServiceById } from "@/lib/queries/services";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  return (
    <div>
      <PageHeader title="সেবা সম্পাদনা করুন" description="এই সেবাটি হালনাগাদ করুন।" />
      <ServiceForm service={service} action={updateService.bind(null, id)} />
    </div>
  );
}
