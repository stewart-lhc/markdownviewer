# Changelog

All notable changes to this project are documented in this file.

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
