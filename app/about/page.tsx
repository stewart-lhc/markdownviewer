import { SiteInfoPageContent } from "@/components/site-info/site-info-page-content";
import { defaultLocale } from "@/lib/i18n/locales";
import { buildSiteInfoMetadata } from "@/lib/site-info-pages";

export const metadata = buildSiteInfoMetadata("about", defaultLocale);

export default function AboutPage() {
  return <SiteInfoPageContent slug="about" />;
}
