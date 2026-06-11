import { buildPricingMetadata, PricingPageContent } from "@/components/pricing/pricing-page-content";

export const metadata = buildPricingMetadata("zh-CN");

type ChinesePricingPageProps = {
  searchParams?: Promise<{ waitlist?: string }>;
};

export default async function ChinesePricingPage({ searchParams }: ChinesePricingPageProps) {
  const params = await searchParams;
  const waitlistStatus = params?.waitlist === "confirmed" || params?.waitlist === "invalid" ? params.waitlist : undefined;

  return <PricingPageContent locale="zh-CN" waitlistStatus={waitlistStatus} />;
}
