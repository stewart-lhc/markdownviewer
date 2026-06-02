# MarkItDown Conversion MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-upload document conversion flow that converts supported Office/HTML/data/text-heavy PDF files to Markdown, opens the converted Markdown in a new workspace tab, and never stores original or converted files on the server beyond the request.

**Architecture:** Add a small browser helper for conversion file validation and `/api/convert` requests, a Node-only MarkItDown runner used by a new API route, and workspace UI wiring that opens converted results as persistent local tabs. Keep existing Markdown file import, PWA launch, local folder workspace, and remote Markdown import unchanged.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest/jsdom, Node `child_process`, OS temp directories, Microsoft MarkItDown CLI.

---

## File Structure

- Create `lib/workspace/convert-document.ts`: shared browser-safe conversion constants, extension checks, response parsing, and `convertDocumentToMarkdown`.
- Create `tests/workspace/convert-document.test.ts`: unit tests for the browser helper.
- Create `lib/server/markitdown-runner.ts`: Node-only temporary file lifecycle and MarkItDown CLI runner.
- Create `app/api/convert/route.ts`: `multipart/form-data` API route for one uploaded file.
- Create `tests/workspace/convert-route.test.ts`: API route tests with a mocked runner.
- Modify `lib/i18n/messages.ts`: add English and Chinese toolbar/status strings for conversion.
- Modify `components/workspace/workspace-toolbar.tsx`: add a separate hidden conversion file input and menu/button entry.
- Modify `components/workspace/workspace-shell.tsx`: add `converted-file` tab kind, conversion handler, new tab creation, local persistence support, and toolbar wiring.
- Modify `tests/workspace/workspace-shell.test.tsx`: add coverage for automatic converted tab creation, local persistence, and Markdown import non-regression.
- No production deployment work is included in this plan.

## Task 1: Browser-Safe Conversion Helper

**Files:**
- Create: `lib/workspace/convert-document.ts`
- Test: `tests/workspace/convert-document.test.ts`

- [ ] **Step 1: Write the failing helper tests**

Create `tests/workspace/convert-document.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import {
  convertDocumentToMarkdown,
  convertedDocumentAccept,
  isConvertibleDocumentFile,
  maxConvertedDocumentBytes
} from "@/lib/workspace/convert-document";

describe("convert-document helper", () => {
  it("recognizes supported conversion files without treating Markdown as convertible", () => {
    expect(convertedDocumentAccept).toContain(".docx");
    expect(isConvertibleDocumentFile(new File(["demo"], "brief.DOCX"))).toBe(true);
    expect(isConvertibleDocumentFile(new File(["demo"], "slides.pptx"))).toBe(true);
    expect(isConvertibleDocumentFile(new File(["demo"], "table.xls"))).toBe(true);
    expect(isConvertibleDocumentFile(new File(["demo"], "report.pdf"))).toBe(true);
    expect(isConvertibleDocumentFile(new File(["# Demo"], "readme.md"))).toBe(false);
    expect(isConvertibleDocumentFile(new File(["demo"], "image.png"))).toBe(false);
  });

  it("posts supported files to the convert api and returns Markdown", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        markdown: "# Converted",
        label: "Converted document",
        sourceName: "brief.docx"
      })
    });

    const result = await convertDocumentToMarkdown(
      new File(["demo"], "brief.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }),
      fetcher
    );

    expect(fetcher).toHaveBeenCalledWith(
      "/api/convert",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData)
      })
    );
    expect(result).toEqual({
      markdown: "# Converted",
      label: "Converted document",
      sourceName: "brief.docx"
    });
  });

  it("rejects unsupported and oversized files before posting", async () => {
    const fetcher = vi.fn();

    await expect(
      convertDocumentToMarkdown(new File(["demo"], "image.png"), fetcher)
    ).rejects.toThrow("This file type is not supported for Markdown conversion.");

    const oversizedFile = new File(["demo"], "huge.pdf");
    Object.defineProperty(oversizedFile, "size", {
      configurable: true,
      value: maxConvertedDocumentBytes + 1
    });

    await expect(convertDocumentToMarkdown(oversizedFile, fetcher)).rejects.toThrow(
      "This file is too large to convert."
    );
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("surfaces api errors and empty conversion payloads", async () => {
    await expect(
      convertDocumentToMarkdown(
        new File(["demo"], "brief.docx"),
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ error: "Conversion timed out. Try a smaller or simpler file." })
        })
      )
    ).rejects.toThrow("Conversion timed out. Try a smaller or simpler file.");

    await expect(
      convertDocumentToMarkdown(
        new File(["demo"], "brief.docx"),
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ markdown: "", label: "Converted document", sourceName: "brief.docx" })
        })
      )
    ).rejects.toThrow("The converted Markdown was empty.");
  });
});
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run: `npm test -- tests/workspace/convert-document.test.ts`

Expected: FAIL because `@/lib/workspace/convert-document` does not exist.

- [ ] **Step 3: Implement the browser helper**

Create `lib/workspace/convert-document.ts`:

```ts
export type ConvertedMarkdownDocument = {
  label: string;
  markdown: string;
  sourceName: string;
};

