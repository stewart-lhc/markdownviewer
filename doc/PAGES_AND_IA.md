# Pages And Information Architecture

## Route Map

### `/`

Landing page and primary entry point.

Purpose:

- explain value in one screen
- accept file, text, or URL input immediately
- route users into the workspace

Core sections:

- hero with input surface
- source support strip
- live preview sample
- feature proof
- trust / comparison
- final CTA

### `/workspace`

Primary application workspace for opening, viewing, editing, and exporting Markdown.

Core regions:

- top navigation and document controls
- left panel for sources, editor, or tabs
- center / right panel for rendered preview
- optional outline panel

Core modes:

- preview only
- split view
- editor only
- focus mode

### `/share/[id]`

Public share page for a saved Markdown document.

Purpose:

- show clean branded reading experience
- support copy and export actions
- provide safe fallbacks for unsupported content

### Error States

- invalid source URL
- fetch failed
- unsupported content
- empty document
- export failed

## Landing Page Details

## Hero

Content:

- headline
- subheadline
- primary input
- upload button
- sample button

Primary UX:

- paste a GitHub, Gist, or remote Markdown link
- drop a local `.md` file
- paste raw Markdown

## Source Support Strip

Badges or compact rows for:

- local files
- GitHub
- Gist
- raw URLs
- pasted Markdown

## Live Sample

Must render real Markdown, not a fake screenshot.

Sample content should show:

- headings
- code block
- table
- Mermaid
- math

## Feature Proof

Cards or panels for:

- beautiful reading
- export and share
- technical Markdown support
- responsive viewing

## CTA

Single clear action:

`Open Markdown Now`

## Workspace Details

## Top Bar

Actions:

- import
- mode switch
- theme switch
- export
- share
- more actions

## Left Panel

Possible tabs:

- files / sources
- editor
- document tabs

## Preview Panel

Must prioritize reading quality.

Features:

- strong typography
- code blocks with copy
- table overflow management
- images with lightbox
- heading anchors

## Outline Panel

Purpose:

- show document structure
- enable section jumping
- reflect scroll position

## Shared Page Details

Public page should remove authoring clutter.

Actions can be limited to:

- copy source
- open original
- export

## Navigation Philosophy

- minimal global navigation
- content-first local controls
- no dashboard feel
- actions grouped by task, not by technical implementation
