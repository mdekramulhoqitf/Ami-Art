import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { CurveDivider } from "./CurveDivider";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS } from "./nav-links";
import type { ContactSettings, Service, SiteSettings } from "@/lib/types";

export function Footer({
  siteSettings,
  contactSettings,
  services,
  logoUrl,
}: {
  siteSettings: SiteSettings;
  contactSettings: ContactSettings;
  services: Service[];
  logoUrl: string | null;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto pb-20 lg:pb-0">
      <CurveDivider fillClassName="fill-dark" strokeClassName="stroke-accent-500" />
      <div className="bg-dark">
        <Container className="py-16 sm:py-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo
                logoUrl={logoUrl}
                businessName={siteSettings.business_name}
                variant="light"
                imgClassName="h-14 sm:h-[77px]"
              />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
                {siteSettings.tagline}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">নেভিগেশন</h3>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-border hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">আমাদের সেবা</h3>
              <ul className="mt-4 space-y-2.5">
                {services.length > 0 ? (
                  services.slice(0, 6).map((service) => (
                    <li key={service.id}>
                      <Link
                        href={`/services/${service.id}`}
                        className="text-sm text-border hover:text-white"
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li>
                    <Link href="/services" className="text-sm text-border hover:text-white">
                      সব সেবা দেখুন
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">যোগাযোগ</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href={`tel:${contactSettings.phone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-start gap-2.5 text-sm text-border hover:text-white"
                  >
                    <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                    {contactSettings.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${contactSettings.email}`}
                    className="flex items-start gap-2.5 text-sm text-border hover:text-white"
                  >
                    <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                    {contactSettings.email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-white/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {contactSettings.address}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 text-sm text-white/70 sm:flex-row">
            <p>
              &copy; {year} {siteSettings.business_name}. সর্বস্বত্ব সংরক্ষিত।
            </p>
            {contactSettings.social_links.length > 0 && (
              <div className="flex items-center gap-4">
                {contactSettings.social_links.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>
    </footer>
  );
}
