# Changelog

All notable changes to this project are documented in this file.

## 26.630 - 2026-06-30

### Fixed

- Prevented translation and writing-assistant browser extensions from crashing the workspace or share readers when they rewrite React-managed Markdown DOM during file opening, tab changes, or reader updates.
- Marked the Markdown preview and editor surfaces as non-translatable so browser extensions are less likely to mutate the active document tree.

## 26.620 - 2026-06-20

### Added

- Added platform-aware keyboard shortcuts across the workspace, editor toolbar, preview reader, and share reader.
- Added a dedicated keyboard shortcuts popup that lists workspace, view, reading, editor, and context shortcuts with Mac and Windows columns.
- Added shortcut hints to toolbar buttons, reader controls, share actions, typography controls, tabs, dialogs, and overlay close affordances.

### Changed

- Changed shortcut labels to resolve safely after client mount so Mac users see Command-style hints without hydration mismatches.
- Changed share-reader shortcuts to use modified key combinations instead of global single-letter actions.

### Fixed

- Fixed shortcut-triggered HTML export from editor-only mode so the workspace mounts the preview before exporting instead of downloading empty HTML.

## 26.619 - 2026-06-19

### Changed

- Reworked workspace preview controls into the same icon-first control language on desktop and mobile, including the theme, typography, margin, and share actions.
- Changed editor and split mode transitions to default back to rich editing so formatting tools open on the styled editing surface.
- Tightened the mobile preview bottom control bar so its buttons fill the available width, the bar is shorter, and the former dark top edge is removed.
- Simplified immersive reading chrome by keeping only the centered close action in the top overlay and restoring the contents trigger to its original right-side floating position.
- Kept immersive reading at the normal preview width and line-height instead of narrowing the document while reading.

### Fixed

- Fixed left-sidebar resizing so pointer-down no longer jumps the separator, and dragging past the minimum width collapses the whole sidebar.
- Fixed mobile tab and contents overlays so tapping outside the active panel closes it predictably.
- Fixed Mermaid preview rendering so diagrams settle instead of staying in a rendering state or flashing while the reader scrolls.
- Fixed wide mobile tables by preserving horizontal scrolling instead of forcing too many columns into the viewport.
- Fixed the desktop preview share button and header controls so text labels no longer reappear beside the icons.

## 26.617 - 2026-06-17

### Added

- Added share-page workspace actions for opening a shared document, editing a local copy, and using a share as a template.
- Added local Recent/Continue panels on the homepage and workspace, backed by browser local storage.
- Added recent activity records for created shares, share copies/templates, and converted documents.
- Added share reader CTA tracking, workspace share-source tracking, and `share_created` events.
- Added a public-site color mode switcher with System, Light, and Dark controls in the landing navigation.
- Added real product screenshots for the homepage feature cards under `public/feature-screenshots/`.
- Added feature screenshot asset coverage for the corrected production WebP files.
- Added mobile breadcrumbs behavior coverage and CSS guards for the compact navigation layout.
- Added a book-style immersive reading overlay from workspace preview and share reader surfaces.

### Changed

- Expanded the homepage live preview sample height on tablet and mobile so it stays useful instead of collapsing into a short strip.
- Collapsed the mobile landing top-bar secondary actions into a breadcrumbs menu.
- Kept `Workspace` directly to the left of the mobile breadcrumbs trigger as the only standalone mobile top-bar action.
- Rebuilt the mobile breadcrumbs panel as an opaque, full-width menu with equal-width controls.
- Reordered mobile breadcrumbs menu links to `Pricing`, `Updates`, and `GitHub`, with visible GitHub text.
- Placed the language switcher and System/Light/Dark theme controls on one equal-width settings row.
- Updated README, the repository changelog, and the live changelog data as a single date-based update.

### Fixed