type Fetcher = typeof fetch;

export const convertedDocumentExtensions = [
  ".docx",
  ".pptx",
  ".xlsx",
  ".xls",
  ".csv",
  ".html",
  ".htm",
  ".json",
  ".xml",
  ".pdf"
] as const;

export const convertedDocumentAccept = convertedDocumentExtensions.join(",");
export const maxConvertedDocumentBytes = 20 * 1024 * 1024;
export const maxConvertedMarkdownCharacters = 2_000_000;

const convertApiPath = "/api/convert";

export function getConvertibleDocumentExtension(fileName: string) {
  const lowerName = fileName.toLowerCase();

  return convertedDocumentExtensions.find((extension) => lowerName.endsWith(extension));
}

export function isConvertibleDocumentFile(file: Pick<File, "name">) {
  return Boolean(getConvertibleDocumentExtension(file.name));
}

function assertConvertibleDocument(file: File) {
  if (!isConvertibleDocumentFile(file)) {
    throw new Error("This file type is not supported for Markdown conversion.");
  }

  if (file.size > maxConvertedDocumentBytes) {
    throw new Error("This file is too large to convert.");
  }
}

async function readConversionError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };

    if (payload.error) {
      return payload.error;
    }
  } catch {
    // Fall through to the generic error below.
  }

  return "Failed to convert the selected file.";
}

function normalizeConversionPayload(payload: unknown): ConvertedMarkdownDocument {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const markdown = typeof record.markdown === "string" ? record.markdown : "";
  const label = typeof record.label === "string" && record.label ? record.label : "Converted document";
  const sourceName = typeof record.sourceName === "string" && record.sourceName ? record.sourceName : "converted-file";

  if (!markdown.trim()) {
    throw new Error("The converted Markdown was empty.");
  }

  if (markdown.length > maxConvertedMarkdownCharacters) {
    throw new Error("The converted Markdown is too large to load.");
  }

  return {
    label,
    markdown,
    sourceName
  };
}

export async function convertDocumentToMarkdown(
  file: File,
  fetcher: Fetcher = fetch
): Promise<ConvertedMarkdownDocument> {
  assertConvertibleDocument(file);

  const body = new FormData();
  body.append("file", file);

  const response = await fetcher(convertApiPath, {
    method: "POST",
    body
  });

  if (!response.ok) {
    throw new Error(await readConversionError(response));
  }

  return normalizeConversionPayload(await response.json());
}
```

- [ ] **Step 4: Run the helper tests to verify they pass**

Run: `npm test -- tests/workspace/convert-document.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add lib/workspace/convert-document.ts tests/workspace/convert-document.test.ts
git commit -m "feat: add document conversion helper"
```

## Task 2: Server Conversion API With Mockable Runner

**Files:**
- Create: `lib/server/markitdown-runner.ts`
- Create: `app/api/convert/route.ts`
- Test: `tests/workspace/convert-route.test.ts`

- [ ] **Step 1: Write the failing API route tests**

Create `tests/workspace/convert-route.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/convert/route";
import { convertFileWithMarkItDown } from "@/lib/server/markitdown-runner";

vi.mock("@/lib/server/markitdown-runner", () => ({
  convertFileWithMarkItDown: vi.fn()
}));

const mockedConvertFileWithMarkItDown = vi.mocked(convertFileWithMarkItDown);

function createConvertRequest(file: File) {
  const body = new FormData();
  body.append("file", file);

  return new Request("https://markdownviewer.run/api/convert", {
    method: "POST",
    body
  });
}

