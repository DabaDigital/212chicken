import type { Metadata, Viewport } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { openGraphBase, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/metadata";
import { isIndexable, siteUrl } from "@/lib/site";
import { organizationJsonLd } from "@/lib/structured-data";

import { anton, dmSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  title: { default: SITE_TITLE, template: "%s · 212 Chicken" },
  description: SITE_DESCRIPTION,
  applicationName: "212 Chicken",
  openGraph: openGraphBase(),
  twitter: { card: "summary_large_image" },
  robots: isIndexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
    : { index: false, follow: false },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff8e8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = organizationJsonLd();
  return (
    <html lang="fr-MA" className={`${anton.variable} ${dmSans.variable}`}>
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body> before hydration. This exempts
          only the <body> tag itself; the elements inside it are still hydration-checked. */}
      <body suppressHydrationWarning>
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <div className="page-frame">
          <SiteHeader />
          <main id="contenu" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
        </div>
        {jsonLd ? <JsonLd data={jsonLd} /> : null}
      </body>
    </html>
  );
}