- Fixed the public-site dark mode palette so dark mode remains dark without the washed-gray low-contrast appearance.
- Replaced decorative/fake feature-card imagery with screenshots captured from the real homepage, workspace, share reader, install prompt, editor, and rendered Markdown surfaces.
- Rebuilt the `PWA file opening` feature screenshot from a production workspace capture without the Next.js development issue badge.
- Rebuilt the `Stored sharing and export` feature screenshot from a production share-reader capture without the Next.js development issue badge.

## 26.612 - 2026-06-12

### Added

- Added automatic light/dark site theming from the user's system color-scheme preference.
- Added separate workspace template memory for the user's most recent light template and most recent dark template.

### Changed

- Changed workspace startup to pick the saved light or dark template that matches the current system color scheme, while preserving the legacy template storage keys for compatibility.

## 26.611 - 2026-06-11

### Added

- Added a `/pricing` early-access waitlist page for Share Pro and Converter API interest without putting the free workspace behind a paywall.
- Added waitlist email validation, Resend confirmation email delivery, and confirmation-link handling before marking an address as verified.
- Added Neon/Postgres waitlist storage through `DATABASE_URL` or `POSTGRES_URL`, with Cloudflare D1 and local JSONL storage retained as fallbacks.

### Changed

- Updated Share Pro intent links from the share workflow to route into the waitlist page instead of sending users directly to the workspace.
- Updated waitlist API responses so failed confirmation email delivery returns an error instead of a false success state.
- Updated duplicate waitlist submissions so already verified emails stay verified and do not receive another confirmation email.

## 26.610 - 2026-06-10

### Added

- Added per-tab preview scroll restoration so each workspace tab reopens at the last reading position.
- Added a resizable workspace tab sidebar, matching the editor/preview split resize behavior.
- Added a direct Blank option to the new-tab dialog.
- Added preview line-height controls with L- and L+ buttons, persisted with the existing reader typography settings.

### Changed

- Changed new tabs to open at the top of the document instead of inheriting the previous tab's scroll position.
- Rebuilt the new-tab dialog around four equal vertical actions: Paste, Blank, File, and Folder.
- Replaced the editor toolbar's small text glyphs with consistent SVG icons, including a proper strikethrough icon.
- Updated workspace status messages so idle notifications disappear automatically after three seconds while loading statuses remain visible.
- Updated the floating contents panel scrollbar to follow dark workspace theme scrollbar colors.

## 26.609 - 2026-06-09

### Changed

- Updated the mobile workspace reader so the top bar automatically hides while scrolling down and returns when scrolling up.
- Changed the mobile preview bottom bar to stay hidden by default, with a floating bottom-right control that opens the reader controls only when needed.
- Added a mobile PWA install prompt that uses the native install flow when available and falls back to iOS/browser add-to-home-screen guidance.
- Improved the mobile PWA install prompt colors so its action buttons and text remain readable in dark workspace themes.
- Added focused workspace tests and layout guards for mobile header auto-hide behavior and the collapsible preview bottom bar.

## 26.604 - 2026-06-04

### Added

- Added server-stored share links through `/api/share`, with Vercel Blob support in production and a local file-store fallback for development.
- Added canonical `/share/{id}` pages for saved Markdown shares so shared documents have independent URLs instead of oversized client-only payloads.
- Added the full workspace preview reader controls to shared pages, including contents, typography, theme, font size, preview margin, and open-in-workspace behavior.

### Changed

- Changed sharing from compressed URL-state links to stored share records, improving link size, reliability, and public page crawlability.
- Kept legacy `md-...` share URLs readable while making new share links use the formal stored-share flow.
- Restored the top-left Markdownviewer logo on share pages.
- Fixed preview margin decrease/increase controls so M- and M+ update the actual reader margin instead of leaving the share page unchanged.
- Updated homepage, README, and product update copy for the production sharing workflow.

## 26.603 - 2026-06-03

### Added

- Added document-to-Markdown conversion for DOCX, PPTX, XLSX, XLS, CSV, HTML, JSON, XML, and text-heavy PDF files.
- Added a focused `/use-cases/document-to-markdown-converter` SEO page with FAQ coverage for supported formats, temporary server files, local tab persistence, and the no-OCR PDF boundary.
- Added homepage, README, `llms.txt`, sitemap, and structured-data discovery copy for the new conversion workflow.

