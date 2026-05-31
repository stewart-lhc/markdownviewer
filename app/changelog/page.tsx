import {
  buildChangelogMetadata,
  ChangelogPageContent,
  type ChangelogPageContentProps
} from "@/components/changelog/changelog-page-content";
import { defaultLocale } from "@/lib/i18n/locales";

export const metadata = buildChangelogMetadata(defaultLocale);

type ChangelogPageProps = Omit<ChangelogPageContentProps, "locale">;

export default function ChangelogPage(props: ChangelogPageProps) {
  return <ChangelogPageContent {...props} locale={defaultLocale} />;
}
