# GSC Long-Tail SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add focused long-tail SEO landing pages so Google has more crawlable query-specific entry points for markdownviewer.run.

**Architecture:** Store page content in one typed data file, render each page through one reusable component, and expose each page through an explicit static route. Reuse the same page list for sitemap and homepage internal links to avoid URL drift.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library.

---

### Task 1: SEO Page Data

**Files:**
- Create: `lib/seo/landing-pages.ts`
- Test: `tests/seo/seo-landing-pages.test.ts`

- [ ] **Step 1: Write data integrity tests**

Create `tests/seo/seo-landing-pages.test.ts` with assertions that `seoLandingPages` contains six unique paths, every page has title/description/H1/FAQ/workflow content, and every path starts with `/use-cases/` or `/features/`.

- [ ] **Step 2: Add typed page data**

Create `lib/seo/landing-pages.ts` with a `SeoLandingPage` type, a `seoLandingPages` array for the six approved pages, and helpers `getSeoLandingPage(slug)` and `seoLandingPageSlugs`.

- [ ] **Step 3: Run test**

Run: `npm test -- tests/seo/seo-landing-pages.test.ts`

Expected: PASS.

### Task 2: Shared Renderer and Routes

**Files:**
- Create: `components/seo/seo-landing-page.tsx`
- Create: six `app/**/page.tsx` route files
- Test: `tests/seo/seo-landing-routes.test.tsx`

- [ ] **Step 1: Write route render tests**

Create `tests/seo/seo-landing-routes.test.tsx` and render at least the README and Mermaid pages. Verify each page has a focused H1, a workspace CTA link, FAQ content, and no duplicate H1.

- [ ] **Step 2: Implement the shared renderer**

Create `SeoLandingPageContent` and `buildSeoLandingMetadata` in `components/seo/seo-landing-page.tsx`. Render the landing topbar, page H1, intro, key workflow cards, FAQ, related page links, and workspace CTA.

- [ ] **Step 3: Add explicit static routes**

Add page files for:

- `app/use-cases/readme-viewer/page.tsx`
- `app/features/github-flavored-markdown-viewer/page.tsx`
- `app/features/mermaid-markdown-viewer/page.tsx`
- `app/features/markdown-math-preview/page.tsx`
- `app/use-cases/ai-markdown-viewer/page.tsx`
- `app/use-cases/markdown-file-viewer-online/page.tsx`

Each file exports metadata with `buildSeoLandingMetadata("<slug>")` and renders `SeoLandingPageContent`.

- [ ] **Step 4: Run route tests**

Run: `npm test -- tests/seo/seo-landing-routes.test.tsx`

Expected: PASS.

### Task 3: Discovery Surfaces

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `components/landing/home-page-content.tsx`
- Modify: `public/llms.txt`
- Test: `tests/seo/seo-discovery.test.tsx`

- [ ] **Step 1: Write discovery tests**

Create `tests/seo/seo-discovery.test.tsx`. Verify sitemap includes every `seoLandingPages` URL and homepage renders links to all long-tail pages.

- [ ] **Step 2: Update sitemap**

Import `seoLandingPages` into `app/sitemap.ts` and append each page with `lastModified`, `changeFrequency: "monthly"`, and `priority: 0.75`.

- [ ] **Step 3: Add homepage internal links**

Import `seoLandingPages` in `components/landing/home-page-content.tsx` and add a compact section that links to each page using its label and summary.

- [ ] **Step 4: Update llms.txt**

Add a `Long-tail SEO pages` table to `public/llms.txt` with the six new paths and descriptions.

- [ ] **Step 5: Run discovery tests**

Run: `npm test -- tests/seo/seo-discovery.test.tsx`

Expected: PASS.

### Task 4: Final Verification

**Files:**
- All changed files

- [ ] **Step 1: Run targeted tests**

Run: `npm test -- tests/seo/seo-landing-pages.test.ts tests/seo/seo-landing-routes.test.tsx tests/seo/seo-discovery.test.tsx tests/landing/homepage.test.tsx`

Expected: PASS.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS and generated routes include the six new pages.

- [ ] **Step 3: Inspect git diff**

Run: `git diff --stat` and `git diff --check`.

Expected: Only planned SEO files changed, and `git diff --check` has no whitespace errors.
