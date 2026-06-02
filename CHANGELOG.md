# Changelog

All notable changes to this project are documented in this file.

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
