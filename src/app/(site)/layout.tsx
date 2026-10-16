import { Navbar } from "@/components/site/Navbar";
import { ContactStrip } from "@/components/site/ContactStrip";
import { Footer } from "@/components/site/Footer";
import { MobileActionBar } from "@/components/site/MobileActionBar";
import { getSiteSettings, getContactSettings, getLogos } from "@/lib/queries/site";
import { getActiveServices } from "@/lib/queries/services";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteSettings, contactSettings, logos, services] = await Promise.all([
    getSiteSettings(),
    getContactSettings(),
    getLogos(),
    getActiveServices(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteSettings.business_name,
    description: siteSettings.meta_description,
    telephone: contactSettings.phone,
    email: contactSettings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: contactSettings.address,
      addressCountry: "BD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactStrip contact={contactSettings} />
      <Navbar logoUrl={logos.primary_logo_url} businessName={siteSettings.business_name} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer
        siteSettings={siteSettings}
        contactSettings={contactSettings}
        services={services}
        logoUrl={logos.light_logo_url ?? logos.primary_logo_url}
      />
      <MobileActionBar phone={contactSettings.phone} />
    </>
  );
}
