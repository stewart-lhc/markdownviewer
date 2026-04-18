import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { resolveInitialWorkspaceDocument } from "@/lib/workspace/resolve-initial-document";

type WorkspacePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const resolvedParams = await searchParams;
  const initialDocument = await resolveInitialWorkspaceDocument(resolvedParams);

  return (
    <main>
      <WorkspaceShell
        initialStatusMessage={initialDocument.statusMessage}
        markdown={initialDocument.markdown}
        sourceInput={initialDocument.sourceInput}
      />
    </main>
  );
}
