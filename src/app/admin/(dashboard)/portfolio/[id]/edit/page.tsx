import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { PortfolioForm } from "../../PortfolioForm";
import { updatePortfolioItem } from "../../actions";
import { getPortfolioItemById } from "@/lib/queries/portfolio";

export default async function EditPortfolioItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPortfolioItemById(id);
  if (!item) notFound();

  return (
    <div>
      <PageHeader title="প্রকল্প সম্পাদনা করুন" description="এই পোর্টফোলিও প্রকল্পটি হালনাগাদ করুন।" />
      <PortfolioForm item={item} action={updatePortfolioItem.bind(null, id)} />
    </div>
  );
}
