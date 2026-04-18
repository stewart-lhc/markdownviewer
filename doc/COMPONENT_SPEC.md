# Component Specification

## Global App Shell

Responsibilities:

- theme and layout state
- route-level shell framing
- responsive breakpoints

## Hero Input Surface

Responsibilities:

- accept URL input
- accept pasted Markdown
- trigger file upload
- handle drag and drop

States:

- idle
- drag active
- loading
- error

## Source Parser

Responsibilities:

- detect source type
- normalize GitHub and Gist links
- validate remote `.md` URLs
- prepare content loading pipeline

## Document Tabs

Responsibilities:

- track opened documents
- switch active document
- close document
- preserve dirty state

## Editor

Responsibilities:

- text authoring
- search and replace
- autosave
- selection and cursor continuity

## Preview Renderer

Responsibilities:

- render Markdown safely
- support technical content
- inject heading anchors
- inject code copy controls

## Outline

Responsibilities:

- read generated headings
- show hierarchy
- sync active section with scroll

## Code Block

Responsibilities:

- syntax highlight
- show language label
- copy code
- support long content handling

## Table Viewer

Responsibilities:

- preserve readability on narrow screens
- enable horizontal scroll where needed

## Image Viewer

Responsibilities:

- responsive rendering
- click to lightbox
- safe fallback on load failure

## Mermaid Block

Responsibilities:

- lazy-load diagram renderer
- render or fail gracefully

## Math Block

Responsibilities:

- lazy-load math renderer
- render inline and block math
- expose clear fallback on failure

## Export Controls

Responsibilities:

- export HTML
- export PDF
- show progress or failure state

## Share Controls

Responsibilities:

- generate share payload
- create public URL
- copy share link

## Toast / Status Feedback

Responsibilities:

- notify import success
- notify export success
- notify failure cases clearly

## Empty States

Responsibilities:

- explain what the user can do next
- provide sample content
- keep the interface from feeling blank
