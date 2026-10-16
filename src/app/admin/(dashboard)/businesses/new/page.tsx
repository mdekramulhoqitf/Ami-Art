import { PageHeader } from "@/components/admin/PageHeader";
import { BusinessForm } from "../BusinessForm";
import { createBusiness } from "../actions";
import { requireCapability } from "@/lib/permissions";
import type { BusinessStatus } from "@/lib/types";

export default async function NewBusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: BusinessStatus }>;
}) {
  await requireCapability("create_businesses");
  const { status } = await searchParams;
  return (
    <div>
      <PageHeader
        title={status === "lead" ? "নতুন লিড যোগ করুন" : "নতুন ব্যবসা যোগ করুন"}
        description="একটি সম্ভাব্য বা বিদ্যমান গ্রাহক ব্যবসা যোগ করুন।"
      />
      <BusinessForm action={createBusiness} defaultStatus={status} />
    </div>
  );
}
