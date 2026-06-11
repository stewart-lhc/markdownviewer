import { SiteInfoPageContent } from "@/components/site-info/site-info-page-content";
import { buildSiteInfoMetadata } from "@/lib/site-info-pages";

export const metadata = buildSiteInfoMetadata("about", "zh-CN");

export default function ChineseAboutPage() {
  return <SiteInfoPageContent locale="zh-CN" slug="about" />;
}