describe("convert api route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("converts one supported uploaded document and returns Markdown", async () => {
    mockedConvertFileWithMarkItDown.mockResolvedValue("# Converted DOCX");

    const response = await POST(
      createConvertRequest(
        new File(["demo"], "brief.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        })
      )
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      label: "Converted document",
      markdown: "# Converted DOCX",
      sourceName: "brief.docx"
    });
    expect(mockedConvertFileWithMarkItDown).toHaveBeenCalledWith(expect.any(File));
  });

  it("rejects unsupported, missing, oversized, and empty conversion files", async () => {
    const unsupported = await POST(createConvertRequest(new File(["demo"], "image.png")));
    expect(unsupported.status).toBe(400);
    expect(await unsupported.json()).toEqual({
      error: "This file type is not supported for Markdown conversion."
    });

    const emptyBody = new FormData();
    const missing = await POST(
      new Request("https://markdownviewer.run/api/convert", {
        method: "POST",
        body: emptyBody
      })
    );
    expect(missing.status).toBe(400);
    expect(await missing.json()).toEqual({ error: "Provide one file to convert." });

    const oversizedFile = new File(["demo"], "huge.pdf");
    Object.defineProperty(oversizedFile, "size", {
      configurable: true,
      value: 20 * 1024 * 1024 + 1
    });
    const oversized = await POST(createConvertRequest(oversizedFile));
    expect(oversized.status).toBe(413);
    expect(await oversized.json()).toEqual({ error: "This file is too large to convert." });

    mockedConvertFileWithMarkItDown.mockResolvedValue("   ");
    const empty = await POST(createConvertRequest(new File(["demo"], "empty.docx")));
    expect(empty.status).toBe(422);
    expect(await empty.json()).toEqual({ error: "The converted Markdown was empty." });
  });

  it("maps runner timeout and unavailable errors to clear statuses", async () => {
    mockedConvertFileWithMarkItDown.mockRejectedValueOnce(
      new Error("Conversion timed out. Try a smaller or simpler file.")
    );
    const timeout = await POST(createConvertRequest(new File(["demo"], "slow.pdf")));
    expect(timeout.status).toBe(504);
    expect(await timeout.json()).toEqual({
      error: "Conversion timed out. Try a smaller or simpler file."
    });

    mockedConvertFileWithMarkItDown.mockRejectedValueOnce(
      new Error("MarkItDown is not available in this deployment.")
    );
    const unavailable = await POST(createConvertRequest(new File(["demo"], "brief.docx")));
    expect(unavailable.status).toBe(500);
    expect(await unavailable.json()).toEqual({
      error: "MarkItDown is not available in this deployment."
    });
  });
});
```

- [ ] **Step 2: Run the API tests to verify they fail**

Run: `npm test -- tests/workspace/convert-route.test.ts`

Expected: FAIL because `@/app/api/convert/route` and `@/lib/server/markitdown-runner` do not exist.

- [ ] **Step 3: Implement the Node-only runner**

Create `lib/server/markitdown-runner.ts`:

```ts
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { maxConvertedMarkdownCharacters } from "@/lib/workspace/convert-document";

const execFileAsync = promisify(execFile);
const conversionTimeoutMs = 45_000;
const maxBufferBytes = Math.ceil(maxConvertedMarkdownCharacters * 4);

function sanitizeTempFileName(fileName: string) {
  const trimmed = fileName.trim() || "document";

  return trimmed.replace(/[^\w.-]+/g, "_").slice(0, 160) || "document";
}

function normalizeRunnerError(error: unknown) {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};

  if (record.code === "ENOENT") {
    return new Error("MarkItDown is not available in this deployment.");
  }

  if (record.killed === true || record.signal === "SIGTERM") {
    return new Error("Conversion timed out. Try a smaller or simpler file.");
  }

  return new Error("Failed to convert the selected file.");
}

