# Conservative Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce landing-page JavaScript and streamline workspace hot paths while preserving all Markdownviewer UI and behavior.

**Architecture:** Keep full Markdown rendering in `components/markdown/*` for workspace/share routes, but replace the homepage hero sample with static markup plus a tiny copy button so the landing route no longer pulls the renderer bundle. In workspace, keep the existing state model and UI, but reduce duplicate title extraction and storage writes on the input path.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest/jsdom, Turbopack production build, local browser visual verification.

---

## File Structure

- Modify: `components/landing/live-sample.tsx`
  - Responsibility: render the homepage preview card without importing the full Markdown renderer.
- Create: `components/landing/live-sample-copy-button.tsx`
  - Responsibility: preserve the visible code-copy affordance in the static landing sample with minimal client JavaScript.
- Modify: `tests/landing/homepage.test.tsx`
  - Responsibility: assert the landing sample still renders the same Markdown-like content and compact Markdown body class.
- Create: `tests/landing/live-sample-bundle.test.ts`
  - Responsibility: guard against reintroducing `MarkdownRenderer` or `starterDocument` into the landing sample.
- Modify: `components/workspace/workspace-shell.tsx`
  - Responsibility: reduce duplicate active-tab heading/title extraction and avoid unchanged `localStorage` writes.
- Create: `tests/workspace/workspace-performance-guards.test.ts`
  - Responsibility: lock the workspace performance invariants with source-level guard tests, matching the repo's existing CSS source tests style.

## Scope Check

The approved spec covers one subsystem family: conservative performance optimization for the existing app. It does not need decomposition into separate specs because each task produces independently testable software and stays inside landing bundle loading, workspace hot paths, and verification.

### Task 1: Landing Bundle Guard Tests

**Files:**
- Modify: `tests/landing/homepage.test.tsx`
- Create: `tests/landing/live-sample-bundle.test.ts`

- [ ] **Step 1: Write the failing homepage assertions**

Update the first test in `tests/landing/homepage.test.tsx` so the final assertion block reads:

```tsx
    const preview = container.querySelector(".hero-preview .markdown-body--compact");

    expect(preview).toBeInTheDocument();
    expect(within(preview as HTMLElement).getByRole("heading", { level: 1, name: /markdown feature atlas/i })).toBeInTheDocument();
    expect(container.querySelector(".hero-preview .code-frame")).toBeInTheDocument();
    expect(container.querySelector(".hero-preview .mermaid-compact")).toBeInTheDocument();
```

Also update the import at the top of the same file:

```tsx
import { render, screen, within } from "@testing-library/react";
```

- [ ] **Step 2: Add the source-level bundle guard**

Create `tests/landing/live-sample-bundle.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("D:/GitHub/markdownviewer/components/landing/live-sample.tsx", "utf8");

describe("landing live sample bundle guard", () => {
  it("does not import the full Markdown renderer into the homepage sample", () => {
    expect(source).not.toMatch(/MarkdownRenderer/);
    expect(source).not.toMatch(/starterDocument/);
    expect(source).toContain("markdown-body markdown-body--compact");
  });
});
```

- [ ] **Step 3: Run tests and verify failure**

Run:

```powershell
npm test -- tests/landing/homepage.test.tsx tests/landing/live-sample-bundle.test.ts
```

Expected: `tests/landing/live-sample-bundle.test.ts` fails because `components/landing/live-sample.tsx` still imports `MarkdownRenderer` and `starterDocument`.

- [ ] **Step 4: Commit the failing tests**

Run:

```powershell
git add tests/landing/homepage.test.tsx tests/landing/live-sample-bundle.test.ts
git commit -m "test: guard landing sample bundle"
```

Expected: commit succeeds and only those two test files are included.

### Task 2: Static Landing Sample Implementation

**Files:**
- Modify: `components/landing/live-sample.tsx`
- Create: `components/landing/live-sample-copy-button.tsx`
- Test: `tests/landing/homepage.test.tsx`
- Test: `tests/landing/live-sample-bundle.test.ts`

- [ ] **Step 1: Add the tiny copy button client component**

Create `components/landing/live-sample-copy-button.tsx`:

```tsx
"use client";

import { useState } from "react";

type LiveSampleCopyButtonProps = {
  code: string;
  language: string;
};

export function LiveSampleCopyButton({ code, language }: LiveSampleCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      aria-label={`Copy ${language} code`}
      className="code-copy"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
```

