import { SiteInfoPageContent } from "@/components/site-info/site-info-page-content";
import { defaultLocale } from "@/lib/i18n/locales";
import { buildSiteInfoMetadata } from "@/lib/site-info-pages";

export const metadata = buildSiteInfoMetadata("privacy", defaultLocale);

export default function PrivacyPage() {
  return <SiteInfoPageContent slug="privacy" />;
}
