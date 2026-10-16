import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { WhyChooseUsForm } from "../../WhyChooseUsForm";
import { updateWhyChooseUsItem } from "../../actions";
import { getWhyChooseUsItemById } from "@/lib/queries/why-choose-us";

export default async function EditWhyChooseUsItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getWhyChooseUsItemById(id);
  if (!item) notFound();

  return (
    <div>
      <PageHeader title="সুবিধা সম্পাদনা করুন" description="এই Why Choose Us আইটেমটি হালনাগাদ করুন।" />
      <WhyChooseUsForm item={item} action={updateWhyChooseUsItem.bind(null, id)} />
    </div>
  );
}
