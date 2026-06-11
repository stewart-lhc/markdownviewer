import { SiteInfoPageContent } from "@/components/site-info/site-info-page-content";
import { buildSiteInfoMetadata } from "@/lib/site-info-pages";

export const metadata = buildSiteInfoMetadata("contact", "zh-CN");

export default function ChineseContactPage() {
  return <SiteInfoPageContent locale="zh-CN" slug="contact" />;
}
