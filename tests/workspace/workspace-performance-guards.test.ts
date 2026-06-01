import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("D:/GitHub/markdownviewer/components/workspace/workspace-shell.tsx", "utf8");

describe("workspace performance guards", () => {
  it("keeps preview rendering on deferred markdown", () => {
    expect(source).toContain("const previewMarkdown = useDeferredValue(currentMarkdown);");
    expect(source).toContain("useMemo(() => extractHeadings(previewMarkdown), [previewMarkdown])");
  });

  it("skips unchanged draft storage writes", () => {
    expect(source).toContain("lastStoredDraftRef");
    expect(source).toContain("persistWorkspaceDraft");
  });
});
