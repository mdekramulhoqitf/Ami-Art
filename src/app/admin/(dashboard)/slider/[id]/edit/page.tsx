import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { HeroSlideForm } from "../../HeroSlideForm";
import { updateHeroSlide } from "../../actions";
import { getHeroSlideById } from "@/lib/queries/hero-slides";

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slide = await getHeroSlideById(id);
  if (!slide) notFound();

  return (
    <div>
      <PageHeader title="ব্যানার সম্পাদনা করুন" description="এই হোমপেজ হিরো ব্যানারটি হালনাগাদ করুন।" />
      <HeroSlideForm slide={slide} action={updateHeroSlide.bind(null, id)} />
    </div>
  );
}
