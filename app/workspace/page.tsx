import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { resolveInitialWorkspaceDocument } from "@/lib/workspace/resolve-initial-document";

export const metadata: Metadata = {
  title: "Online Markdown Viewer Workspace - Live Preview",
  description:
    "Paste, edit, or load Markdown from files, GitHub, Gists, and raw URLs in a live online Markdown preview workspace.",
  alternates: {
    canonical: "/workspace"
  },
  openGraph: {
    title: "Online Markdown Viewer Workspace - Live Preview",
    description:
      "Paste, edit, or load Markdown from files, GitHub, Gists, and raw URLs in a live online Markdown preview workspace.",
    url: "https://markdownviewer.run/workspace"
  },
  twitter: {
    title: "Online Markdown Viewer Workspace - Live Preview",
    description:
      "Paste, edit, or load Markdown from files, GitHub, Gists, and raw URLs in a live online Markdown preview workspace."
  }
};

type WorkspacePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function takeFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const resolvedParams = await searchParams;
  const initialDocument = await resolveInitialWorkspaceDocument(resolvedParams);
  const hasExplicitDocument = Boolean(takeFirst(resolvedParams.share) || takeFirst(resolvedParams.source));

  return (
    <main>
      <WorkspaceShell
        initialStatusMessage={initialDocument.statusMessage}
        markdown={initialDocument.markdown}
        sourceInput={initialDocument.sourceInput}
        tabRestoreStrategy={hasExplicitDocument ? "merge" : "restore"}
      />
    </main>
  );
}
