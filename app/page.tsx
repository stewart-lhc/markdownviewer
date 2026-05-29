import { buildHomeMetadata, HomePageContent } from "@/components/landing/home-page-content";
import { defaultLocale } from "@/lib/i18n/locales";

export const metadata = buildHomeMetadata(defaultLocale);

export default function HomePage() {
  return <HomePageContent locale={defaultLocale} />;
}
