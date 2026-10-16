import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Numeral } from "@/components/ui/Numeral";
import { toBengaliDigits } from "@/lib/utils";
import type { AboutContent } from "@/lib/types";

/** Homepage-only "business owner" section — reuses about_content, no separate route. */
export function OwnerSection({ about }: { about: AboutContent }) {
  // owner_show alone isn't enough to prove the section is actually ready —
  // a name with no introduction reads as an unfinished/placeholder entry.
  // Require both the name and a short bio to be real (trimmed, non-empty)
  // before ever rendering this publicly.
  if (!about.owner_show || !about.owner_name?.trim() || !about.owner_short_bio?.trim()) return null;

  const facts = [
    // Experience is a numeric fact — shown in Bengali numerals. Phone is
    // never digit-converted (a real phone number must stay exactly as
    // dialable, leading zero and all).
    about.owner_experience && {
      label: "অভিজ্ঞতা",
      value: toBengaliDigits(about.owner_experience),
      numeric: true,
    },
    about.owner_location && { label: "অবস্থান", value: about.owner_location, numeric: false },
    about.owner_phone && { label: "ফোন", value: about.owner_phone, numeric: false },
  ].filter((f): f is { label: string; value: string; numeric: boolean } => Boolean(f));

  return (
    <section className="bg-dark-soft py-20 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-2">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-primary-500/15 bg-surface shadow-md">
              {about.owner_image_url ? (
                <Image
                  src={about.owner_image_url}
                  alt={about.owner_name}
                  fill
                  sizes="(min-width: 1024px) 32vw, 90vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-5xl font-semibold text-primary-200">
                  {about.owner_name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="text-center lg:col-span-3 lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-200">
              যাঁর হাত ধরে Ami Art
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{about.owner_name}</h2>
            {about.owner_designation && (
              <p className="mt-1.5 text-base font-medium text-white/80">{about.owner_designation}</p>
            )}
            {about.owner_short_bio && (
              <p className="mt-5 text-base leading-relaxed text-white/75">{about.owner_short_bio}</p>
            )}
            {about.owner_bio && (
              <p className="mt-3 text-sm leading-relaxed text-white/75">{about.owner_bio}</p>
            )}

            {facts.length > 0 && (
              <dl className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 lg:justify-start">
                {facts.map((f) => (
                  <div key={f.label} className="text-sm">
                    <dt className="inline text-white/55">{f.label}: </dt>
                    <dd className="inline font-medium text-white">
                      {f.numeric ? <Numeral>{f.value}</Numeral> : f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {about.owner_cta_text && (
              <Button href={about.owner_cta_link || "/contact"} variant="accent" className="mt-7">
                {about.owner_cta_text}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
