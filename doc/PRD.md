# PRD

## Product Name

`markdownviewer.run`

## Positioning

The fastest and most beautiful way to open any Markdown.

`markdownviewer.run` is a web product for instantly opening, reading, lightly editing, exporting, and sharing Markdown from files, pasted text, GitHub, Gists, and remote URLs.

It should feel more polished than a developer utility and more focused than a full collaborative knowledge base.

## Problem

Current browser-based Markdown viewers often fail in one or more of these areas:

- they are visually generic
- they are optimized for editing, not reading
- they are fragile with math, Mermaid, or long documents
- sharing is weak or temporary
- importing Markdown from common developer sources is clumsy

The referenced competitor solves part of the problem with a feature-rich browser tool, but still leaves room in product design, reader experience, and robustness.

## Goal

Ship a production-ready Markdown web app that wins on:

- first-use speed
- visual quality
- Markdown rendering breadth
- reading ergonomics
- reliable export and sharing

## Non-Goals For V1

- real-time multi-user collaboration
- team workspaces and permissions
- full knowledge base or CMS workflows
- advanced version history
- billing or account system

## Primary Users

### Developers

Need to quickly open README files, project docs, changelogs, and Gists.

### Builders and Indie Hackers

Need to turn Markdown into a clean, shareable page without setting up a docs site.

### Writers and Researchers

Need a lightweight reader and exporter with strong typography and support for code, tables, diagrams, and math.

### General Users

Have a local `.md` file and simply want to view it properly in the browser.

## Core Jobs To Be Done

- Open a Markdown file or URL instantly
- Read Markdown in a beautiful, distraction-free layout
- Share a Markdown document with a link
- Export Markdown to HTML or PDF
- Handle technical content including code, Mermaid, and math

## V1 Scope

### Input Sources

- local file upload
- drag and drop
- pasted Markdown text
- GitHub blob/raw URL
- Gist URL
- remote `.md` URL

### Viewing

- high-quality Markdown rendering
- GitHub Flavored Markdown support
- syntax highlighting
- Mermaid support
- LaTeX math support
- image rendering
- table overflow handling
- footnotes
- heading anchors
- table of contents

### Reading UX

- light and dark themes
- reading width presets
- editor-only, split, and preview-only modes
- code copy buttons
- image lightbox
- focus reading mode
- present mode

### Editing

- modern editor experience
- local autosave
- multi-document tabs
- search and replace

### Output

- shareable document link
- HTML export
- PDF export

### SEO And Shareability

- strong metadata for the homepage
- public shared pages with OG tags
- clean URLs where applicable

## Information Architecture

### Marketing / Landing

- hero with primary input
- feature proof section
- supported sources
- sample document entry point
- call to action

### Workspace

- input/editor area
- rendered preview area
- toolbar
- document outline
- document tabs

### Shared Public Page

- reader-first layout
- branded header/footer kept minimal
- copy Markdown / open original / export actions where appropriate

## UX Principles

- input-first, not dashboard-first
- content-first, not toolbar-first
- reader quality should beat GitHub default rendering
- empty states should be inviting and informative
- power features must stay discoverable without clutter

## Design Direction

Editorial tech.

The interface should combine:

- the speed and precision of a modern code tool
- the visual calm of a reading product
- a distinct brand look instead of Bootstrap utility aesthetics

## Competitive Advantage Targets

Compared with the referenced competitor, `markdownviewer.run` should be better at:

- homepage conversion to first successful open
- content presentation quality
- reading ergonomics
- visual identity
- stability for large and complex documents
- long-lived sharing and publishing

Compared with StackEdit, `markdownviewer.run` should feel more beautiful and easier to use for passive viewing.

Compared with HackMD, `markdownviewer.run` should be simpler and faster for opening and publishing single Markdown documents.

## Success Metrics

### Product

- time to first successful document open
- share link creation rate
- export success rate
- return usage rate within 7 days

### Technical

- render success rate across supported Markdown features
- large document rendering stability
- PDF export stability
- mobile usability pass rate

## Release Phases

### Phase 1

- landing page
- document workspace
- core rendering
- core sharing/export

### Phase 2

- repository-level Markdown browsing
- book mode
- richer publish templates

### Phase 3

- collaborative review and comments
- AI-assisted document enhancements

## Risks

- unreliable PDF generation for long documents
- math and Mermaid edge cases
- remote URL fetch restrictions and CORS
- local environment issues affecting test and deployment automation

## Open Technical Requirement

V1 must avoid fragile implementation choices that are known to break on large Markdown documents.
