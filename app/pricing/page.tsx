import { buildPricingMetadata, PricingPageContent } from "@/components/pricing/pricing-page-content";
import { defaultLocale } from "@/lib/i18n/locales";

export const metadata = buildPricingMetadata(defaultLocale);

type PricingPageProps = {
  searchParams?: Promise<{ waitlist?: string }>;
};

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams;
  const waitlistStatus = params?.waitlist === "confirmed" || params?.waitlist === "invalid" ? params.waitlist : undefined;

  return <PricingPageContent locale={defaultLocale} waitlistStatus={waitlistStatus} />;
}
