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

  it("keeps the new tab file picker click in the direct user action", () => {
    const start = source.indexOf("function handleNewTabFile()");
    const end = source.indexOf("async function handleNewTabFileSelected");
    const handler = source.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(handler).not.toContain("async function handleNewTabFile");

    const fastPathStart = handler.indexOf("return;\n    }\n\n    newTabFileInputRef.current?.click();");
    const fastPath = handler.slice(fastPathStart);
    const pickerClick = fastPath.indexOf("newTabFileInputRef.current?.click()");

    expect(fastPathStart).toBeGreaterThan(-1);
    expect(fastPath.slice(0, pickerClick)).not.toContain("await");
    expect(pickerClick).toBeLessThan(fastPath.indexOf("setNewTabDialogOpen(false)", pickerClick));
  });
});
