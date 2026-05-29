import {
  buildWorkspaceMetadata,
  type WorkspacePageContentProps,
  WorkspacePageContent
} from "@/components/workspace/workspace-page-content";
import { defaultLocale } from "@/lib/i18n/locales";

export const metadata = buildWorkspaceMetadata(defaultLocale);

type WorkspacePageProps = Omit<WorkspacePageContentProps, "locale">;

export default function WorkspacePage(props: WorkspacePageProps) {
  return WorkspacePageContent({ ...props, locale: defaultLocale });
}
