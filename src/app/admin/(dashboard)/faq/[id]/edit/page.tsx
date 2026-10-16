import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { FaqForm } from "../../FaqForm";
import { updateFaqItem } from "../../actions";
import { getFaqItemById } from "@/lib/queries/faq";

export default async function EditFaqItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getFaqItemById(id);
  if (!item) notFound();

  return (
    <div>
      <PageHeader title="প্রশ্ন সম্পাদনা করুন" description="এই FAQ আইটেমটি হালনাগাদ করুন।" />
      <FaqForm item={item} action={updateFaqItem.bind(null, id)} />
    </div>
  );
}
