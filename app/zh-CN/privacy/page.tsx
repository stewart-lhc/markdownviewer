import { SiteInfoPageContent } from "@/components/site-info/site-info-page-content";
import { buildSiteInfoMetadata } from "@/lib/site-info-pages";

export const metadata = buildSiteInfoMetadata("privacy", "zh-CN");

export default function ChinesePrivacyPage() {
  return <SiteInfoPageContent locale="zh-CN" slug="privacy" />;
}
