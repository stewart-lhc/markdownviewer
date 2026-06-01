# GSC Long-Tail SEO Design

Date: 2026-06-01

## Diagnosis

The GSC issue is understood correctly: `markdownviewer.run` is crawlable, has an indexable homepage, sitemap, metadata, JSON-LD, and no obvious Googlebot block. The weak point is not a fatal technical SEO bug. The site has too few indexable entry points for competitive queries such as `markdown viewer`, so Search Console may show little or no query data until Google discovers, indexes, and tests more specific pages.

## Goal

Create a small, high-quality pool of indexable long-tail pages that match existing keyword strategy and point users toward the live workspace. The goal is faster first impressions and query discovery in Google Search Console, especially for README, GitHub Flavored Markdown, Mermaid, math, AI output, and file-viewer intents.

## Approach

Use static, hand-written pages rather than a broad programmatic SEO generator. Each page gets a unique canonical URL, title, meta description, H1, focused copy, workflow steps, FAQ content, and links back to `/workspace`. The homepage links to the new pages so crawlers can discover them without relying only on the sitemap.

Rejected alternatives:

- Only resubmit sitemap and wait: useful but too passive because the site has only a few URLs.
- Generate dozens of keyword pages: faster surface area, but higher thin-content and maintenance risk.
- Rewrite homepage copy: helpful later, but it does not solve the small indexed-page pool.

## Pages

Create these English static pages:

- `/use-cases/readme-viewer`
- `/features/github-flavored-markdown-viewer`
- `/features/mermaid-markdown-viewer`
- `/features/markdown-math-preview`
- `/use-cases/ai-markdown-viewer`
- `/use-cases/markdown-file-viewer-online`

Chinese versions are out of scope for this first pass because the immediate GSC issue is first-query discovery for English long-tail searches.

## Architecture

- `lib/seo/landing-pages.ts` owns the structured page data and path list.
- `components/seo/seo-landing-page.tsx` renders one consistent, crawlable landing page from that data.
- Each route file imports the shared renderer with a fixed slug, avoiding a broad dynamic catch-all route.
- `app/sitemap.ts` includes the new URLs.
- `components/landing/home-page-content.tsx` links to the new pages from the homepage.
- `public/llms.txt` lists the new pages for AI/search assistants.

## Data Flow

Route file -> SEO landing data lookup -> shared page renderer -> workspace CTA.

Sitemap uses the same `seoLandingPages` array, so URL additions do not drift from rendered pages.

## Testing

Add focused tests that verify:

- The SEO page data has unique slugs and paths.
- Every SEO page has title, description, FAQ, and workspace CTA data.
- The sitemap includes every SEO landing page.
- The homepage exposes internal links to the new long-tail pages.

Run the targeted SEO/landing tests, then the full test suite if dependency setup succeeds in the isolated worktree.

## Scope Boundaries

This pass does not automate GSC submission, create backlinks, change Cloudflare crawler settings, or ship a large blog system. Those are follow-up distribution tasks after the site has a broader crawlable page pool.
