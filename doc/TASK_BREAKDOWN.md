# Task Breakdown

## Step 1: Product Definition

### Completed

- define product positioning
- define V1 scope
- define non-goals
- define release phases

### Deliverables

- `PRD.md`
- this task breakdown

## Step 2: Experience And Design

### Landing Page

- create hero with file and URL input
- create supported source section
- create sample document preview
- create feature comparison / trust section
- create final CTA

### Workspace

- create header and toolbar
- create editor / split / preview modes
- create document tab system
- create outline / table of contents panel
- create dropzone and import states

### Shared Page

- create public reading layout
- create minimal branding shell
- create actions for export and copy

### Design System

- define typography
- define color tokens
- define spacing scale
- define component styles for cards, panels, buttons, inputs, code blocks, tables, alerts

## Step 3: Frontend Engineering

### App Foundation

- confirm framework and routing setup in current repository
- establish app shell
- establish page structure
- establish state model

### Input Pipelines

- local file upload
- drag and drop
- paste Markdown text
- GitHub URL parsing
- Gist URL parsing
- remote Markdown URL fetching

### Rendering

- Markdown parser pipeline
- sanitization
- syntax highlighting
- Mermaid rendering
- math rendering
- heading anchor generation
- table of contents generation
- copy button injection

### Reader UX

- theme switching
- reading width controls
- image lightbox
- focus mode
- present mode
- responsive table handling

### Editor UX

- modern editor integration
- autosave
- multi-tab state
- search and replace
- mode switching

### Sharing And Export

- shared document model
- public route rendering
- HTML export
- PDF export
- share URL generation

## Step 4: QA

### Functional Verification

- local file open
- drag and drop
- GitHub URL open
- Gist URL open
- remote URL open
- syntax highlighting
- Mermaid
- math
- share link generation
- HTML export
- PDF export

### Responsive Verification

- desktop
- tablet
- mobile

### Regression Verification

- large document render
- large code block render
- large table handling
- multi-tab persistence

## Step 5: GitHub

- inspect current branch and remote
- commit documentation and code changes
- push to remote

## Step 6: Vercel

- create or link project under `10kmrr`
- configure production settings
- deploy
- verify deployment health

## Step 7: Domain And DNS

- add `markdownviewer.run` to Vercel
- add `www.markdownviewer.run` if used
- verify required records
- configure Cloudflare DNS
- enable orange cloud proxy after healthy verification

## Completion Criteria

The project is complete when:

- `/doc` contains delivery documents
- app is implemented and working
- key flows are browser-tested
- code is pushed to GitHub
- Vercel production deployment is live
- `markdownviewer.run` resolves correctly through Cloudflare proxy
