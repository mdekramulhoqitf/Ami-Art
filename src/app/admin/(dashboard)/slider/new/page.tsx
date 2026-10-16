import { PageHeader } from "@/components/admin/PageHeader";
import { HeroSlideForm } from "../HeroSlideForm";
import { createHeroSlide } from "../actions";

export default function NewHeroSlidePage() {
  return (
    <div>
      <PageHeader title="নতুন ব্যানার যোগ করুন" description="হোমপেজের জন্য একটি নতুন হিরো ব্যানার তৈরি করুন।" />
      <HeroSlideForm action={createHeroSlide} />
    </div>
  );
}