export async function convertFileWithMarkItDown(file: File) {
  const tempDirectory = await mkdtemp(join(tmpdir(), "markdownviewer-convert-"));
  const tempFilePath = join(tempDirectory, `${randomUUID()}-${sanitizeTempFileName(file.name)}`);

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFilePath, bytes);

    const { stdout } = await execFileAsync("markitdown", [tempFilePath], {
      timeout: conversionTimeoutMs,
      maxBuffer: maxBufferBytes,
      windowsHide: true
    });

    return stdout;
  } catch (error) {
    throw normalizeRunnerError(error);
  } finally {
    await rm(tempDirectory, {
      force: true,
      recursive: true
    });
  }
}
```

- [ ] **Step 4: Implement the API route**

Create `app/api/convert/route.ts`:

```ts
import { NextResponse } from "next/server";
import {
  isConvertibleDocumentFile,
  maxConvertedDocumentBytes,
  maxConvertedMarkdownCharacters
} from "@/lib/workspace/convert-document";
import { convertFileWithMarkItDown } from "@/lib/server/markitdown-runner";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function statusForConversionError(message: string) {
  if (message === "Conversion timed out. Try a smaller or simpler file.") {
    return 504;
  }

  if (message === "MarkItDown is not available in this deployment.") {
    return 500;
  }

  if (message === "The converted Markdown was empty.") {
    return 422;
  }

  return 500;
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Conversion requests must include multipart form data.");
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Provide one file to convert.");
  }

  if (!isConvertibleDocumentFile(file)) {
    return jsonError("This file type is not supported for Markdown conversion.");
  }

  if (file.size > maxConvertedDocumentBytes) {
    return jsonError("This file is too large to convert.", 413);
  }

  try {
    const markdown = await convertFileWithMarkItDown(file);

    if (!markdown.trim()) {
      return jsonError("The converted Markdown was empty.", 422);
    }

    if (markdown.length > maxConvertedMarkdownCharacters) {
      return jsonError("The converted Markdown is too large to load.", 413);
    }

    return NextResponse.json({
      label: "Converted document",
      markdown,
      sourceName: file.name
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to convert the selected file.";

    return jsonError(message, statusForConversionError(message));
  }
}
```

- [ ] **Step 5: Run the API tests to verify they pass**

Run: `npm test -- tests/workspace/convert-route.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add app/api/convert/route.ts lib/server/markitdown-runner.ts tests/workspace/convert-route.test.ts
git commit -m "feat: add document conversion api"
```

## Task 3: Workspace Copy and Toolbar Entry

**Files:**
- Modify: `lib/i18n/messages.ts`
- Modify: `components/workspace/workspace-toolbar.tsx`
- Test: `tests/workspace/workspace-shell.test.tsx`

- [ ] **Step 1: Write the failing toolbar visibility test**

Append this test near the existing import interaction tests in `tests/workspace/workspace-shell.test.tsx`:

```ts
  it("shows a dedicated document conversion entry in the import controls", () => {
    render(<WorkspaceShell markdown="" sourceInput="" />);

    expect(screen.getByRole("button", { name: /convert/i })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the focused workspace test to verify it fails**

Run: `npm test -- tests/workspace/workspace-shell.test.tsx -t "document conversion entry"`

Expected: FAIL because no `Convert` button exists.

- [ ] **Step 3: Add i18n strings**

Modify `Messages["workspace"]["status"]` and `Messages["workspace"]["toolbar"]` in `lib/i18n/messages.ts`:

```ts
    status: {
      closedTab: string;
      convertedFile: (fileName: string) => string;
      convertingFile: (fileName: string) => string;
      exportedHtml: string;
      linkCopied: string;
      loadFailed: string;
      loadedFile: (fileName: string) => string;
      loadedSource: (label: string) => string;
      newTab: string;
      openedPrint: string;
      emptyClipboard: string;
      pastePermission: string;
      pasted: string;
      readFileFailed: string;
      sharedMissing: string;
      switchedTo: (title: string) => string;
      urlRequired: string;
    };
```

```ts
    toolbar: {
      convertFile: string;
      convertUploadLabel: string;
      exportHtml: string;
      exportPdf: string;
      file: string;
      importAction: string;
      importOptions: string;
      label: string;
      modes: Record<"preview" | "split" | "editor", string>;
      more: string;
      open: string;
      openFolder: string;
      paste: string;
      saveToDisk: string;
      shareLink: string;
      sourceUrlLabel: string;
      uploadLabel: string;
      url: string;
    };
```

Add English values:

```ts
        convertedFile: (fileName) => `Converted ${fileName} to Markdown.`,
        convertingFile: (fileName) => `Converting ${fileName} to Markdown...`,
```

```ts
        convertFile: "Convert",
        convertUploadLabel: "Convert document to Markdown",
```

Add Chinese values:

```ts
        convertedFile: (fileName) => `已将 ${fileName} 转换为 Markdown。`,
        convertingFile: (fileName) => `正在将 ${fileName} 转换为 Markdown...`,
```

```ts
        convertFile: "转换",
        convertUploadLabel: "转换文档为 Markdown",
```

- [ ] **Step 4: Add toolbar conversion input and buttons**

Modify `components/workspace/workspace-toolbar.tsx`:

```ts
import { Clipboard, Columns2, Eye, FileUp, FolderOpen, Link, MoreHorizontal, Pencil, RefreshCw, Save, X } from "lucide-react";
import { convertedDocumentAccept } from "@/lib/workspace/convert-document";
```

Extend props:

```ts
  onConvertFile: (file: File) => void;
```

Add a ref:

```ts
  const convertFileInputRef = useRef<HTMLInputElement | null>(null);
```

Add an activation function:

```ts
  function activateConvertFile() {
    convertFileInputRef.current?.click();
  }
```

Add a compact menu entry after the regular file entry:

```tsx
              <button
                className="toolbar-menu-button"
                onClick={() => runAction(activateConvertFile)}
                role="menuitem"
                type="button"
              >
                {messages.convertFile}
              </button>
```

Add a desktop toolbar button after the regular file button:

```tsx
        <button
          className="toolbar-button"
          onClick={activateConvertFile}
          type="button"
        >
          <RefreshCw aria-hidden="true" size={16} strokeWidth={2} />
          <span>{messages.convertFile}</span>
        </button>
```

Add a hidden conversion input next to the existing Markdown file input:

```tsx
        <input
          aria-label={messages.convertUploadLabel}
          className="sr-only"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];

            if (file) {
              onConvertFile(file);
            }

            event.currentTarget.value = "";
          }}
          ref={convertFileInputRef}
          type="file"
          accept={convertedDocumentAccept}
        />
```

Add the same hidden conversion input in the `showImportActions === false` branch.

- [ ] **Step 5: Run the toolbar visibility test**

Run: `npm test -- tests/workspace/workspace-shell.test.tsx -t "document conversion entry"`

Expected: PASS after workspace wiring from Task 4. If TypeScript fails now because `WorkspaceToolbar` requires `onConvertFile`, continue to Task 4 before committing Task 3.

## Task 4: Workspace Conversion Flow

**Files:**
- Modify: `components/workspace/workspace-shell.tsx`
- Test: `tests/workspace/workspace-shell.test.tsx`

- [ ] **Step 1: Write failing workspace conversion tests**

Add this mock near the top of `tests/workspace/workspace-shell.test.tsx`:

```ts
import { convertDocumentToMarkdown } from "@/lib/workspace/convert-document";

vi.mock("@/lib/workspace/convert-document", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/workspace/convert-document")>();

  return {
    ...actual,
    convertDocumentToMarkdown: vi.fn()
  };
});

const mockedConvertDocumentToMarkdown = vi.mocked(convertDocumentToMarkdown);
```

Add cleanup in the existing `afterEach`:

```ts
    mockedConvertDocumentToMarkdown.mockReset();
```

Add these tests near the existing import tests:

```ts
  it("converts a supported document and opens the Markdown in a new workspace tab", async () => {
    const user = userEvent.setup();
    mockedConvertDocumentToMarkdown.mockResolvedValue({
      markdown: "# Converted Brief\n\nGenerated from DOCX.",
      label: "Converted document",
      sourceName: "brief.docx"
    });

    render(<WorkspaceShell markdown="# Existing draft" sourceInput="" />);

    await user.upload(
      screen.getByLabelText(/convert document to markdown/i),
      new File(["demo"], "brief.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      })
    );

    expect(mockedConvertDocumentToMarkdown).toHaveBeenCalledWith(expect.any(File));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /converted brief/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    expect(within(screen.getByTestId("preview-panel")).getByRole("heading", { name: "Converted Brief" })).toBeInTheDocument();
    expect(screen.getAllByText("converted:brief.docx").length).toBeGreaterThan(0);
    expect(screen.getByText("Converted brief.docx to Markdown.")).toBeInTheDocument();
  });

  it("persists converted document tabs in browser workspace storage", async () => {
    const user = userEvent.setup();
    mockedConvertDocumentToMarkdown.mockResolvedValue({
      markdown: "# Converted Persisted",
      label: "Converted document",
      sourceName: "persisted.pdf"
    });

    render(<WorkspaceShell markdown="" sourceInput="" />);

    await user.upload(
      screen.getByLabelText(/convert document to markdown/i),
      new File(["demo"], "persisted.pdf", { type: "application/pdf" })
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /converted persisted/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden"
    });
    document.dispatchEvent(new Event("visibilitychange"));

    const stored = JSON.parse(window.localStorage.getItem("markdownviewer.workspace.tabs.v1") ?? "{}");
    expect(stored.tabs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          markdown: "# Converted Persisted",
          sourceInput: "converted:persisted.pdf",
          sourceKind: "converted-file"
        })
      ])
    );
  });

  it("reports conversion errors without replacing the active Markdown document", async () => {
    const user = userEvent.setup();
    mockedConvertDocumentToMarkdown.mockRejectedValue(new Error("This file is too large to convert."));

    render(<WorkspaceShell markdown="# Existing draft" sourceInput="" />);

    await user.upload(
      screen.getByLabelText(/convert document to markdown/i),
      new File(["demo"], "huge.pdf", { type: "application/pdf" })
    );

    expect(await screen.findByText("This file is too large to convert.")).toBeInTheDocument();
    expect(within(screen.getByTestId("preview-panel")).getByRole("heading", { name: "Existing draft" })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run focused conversion tests to verify they fail**

Run: `npm test -- tests/workspace/workspace-shell.test.tsx -t "convert"`

Expected: FAIL because the workspace has no conversion handler yet.

- [ ] **Step 3: Implement workspace conversion wiring**

Modify `components/workspace/workspace-shell.tsx` imports:

```ts
import { convertDocumentToMarkdown } from "@/lib/workspace/convert-document";
```

Extend source kinds:

```ts
type WorkspaceSourceKind = "draft" | "file-import" | "remote-url" | "folder-file" | "converted-file";
```

Allow persisted converted tabs in `normalizeStoredWorkspaceTab`:

```ts
    record.sourceKind === "remote-url" ||
    record.sourceKind === "folder-file" ||
    record.sourceKind === "converted-file"
```

Add the helper after `openFileInNewTab`:

```ts
  async function openConvertedFileInNewTab(file: File) {
    setStatusMessage(messages.status.convertingFile(file.name));

    const result = await convertDocumentToMarkdown(file);
    const nextTab = createExplicitImportTab(result.markdown, `converted:${result.sourceName}`, {
      sourceKind: "converted-file"
    });

    activateWorkspaceTab(nextTab, "file", messages.status.convertedFile(result.sourceName));
  }
```

Add the handler near `handleFileImport`:

```ts
  async function handleConvertFile(file: File) {
    try {
      await openConvertedFileInNewTab(file);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : messages.status.loadFailed);
    }
  }
```

Wire the toolbar:

```tsx
          onConvertFile={handleConvertFile}
```

- [ ] **Step 4: Run focused workspace conversion tests**

Run: `npm test -- tests/workspace/workspace-shell.test.tsx -t "convert"`

Expected: PASS.

- [ ] **Step 5: Run import regression tests**

Run: `npm test -- tests/workspace/workspace-shell.test.tsx -t "loads a dropped file|opens markdown files passed|imports markdown from a url|persists open workspace tabs|restores persisted"`

Expected: PASS.

- [ ] **Step 6: Commit Tasks 3 and 4 together**

```bash
git add components/workspace/workspace-shell.tsx components/workspace/workspace-toolbar.tsx lib/i18n/messages.ts tests/workspace/workspace-shell.test.tsx
git commit -m "feat: open converted documents in workspace tabs"
```

## Task 5: Verification and Build

**Files:**
- Modify only if checks expose a real issue.

- [ ] **Step 1: Run focused conversion test group**

Run:

```bash
npm test -- tests/workspace/convert-document.test.ts tests/workspace/convert-route.test.ts tests/workspace/workspace-shell.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run full test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS. If build fails because MarkItDown is unavailable, fix the route so MarkItDown is only invoked at request time and the build does not require the CLI.

- [ ] **Step 4: Inspect git status**

Run: `git status --short`

Expected: only intentional files are modified, or clean after commits.

- [ ] **Step 5: Commit verification-only fixes if needed**

If Step 1-4 required code/test fixes, commit them:

```bash
git add app/api/convert/route.ts components/workspace/workspace-shell.tsx components/workspace/workspace-toolbar.tsx lib/i18n/messages.ts lib/server/markitdown-runner.ts lib/workspace/convert-document.ts tests/workspace/convert-document.test.ts tests/workspace/convert-route.test.ts tests/workspace/workspace-shell.test.tsx
git commit -m "fix: stabilize document conversion mvp"
```

If no fixes were needed, do not create an empty commit.

## Self-Review

- Spec coverage: local upload conversion, text-heavy PDF scope, no remote URL, no server persistence, automatic new tab, local tab persistence, conversion errors, tests, and build verification are covered.
- Placeholder scan: this plan contains no `TBD`, no incomplete tasks, and no unspecified test expectations.
- Type consistency: conversion helper returns `{ markdown, label, sourceName }`; API returns the same shape; workspace source kind is `converted-file`; source input is `converted:<filename>`.
