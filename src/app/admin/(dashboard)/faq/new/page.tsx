import { PageHeader } from "@/components/admin/PageHeader";
import { FaqForm } from "../FaqForm";
import { createFaqItem } from "../actions";

export default function NewFaqItemPage() {
  return (
    <div>
      <PageHeader title="নতুন প্রশ্ন যোগ করুন" description="FAQ সেকশনে একটি নতুন প্রশ্ন ও উত্তর যোগ করুন।" />
      <FaqForm action={createFaqItem} />
    </div>
  );
}
