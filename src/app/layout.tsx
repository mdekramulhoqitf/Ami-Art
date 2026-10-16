import type { Metadata } from "next";
import { Hind_Siliguri, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { getLogos, getSiteSettings } from "@/lib/queries/site";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Hind Siliguri's ১ (1) and ৯ (9) glyphs are barely distinguishable at small
// sizes (both render as a small curly hook) — Noto Sans Bengali's digits are
// clearly differentiated. Used ONLY for numeric output (see .font-numeral /
// `--font-numeral` in globals.css), never for body Bengali text, so the
// site's existing typography is untouched.
const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [site, logos] = await Promise.all([getSiteSettings(), getLogos()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: {
      default: site.meta_title,
      template: `%s | ${site.business_name}`,
    },
    description: site.meta_description,
    openGraph: {
      title: site.meta_title,
      description: site.meta_description,
      siteName: site.business_name,
      images: site.og_image_url ? [site.og_image_url] : undefined,
      locale: "bn_BD",
      type: "website",
    },
    twitter: {
      card: site.og_image_url ? "summary_large_image" : "summary",
      title: site.meta_title,
      description: site.meta_description,
      images: site.og_image_url ? [site.og_image_url] : undefined,
    },
    icons: logos.favicon_url ? { icon: logos.favicon_url } : undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${notoSansBengali.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white"
        >
          মূল কনটেন্টে যান
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
