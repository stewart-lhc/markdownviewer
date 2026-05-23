# Syntax-Visible Rich Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the editor to a StackEdit-style markdown experience where `Rich` mode keeps syntax markers visible while styling the source for readability.

**Architecture:** `WorkspaceShell` keeps markdown as the single source of truth. `SourcePanel` will render one textarea in both modes, plus a mirrored highlight `<pre>` only in `Rich` mode. A small markdown highlighter maps source lines into styled spans without turning the editor into contenteditable HTML.

**Tech Stack:** Next.js, React 19, TypeScript, Vitest, Testing Library

---

### Task 1: Reframe The Regression Tests Around StackEdit Behavior

**Files:**
- Modify: `D:\GitHub\markdownviewer\tests\workspace\workspace-shell.test.tsx`
- Modify: `D:\GitHub\markdownviewer\tests\workspace\workspace-layout-styles.test.ts`

- [ ] **Step 1: Write the failing tests**

Change the rich-editor assertions so they require visible markdown syntax in `Rich` mode:

```tsx
it("shows a syntax-aware highlight layer in rich mode", () => {
  render(<WorkspaceShell markdown="# Title\n\n**Bold** text" sourceInput="" />);

  expect(screen.getByTestId("editor-highlight")).toBeInTheDocument();
  expect(screen.getByText("#", { selector: ".md-token--syntax" })).toBeInTheDocument();
  expect(screen.getAllByText("**", { selector: ".md-token--syntax" }).length).toBeGreaterThan(0);
});

it("keeps raw mode as a plain textarea without the highlight layer", async () => {
  const user = userEvent.setup();
  render(<WorkspaceShell markdown="# Title" sourceInput="" />);

  await user.click(screen.getByRole("button", { name: /raw/i }));

  expect(screen.getByLabelText(/markdown editor/i)).toBeInTheDocument();
  expect(screen.queryByTestId("editor-highlight")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/workspace/workspace-shell.test.tsx tests/workspace/workspace-layout-styles.test.ts`
Expected: FAIL because the current implementation still renders a contenteditable rich surface and the style test no longer matches StackEdit behavior.

- [ ] **Step 3: Commit**

```bash
git add tests/workspace/workspace-shell.test.tsx tests/workspace/workspace-layout-styles.test.ts
git commit -m "test: capture syntax-visible rich editor behavior"
```

### Task 2: Restore A Markdown Highlight Renderer

**Files:**
- Create: `D:\GitHub\markdownviewer\lib\workspace\editor-highlighting.tsx`
- Modify: `D:\GitHub\markdownviewer\tests\workspace\workspace-shell.test.tsx`

- [ ] **Step 1: Write the failing unit expectation through integration**

Add an assertion proving rich mode shows heading syntax and styled heading text together:

```tsx
const sourcePanel = screen.getByTestId("source-panel");
expect(within(sourcePanel).getByText("#", { selector: ".md-token--syntax" })).toBeInTheDocument();
expect(within(sourcePanel).getByText("Title", { selector: ".md-token--heading-text" })).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/workspace/workspace-shell.test.tsx`
Expected: FAIL because no syntax-highlight renderer exists in the current rich mode.

- [ ] **Step 3: Write minimal implementation**

Create a small renderer that tokenizes markdown line-by-line:

```tsx
export function renderHighlightedMarkdown(markdown: string) {
  return markdown.split("\n").map((line, index) => (
    <div className="md-line" key={`${index}-${line}`}>
      {renderLineTokens(line)}
    </div>
  ));
}
```

Support headings, emphasis markers, links, code spans, list markers, quotes, and rules with `md-token--*` classes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/workspace/workspace-shell.test.tsx`
Expected: PASS for the new syntax assertions.

- [ ] **Step 5: Commit**

```bash
git add lib/workspace/editor-highlighting.tsx tests/workspace/workspace-shell.test.tsx
git commit -m "feat: restore syntax-highlighted markdown renderer"
```

### Task 3: Replace The Pure Rich Surface With Overlay-Based Rich Mode

**Files:**
- Modify: `D:\GitHub\markdownviewer\components\workspace\source-panel.tsx`
- Delete: `D:\GitHub\markdownviewer\lib\workspace\rich-markdown.ts`
- Delete: `D:\GitHub\markdownviewer\tests\workspace\rich-markdown.test.ts`

- [ ] **Step 1: Write the failing regression check**

Require the editor DOM shape to use the highlight layer plus textarea:

```tsx
expect(screen.getByTestId("editor-highlight")).toBeInTheDocument();
expect(screen.getByLabelText(/markdown editor/i)).toBeInTheDocument();
expect(screen.queryByTestId("editor-rich-surface")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/workspace/workspace-shell.test.tsx`
Expected: FAIL because the current rich mode still mounts `editor-rich-surface`.

- [ ] **Step 3: Write minimal implementation**

Update `SourcePanel` so:

```tsx
<div className="workspace-editor-shell" data-editor-view={editorPresentationMode}>
  {editorPresentationMode === "rich" ? (
    <pre className="workspace-editor-highlight" data-testid="editor-highlight">
      {renderHighlightedMarkdown(markdown)}
    </pre>
  ) : null}
  <textarea ... value={markdown} />
</div>
```

Keep toolbar actions using `applyMarkdownAction` against the textarea selection in both modes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/workspace/workspace-shell.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/workspace/source-panel.tsx tests/workspace/workspace-shell.test.tsx
git rm lib/workspace/rich-markdown.ts tests/workspace/rich-markdown.test.ts
git commit -m "feat: switch rich mode back to syntax-visible markdown editing"
```

### Task 4: Fix The Overlay Styling So The Layers No Longer Fight Each Other

**Files:**
- Modify: `D:\GitHub\markdownviewer\app\globals.css`
- Modify: `D:\GitHub\markdownviewer\tests\workspace\workspace-layout-styles.test.ts`

- [ ] **Step 1: Write the failing style expectations**

Require:

```ts
expect(css).toContain(".workspace-editor-highlight {");
expect(css).toContain("pointer-events: none;");
expect(css).toContain(".workspace-editor-input {");
expect(css).toContain("color: transparent;");
expect(css).not.toContain(".workspace-rich-surface {");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/workspace/workspace-layout-styles.test.ts`
Expected: FAIL because the stylesheet still contains the contenteditable rich-surface rules.

- [ ] **Step 3: Write minimal implementation**

Restore the editor overlay CSS and remove the pure-rich rules:

```css
.workspace-editor-highlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.workspace-editor-input {
  position: relative;
  z-index: 1;
  color: transparent;
}
```

Ensure `Raw` mode sets the textarea text color back to visible source text.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/workspace/workspace-layout-styles.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tests/workspace/workspace-layout-styles.test.ts
git commit -m "fix: restore stackedit-style overlay editor styling"
```

### Task 5: Full Verification

**Files:**
- Modify: `D:\GitHub\markdownviewer\tests\workspace\workspace-shell.test.tsx`

- [ ] **Step 1: Run focused regression tests**

Run: `npx vitest run tests/workspace/workspace-shell.test.tsx tests/workspace/workspace-layout-styles.test.ts`
Expected: PASS

- [ ] **Step 2: Run the full suite**

Run: `npm test`
Expected: PASS with the full test suite green.

- [ ] **Step 3: Commit**

```bash
git add tests/workspace/workspace-shell.test.tsx
git commit -m "test: verify syntax-visible rich editor redesign"
```
