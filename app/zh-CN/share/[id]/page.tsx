import {
  buildShareMetadata,
  type SharePageContentProps,
  SharePageContent
} from "@/components/share/share-page-content";

type SharePageProps = Omit<SharePageContentProps, "locale">;

export function generateMetadata(props: SharePageProps) {
  return buildShareMetadata({ ...props, locale: "zh-CN" });
}

export default function ChineseSharePage(props: SharePageProps) {
  return SharePageContent({ ...props, locale: "zh-CN" });
}
