import { PageHeader } from "@/components/admin/PageHeader";
import { WhyChooseUsForm } from "../WhyChooseUsForm";
import { createWhyChooseUsItem } from "../actions";

export default function NewWhyChooseUsItemPage() {
  return (
    <div>
      <PageHeader title="নতুন সুবিধা যোগ করুন" description="Why Choose Us সেকশনে একটি নতুন সুবিধা যোগ করুন।" />
      <WhyChooseUsForm action={createWhyChooseUsItem} />
    </div>
  );
}
