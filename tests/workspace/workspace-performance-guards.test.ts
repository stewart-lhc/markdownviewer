import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("D:/GitHub/markdownviewer/components/workspace/workspace-shell.tsx", "utf8");

describe("workspace performance guards", () => {
  it("keeps preview rendering on deferred markdown", () => {
    expect(source).toContain("const previewMarkdown = useDeferredValue(currentMarkdown);");
    expect(source).toContain("useMemo(() => extractHeadings(previewMarkdown), [previewMarkdown])");
  });

  it("does not recompute the active tab title from immediate markdown during tab rendering", () => {
    expect(source).toContain("tab.id === activeTabId ? documentTitle : getWorkspaceTabTitle(tab, messages)");
  });

  it("skips unchanged draft and tab storage writes", () => {
    expect(source).toContain("lastStoredTabsJsonRef");
    expect(source).toContain("lastStoredDraftRef");
    expect(source).toContain("persistStoredWorkspaceTabs");
    expect(source).toContain("persistWorkspaceDraft");
  });
});
