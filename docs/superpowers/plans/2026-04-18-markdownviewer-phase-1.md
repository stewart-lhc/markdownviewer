# Markdownviewer Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working version of `markdownviewer.run` with a landing page, a document workspace, a public share page, and a robust Markdown rendering pipeline.

**Architecture:** Use a Next.js App Router application with a content-first shell. Keep the first version mostly client-side so local file import, pasted Markdown, layout modes, and rendering states are easy to ship quickly, while leaving a clean route boundary for future server-backed sharing and export features.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, `react-markdown`, `remark-gfm`, `remark-math`, `remark-breaks`, `rehype-slug`, `rehype-autolink-headings`, `rehype-katex`, `rehype-highlight`, `mermaid`, `vitest`, `@testing-library/react`

---

### Task 1: App Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.js`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`
- Create: `public/.gitkeep`
- Test: `tests/smoke/app-shell.test.tsx`

- [ ] **Step 1: Write the failing app shell smoke test**
- [ ] **Step 2: Run the test and confirm the empty repository fails**
- [ ] **Step 3: Scaffold the Next.js app with Tailwind and a root layout**
- [ ] **Step 4: Re-run the smoke test and confirm it passes**

### Task 2: Landing Page

**Files:**
- Modify: `app/page.tsx`
- Create: `components/landing/hero.tsx`
- Create: `components/landing/feature-grid.tsx`
- Create: `components/landing/live-sample.tsx`
- Create: `components/landing/source-strip.tsx`
- Test: `tests/landing/homepage.test.tsx`

- [ ] **Step 1: Write failing tests for hero actions and core landing copy**
- [ ] **Step 2: Run the landing test to confirm failure**
- [ ] **Step 3: Implement the editorial landing page with direct entry actions**
- [ ] **Step 4: Re-run the landing test and confirm it passes**

### Task 3: Workspace Route And State

**Files:**
- Create: `app/workspace/page.tsx`
- Create: `components/workspace/workspace-shell.tsx`
- Create: `components/workspace/workspace-toolbar.tsx`
- Create: `components/workspace/source-panel.tsx`
- Create: `components/workspace/outline-panel.tsx`
- Create: `lib/workspace/default-document.ts`
- Create: `lib/workspace/source-parser.ts`
- Test: `tests/workspace/source-parser.test.ts`
- Test: `tests/workspace/workspace-page.test.tsx`

- [ ] **Step 1: Write failing parser tests for pasted text and supported URL types**
- [ ] **Step 2: Run parser tests and confirm failure**
- [ ] **Step 3: Implement parser utilities and the base workspace shell**
- [ ] **Step 4: Write and run a failing UI test for the workspace route**
- [ ] **Step 5: Implement the toolbar, import panel, and layout modes**
- [ ] **Step 6: Re-run workspace tests and confirm they pass**

### Task 4: Markdown Rendering Pipeline

**Files:**
- Create: `components/markdown/markdown-renderer.tsx`
- Create: `components/markdown/code-block.tsx`
- Create: `components/markdown/mermaid-block.tsx`
- Create: `components/markdown/math-styles.tsx`
- Create: `lib/markdown/extract-headings.ts`
- Test: `tests/markdown/markdown-renderer.test.tsx`
- Test: `tests/markdown/extract-headings.test.ts`

- [ ] **Step 1: Write failing rendering tests for GFM, code blocks, math, and Mermaid fallback**
- [ ] **Step 2: Run the renderer tests and confirm failure**
- [ ] **Step 3: Implement the renderer pipeline and custom content blocks**
- [ ] **Step 4: Re-run renderer tests and confirm they pass**

### Task 5: Shared Reader Route

**Files:**
- Create: `app/share/[id]/page.tsx`
- Create: `lib/share/mock-share-store.ts`
- Test: `tests/share/share-page.test.tsx`

- [ ] **Step 1: Write a failing test for rendering a shared document**
- [ ] **Step 2: Run the share test and confirm failure**
- [ ] **Step 3: Implement a mock share route with seeded sample content**
- [ ] **Step 4: Re-run the share test and confirm it passes**

### Task 6: Verification

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: Run the full unit test suite**
- [ ] **Step 2: Run the production build**
- [ ] **Step 3: Record any gaps that still block real share/export/deploy work**