- [ ] **Step 2: Replace the live sample with static compact markup**

Replace `components/landing/live-sample.tsx` with:

```tsx
import { LiveSampleCopyButton } from "@/components/landing/live-sample-copy-button";

type LiveSampleProps = {
  ribbon: string;
};

const sampleCode = `type WorkspaceMode = "preview" | "split" | "editor";

export function greet(name: string) {
  return \`Hello, ${"${name}"}\`;
}`;

export function LiveSample({ ribbon }: LiveSampleProps) {
  return (
    <div className="hero-preview">
      <div className="preview-window">
        <div className="preview-window-scroll">
          <span className="preview-ribbon">{ribbon}</span>
          <article className="markdown-body markdown-body--compact">
            <h1>Markdown Feature Atlas</h1>
            <p>
              This starter file is a broad reference for the markdown and preview features built into markdownviewer.
            </p>
            <h2>Quick scan</h2>
            <ul>
              <li>
                <strong>Bold</strong>, <em>italic</em>, <strong><em>bold italic</em></strong>, <del>strikethrough</del>,
                and <code>inline code</code>
              </li>
              <li>
                <a href="#tables-and-data">Internal jump</a> and{" "}
                <a href="https://commonmark.org">external link</a>
              </li>
              <li>Automatic URL preview: https://github.com</li>
              <li>Footnote reference<sup>1</sup></li>
            </ul>
            <blockquote>
              <p>Markdown works best when the source stays readable first.</p>
              <p>It should still feel good after rendering.</p>
            </blockquote>
            <hr />
            <h2>Tables and data</h2>
            <table>
              <thead>
                <tr>
                  <th>Syntax</th>
                  <th>Example</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Inline math</td>
                  <td>
                    <code>$E = mc^2$</code>
                  </td>
                  <td>Ready</td>
                </tr>
                <tr>
                  <td>GitHub tables</td>
                  <td>
                    <code>| cell |</code>
                  </td>
                  <td>Ready</td>
                </tr>
                <tr>
                  <td>Mermaid</td>
                  <td>
                    <code>```mermaid```</code>
                  </td>
                  <td>Ready</td>
                </tr>
              </tbody>
            </table>
            <h2>Code blocks</h2>
            <div className="code-frame">
              <div className="code-toolbar">
                <span>ts</span>
                <LiveSampleCopyButton code={sampleCode} language="ts" />
              </div>
              <pre>
                <code className="language-ts">{sampleCode}</code>
              </pre>
            </div>
            <h2>Mermaid diagrams</h2>
            <div aria-label="Diagram flow" className="mermaid-compact">
              <div className="mermaid-compact-label">Diagram flow</div>
              <div className="mermaid-compact-steps">
                <div className="mermaid-compact-step">
                  <span>Paste Markdown</span>
                  <span aria-hidden="true" className="mermaid-compact-arrow">
                    {"->"}
                  </span>
                </div>
                <div className="mermaid-compact-step">
                  <span>Preview</span>
                  <span aria-hidden="true" className="mermaid-compact-arrow">
                    {"->"}
                  </span>
                </div>
                <div className="mermaid-compact-step">
                  <span>Share</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run the landing tests**

Run:

```powershell
npm test -- tests/landing/homepage.test.tsx tests/landing/live-sample-bundle.test.ts tests/landing/hero-layout-styles.test.ts
```

Expected: all listed tests pass.

- [ ] **Step 4: Commit the landing implementation**

Run:

```powershell
git add components/landing/live-sample.tsx components/landing/live-sample-copy-button.tsx tests/landing/homepage.test.tsx tests/landing/live-sample-bundle.test.ts
git commit -m "perf: keep landing sample off markdown renderer"
```

Expected: commit succeeds and does not include unrelated workspace UI/layout files.

### Task 3: Workspace Hot Path Guards

**Files:**
- Create: `tests/workspace/workspace-performance-guards.test.ts`

- [ ] **Step 1: Add source-level workspace performance guard tests**

Create `tests/workspace/workspace-performance-guards.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```powershell
npm test -- tests/workspace/workspace-performance-guards.test.ts
```

Expected: the second and third tests fail because `workspace-shell.tsx` still computes active tab titles through `getWorkspaceTabTitle` inside `tabItems` and has no unchanged-write guards.

- [ ] **Step 3: Commit the failing guard tests**

Run:

```powershell
git add tests/workspace/workspace-performance-guards.test.ts
git commit -m "test: guard workspace performance hot paths"
```

Expected: commit succeeds with only the new guard test.

### Task 4: Workspace Hot Path Implementation

**Files:**
- Modify: `components/workspace/workspace-shell.tsx`
- Test: `tests/workspace/workspace-performance-guards.test.ts`
- Test: `tests/workspace/workspace-shell.test.tsx`
- Test: `tests/workspace/workspace-page.test.tsx`

- [ ] **Step 1: Add unchanged-write refs near existing workspace refs**

In `components/workspace/workspace-shell.tsx`, after:

```tsx
  const pendingFolderHashRef = useRef<string | undefined>(undefined);
```

add:

```tsx
  const lastStoredTabsJsonRef = useRef<string | null>(null);
  const lastStoredDraftRef = useRef<string | null>(null);
```

- [ ] **Step 2: Add local persistence helpers inside `WorkspaceShell` before the first `useEffect`**

Add this block after `isCompactViewport()`:

```tsx
  function persistStoredWorkspaceTabs(nextTabs: WorkspaceTab[], nextActiveTabId: string) {
    const normalizedTabs = nextTabs.slice(0, maxStoredWorkspaceTabs);
    const normalizedActiveTabId = normalizedTabs.some((tab) => tab.id === nextActiveTabId)
      ? nextActiveTabId
      : normalizedTabs[0]?.id;

    if (!normalizedActiveTabId) {
      return;
    }

    const nextJson = JSON.stringify({
      version: workspaceTabsStorageVersion,
      activeTabId: normalizedActiveTabId,
      tabs: normalizedTabs
    });

    if (lastStoredTabsJsonRef.current === nextJson) {
      return;
    }

    window.localStorage.setItem(workspaceTabsStorageKey, nextJson);
    lastStoredTabsJsonRef.current = nextJson;
  }

  function persistWorkspaceDraft(nextMarkdown: string) {
    if (lastStoredDraftRef.current === nextMarkdown) {
      return;
    }

    window.localStorage.setItem(workspaceDraftStorageKey, nextMarkdown);
    lastStoredDraftRef.current = nextMarkdown;
  }
```

- [ ] **Step 3: Replace tab and draft writes with guarded helpers**

In the `tabsStorageReady` effect, replace:

```tsx
      writeStoredWorkspaceTabs(
        getActiveWorkspaceTabsSnapshot(tabs, activeTabId, currentMarkdown, currentSource),
        activeTabId
      );
```

with:

```tsx
      persistStoredWorkspaceTabs(
        getActiveWorkspaceTabsSnapshot(tabs, activeTabId, currentMarkdown, currentSource),
        activeTabId
      );
```

In the `pagehide` effect, replace:

```tsx
      window.localStorage.setItem(workspaceDraftStorageKey, latestMarkdownRef.current);
      writeStoredWorkspaceTabs(
```

with:

```tsx
      persistWorkspaceDraft(latestMarkdownRef.current);
      persistStoredWorkspaceTabs(
```

In the draft save effect, replace:

```tsx
      window.localStorage.setItem(workspaceDraftStorageKey, currentMarkdown);
```

with:

```tsx
      persistWorkspaceDraft(currentMarkdown);
```

- [ ] **Step 4: Avoid active tab title extraction from immediate markdown**

Replace the `tabItems` memo body:

```tsx
      tabs.map((tab) => ({
        ...tab,
        sourceLabel: getWorkspaceTabSourceLabel(tab, messages),
        title: getWorkspaceTabTitle(tab, messages)
      })),
    [messages, tabs]
```

with:

```tsx
      tabs.map((tab) => ({
        ...tab,
        sourceLabel: getWorkspaceTabSourceLabel(tab, messages),
        title: tab.id === activeTabId ? documentTitle : getWorkspaceTabTitle(tab, messages)
      })),
    [activeTabId, documentTitle, messages, tabs]
```

- [ ] **Step 5: Run the workspace performance guard**

Run:

```powershell
npm test -- tests/workspace/workspace-performance-guards.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Run focused workspace behavior tests**

Run:

```powershell
npm test -- tests/workspace/workspace-page.test.tsx tests/workspace/workspace-shell.test.tsx tests/workspace/workspace-layout-styles.test.ts
```

Expected: all tests pass. If a timing-sensitive workspace test times out, rerun that single test file once before treating it as a product regression.

- [ ] **Step 7: Commit the workspace implementation**

Run:

```powershell
git add components/workspace/workspace-shell.tsx tests/workspace/workspace-performance-guards.test.ts
git commit -m "perf: reduce workspace hot path work"
```

Expected: commit succeeds and preserves unrelated existing UI/layout changes unless they are already part of `components/workspace/workspace-shell.tsx`. Review `git diff --cached` before committing because this file is already dirty.

### Task 5: Build, Bundle, And Visual Verification

**Files:**
- No planned source edits.
- Verify: `.next/server/app/page_client-reference-manifest.js`
- Verify: local browser routes `/`, `/zh-CN`, `/workspace`, `/zh-CN/workspace`

- [ ] **Step 1: Run the broad focused test suite**

Run:

```powershell
npm test -- tests/landing/homepage.test.tsx tests/landing/live-sample-bundle.test.ts tests/landing/hero-layout-styles.test.ts tests/markdown/markdown-renderer.test.tsx tests/markdown/mermaid-styles.test.ts tests/markdown/extract-headings.test.ts tests/workspace/workspace-performance-guards.test.ts tests/workspace/workspace-page.test.tsx tests/workspace/workspace-shell.test.tsx tests/workspace/workspace-layout-styles.test.ts
```

Expected: all listed tests pass.

- [ ] **Step 2: Run the production build**

Run:

```powershell
$env:NEXT_TELEMETRY_DISABLED='1'; npm run build
```

Expected: `next build` completes successfully.

- [ ] **Step 3: Verify the landing client manifest excludes the Markdown renderer**

Run:

```powershell
$manifest = Get-Content -LiteralPath .next\server\app\page_client-reference-manifest.js -Raw
if ($manifest -match 'components/markdown/markdown-renderer') { throw 'Homepage still references MarkdownRenderer' }
if ($manifest -match 'components/landing/live-sample-copy-button') { 'Landing only keeps the tiny copy button client component.' }
```

Expected: no exception is thrown, and the message about the tiny copy button is printed.

- [ ] **Step 4: Inspect largest generated chunks**

Run:

```powershell
Get-ChildItem -Recurse -File .next\static\chunks |
  Sort-Object Length -Descending |
  Select-Object -First 12 FullName,Length
```

Expected: large Markdown/Mermaid chunks may still exist for workspace/share, but homepage manifest no longer references the Markdown renderer chunk.

- [ ] **Step 5: Start a local server for visual checks**

Run:

```powershell
$env:NEXT_TELEMETRY_DISABLED='1'; npm run dev
```

Expected: local Next.js server starts. If port `3000` is occupied, use the URL printed by Next.js.

- [ ] **Step 6: Verify critical routes in the browser**

Open:

```text
http://localhost:3000/
http://localhost:3000/zh-CN
http://localhost:3000/workspace
http://localhost:3000/zh-CN/workspace
```

Expected:

- Landing hero sample keeps the same preview card, ribbon, compact Markdown typography, code frame, and compact Mermaid block look.
- Workspace keeps header, tabs rail, preview controls, editor/split/preview modes, folder rail, and current UI changes intact.
- No visible layout drift on desktop or mobile-width checks.

- [ ] **Step 7: Commit verification-only test adjustments if needed**

If Task 5 required no source edits, do not create a commit. If a test-only adjustment was needed, run:

```powershell
git add tests/landing tests/workspace
git commit -m "test: stabilize performance verification"
```

Expected: commit only includes the necessary test adjustment.

### Task 6: Final Repository Review

**Files:**
- Review all changed files from Tasks 1-5.

- [ ] **Step 1: Check worktree status**

Run:

```powershell
git status --short --branch
```

Expected: only intentional performance changes plus pre-existing unrelated dirty files remain. Do not stage `.codex-remote-attachments/`.

- [ ] **Step 2: Inspect final diff**

Run:

```powershell
git diff --stat
git diff -- components/landing/live-sample.tsx components/landing/live-sample-copy-button.tsx components/workspace/workspace-shell.tsx tests/landing/homepage.test.tsx tests/landing/live-sample-bundle.test.ts tests/workspace/workspace-performance-guards.test.ts
```

Expected: diff matches the approved performance scope and does not contain visual redesign or feature removal.

- [ ] **Step 3: Check whitespace**

Run:

```powershell
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 4: Prepare final report**

Include:

- Files changed.
- Test commands and outcomes.
- Build outcome.
- Manifest check outcome.
- Browser visual check outcome.
- Note that current unrelated dirty UI/layout files were preserved.
