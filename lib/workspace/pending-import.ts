export const pendingWorkspaceImportKey = "markdownviewer.workspace.pendingImport";

export type PendingWorkspaceImport = {
  markdown: string;
  sourceInput: string;
  statusMessage?: string;
};

export function parsePendingWorkspaceImport(value: string | null): PendingWorkspaceImport | null {
  if (!value) {
    return null;
  }

  try {
    const payload = JSON.parse(value) as Partial<PendingWorkspaceImport>;

    if (typeof payload.markdown !== "string" || typeof payload.sourceInput !== "string") {
      return null;
    }

    return {
      markdown: payload.markdown,
      sourceInput: payload.sourceInput,
      statusMessage: typeof payload.statusMessage === "string" ? payload.statusMessage : undefined
    };
  } catch {
    return null;
  }
}