### Changed

- Changed workspace preview margin controls to use evenly spaced percent levels so the final increase step no longer jumps abruptly to the widest layout.
- Converted files now appear in release copy as a workspace import path that opens directly in a new persistent local tab.

## 26.602 - 2026-06-02

### Added

- Added six focused long-tail SEO landing pages for README preview, GitHub Flavored Markdown, Mermaid diagrams, Markdown math, AI-generated Markdown, and online Markdown file viewing.
- Added homepage discovery links, sitemap entries, and `llms.txt` entries for the new SEO pages.
- Added FAQ and breadcrumb structured data to each SEO landing page.
- Added workspace preview margin controls and a workspace language switcher.
- Added homepage quick links for the six focused Markdown workflow pages.

### Changed

- Changed preview mode to default to the widest preview margin, with a 1:2:1 side/content/side reading ratio on desktop.
- Updated folder Markdown link handling so preview links remain stable during fast local-folder interactions.
- Improved share-link copying with a timeout and textarea fallback so the generated share link still appears when the Clipboard API stalls.
- Removed the remote Google Fonts build dependency and switched the monospace stack to local system fonts for more reliable production builds.

## 26.531 - 2026-05-31

### Added

- Added a public `/changelog` page and `/zh-CN/changelog` route with date-based product versions.
- Added latest deploy summaries to the homepage so new capabilities are visible without opening the repository.
- Added fixed top navigation on landing-style pages with language, GitHub, Workspace, and Changelog controls.

### Changed

- Updated homepage positioning to include local folder editing, persistent workspace tabs, PWA file handling, sharing, export, Chinese localization, and mobile layout fixes.
- Enlarged the mobile workspace new-tab import buttons for Paste, File, Folder, and URL.
- Refined the mobile preview bottom bar into larger app-style controls that use the available width.
- Mobile workspace now collapses the tab rail after a tab is created, imported, or selected so the reader can focus on the document.
- Mobile workspace now blurs the background when the tab rail is open and collapses it when the reader taps outside the rail.
- Landing and mobile workspace top navigation now sit flush to the top edge and span the viewport width.
- Share actions now expose the generated `/share/md-...` link as a visible, clickable URL after copying it.

## 26.530 - 2026-05-30

### Added

- Added Local Folder Workspace support for Chromium desktop browsers through the File System Access API.
- Added folder file browsing, new Markdown file creation, relative Markdown link navigation, and save-to-disk behavior.
- Added folder conflict handling and reconnect states for local folder sessions.

### Changed

- Refined the mobile workspace chrome, preview mode, and tab import flow.
- Improved PWA file tab handling so operating-system-opened Markdown files land in dedicated workspace tabs.

## 26.529 - 2026-05-29

### Added

- Added zh-CN landing and workspace routes with localized metadata and controls.
- Added installable PWA metadata, service worker support, and Markdown file handlers.
- Added desktop launch handling for Markdown files opened through the operating system.

## 0.2.0 - 2026-05-30

### Added

- Added installable PWA metadata through `manifest.webmanifest`.
- Added a service worker for the app shell and static assets.
- Added desktop PWA file handling for Markdown files, including `.md`, `.markdown`, `.mdx`, `.mdown`, `.mkd`, and `.txt`.
- Added workspace launch handling so files opened from the operating system load into a new Markdown workspace tab.
- Added test coverage for the PWA manifest and launch queue file opening path.

### Changed

- Documented PWA installation and Markdown file opening behavior in the README.

### Notes

- System-level file association depends on browser support. Chromium-based desktop browsers support this path; iOS Safari does not support manifest file handlers.

## 0.1.0 - 2026-04-18

### Added

- Initial open-source Markdown viewer workspace.
- Live Markdown editing and preview.
- GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, syntax-highlighted code blocks, local files, pasted Markdown, and remote URL import.
