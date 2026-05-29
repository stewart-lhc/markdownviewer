import { buildHomeMetadata, HomePageContent } from "@/components/landing/home-page-content";

export const metadata = buildHomeMetadata("zh-CN");

export default function ChineseHomePage() {
  return <HomePageContent locale="zh-CN" />;
}
