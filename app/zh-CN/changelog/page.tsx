import {
  buildChangelogMetadata,
  ChangelogPageContent,
  type ChangelogPageContentProps
} from "@/components/changelog/changelog-page-content";

export const metadata = buildChangelogMetadata("zh-CN");

type ChangelogPageProps = Omit<ChangelogPageContentProps, "locale">;

export default function ChineseChangelogPage(props: ChangelogPageProps) {
  return <ChangelogPageContent {...props} locale="zh-CN" />;
}
