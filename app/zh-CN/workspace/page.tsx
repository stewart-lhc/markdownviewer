import {
  buildWorkspaceMetadata,
  type WorkspacePageContentProps,
  WorkspacePageContent
} from "@/components/workspace/workspace-page-content";

export const metadata = buildWorkspaceMetadata("zh-CN");

type WorkspacePageProps = Omit<WorkspacePageContentProps, "locale">;

export default function ChineseWorkspacePage(props: WorkspacePageProps) {
  return WorkspacePageContent({ ...props, locale: "zh-CN" });
}
