import { PageHeader } from "@/components/admin/PageHeader";
import { PortfolioForm } from "../PortfolioForm";
import { createPortfolioItem } from "../actions";

export default function NewPortfolioItemPage() {
  return (
    <div>
      <PageHeader title="নতুন প্রকল্প যোগ করুন" description="আপনার পোর্টফোলিওতে একটি নতুন প্রকল্প যোগ করুন।" />
      <PortfolioForm action={createPortfolioItem} />
    </div>
  );
}
