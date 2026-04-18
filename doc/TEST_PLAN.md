# Test Plan

## Goal

Verify that `markdownviewer.run` works reliably across import, rendering, reader UX, export, sharing, responsiveness, and deployment.

## Test Categories

## Source Input

- open local `.md` file
- drag and drop a local `.md` file
- paste raw Markdown into the workspace
- open a GitHub blob URL
- open a GitHub raw URL
- open a Gist URL
- open a remote `.md` URL

## Rendering

- headings and nested headings
- blockquotes
- ordered and unordered lists
- tables
- fenced code blocks
- inline code
- footnotes
- task lists
- Mermaid diagrams
- inline math
- block math
- images

## Reader UX

- heading anchors
- table of contents
- code copy button
- light / dark theme
- width presets
- focus mode
- preview only mode
- split mode
- editor only mode

## Editor UX

- type and update preview
- autosave behavior
- multi-tab switching
- search and replace

## Share And Export

- generate share link
- open shared page
- export HTML
- export PDF

## Error Handling

- malformed URL
- failed network fetch
- unsupported content
- export failure

## Responsive Coverage

- mobile portrait
- tablet
- desktop

## Performance Coverage

- long Markdown document
- large code block
- many headings in outline
- large table
- multiple Mermaid blocks

## Browser Verification Expectations

When browser automation is restored, verify:

- page loads without fatal console errors
- hero input accepts valid sources
- workspace flows complete
- share and export controls are visible and functional
- responsive layouts remain usable

## Release Gate

Do not mark the project complete until:

- critical source paths pass
- critical rendering paths pass
- export paths pass
- mobile and desktop checks pass
- deployed production path passes
