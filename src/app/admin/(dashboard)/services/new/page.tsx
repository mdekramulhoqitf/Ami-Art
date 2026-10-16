import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "../ServiceForm";
import { createService } from "../actions";

export default function NewServicePage() {
  return (
    <div>
      <PageHeader title="নতুন সেবা যোগ করুন" description="একটি নতুন সেবা তৈরি করুন।" />
      <ServiceForm action={createService} />
    </div>
  );
}
