import { SiteInfoPageContent } from "@/components/site-info/site-info-page-content";
import { buildSiteInfoMetadata } from "@/lib/site-info-pages";

export const metadata = buildSiteInfoMetadata("terms", "zh-CN");

export default function ChineseTermsPage() {
  return <SiteInfoPageContent locale="zh-CN" slug="terms" />;
}
