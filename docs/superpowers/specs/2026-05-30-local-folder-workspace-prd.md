# Markdownviewer Local Folder Workspace PRD

## Summary

Markdownviewer should remain a public, fast, online Markdown viewer and preview workspace. The next product step is to add a local-first folder workspace for users who want to open, browse, edit, and save a directory of Markdown files directly from the browser.

This borrows the most relevant lesson from `files.md`: plain `.md` files are a durable source of truth, and a browser PWA can feel like a real file workspace when it can open a local folder, show a file tree, search files, follow Markdown links, and save changes back to disk.

This PRD intentionally does not turn Markdownviewer into a full personal knowledge base. Chat capture, journals, tasks, backlinks, Telegram bots, and sync servers remain future ideas, not the MVP.

## Problem

Markdownviewer currently handles single-document and multi-tab Markdown preview well: paste, local file import, GitHub/Gist/raw URL import, rendering, outline, export, share, PWA install, and file-handler launch.

The gap is persistence and navigation across a user's own Markdown folder:

- Users can open a local Markdown file, but not a whole folder.
- Imported local files do not have a durable write-back workflow.
- There is no file tree, folder search, or cross-file link navigation.
- PWA file handling opens individual files, but does not create a persistent local workspace.
- Users with README/docs folders still need another editor or app for multi-file work.

`files.md` demonstrates that a browser app can make local `.md` files feel first-class. Markdownviewer should learn from that without copying its broader knowledge-base direction.

## Goals

- Let Chrome/Edge desktop users open a local folder and work with Markdown files in place.
- Preserve Markdownviewer as a viewer-first product: fast import, polished preview, export, and sharing stay central.
- Add a clear folder mode inside the existing workspace rather than creating a separate app.
- Support offline use for the app shell and already-open local folder flows where browser permissions allow it.
- Keep unsupported browsers useful through graceful fallbacks.

## Non-Goals

- Real-time collaboration.
- Accounts, teams, permissions, or billing.
- Hosted file sync.
- Telegram or messaging bot integration.
- Obsidian-style plugin systems, graph view, daily notes, or advanced PKM templates.
- Automatic access to local folders without a user-initiated picker.
- Full parity across Safari/Firefox/mobile for folder write-back.

## Competitive Learning

### What `files.md` Does Well

- Owns a distinct point of view: private, quiet, local `.md` files.
- Treats the folder as the workspace, not just a file picker.
- Uses browser file APIs to create, read, update, and navigate local files.
- Provides fast file search and keyboard-first movement.
- Makes local Markdown links useful for thinking across files.
- Works as a PWA and takes offline operation seriously.
- Documents architecture decisions clearly enough that users and LLM agents can extend the product.

### Where Markdownviewer Should Stay Different

- Markdownviewer should remain better for opening Markdown from anywhere: paste, file, GitHub, Gist, raw URL, AI output, and public share links.
- Markdownviewer should keep stronger preview/export/share flows instead of becoming only a private notes app.
- Markdownviewer should retain its SEO and public utility positioning.
- Markdownviewer should ship the local folder feature as an optional power mode, not the default mental model for every user.

## Target Users

### Developer Polishing Project Docs

Works in a repository with `README.md`, changelogs, API docs, and design docs. Wants to preview and lightly edit multiple Markdown files without opening a desktop editor.

### Technical Writer Reviewing Local Docs

Keeps documentation in folders and wants a clean browser preview with outline, code highlighting, diagrams, math, and export.

### AI Power User Organizing Markdown Output

Saves AI-generated Markdown into local folders and wants to review, clean up, and export/share selected documents.

### Casual Markdown File User

Has a folder of `.md` files and wants a simple installed PWA that can browse and open them.

## Product Positioning

Markdownviewer becomes:

> A polished online Markdown viewer with an optional local-first folder workspace for private `.md` files.

The homepage should still lead with "open Markdown from file, URL, GitHub, Gist, or paste". The workspace should introduce folder mode as a strong secondary option: "Open folder" for users who want persistent local files.

## Capability Tiers

### Tier 1: Chrome/Edge Desktop Full Mode

Supported through the File System Access API:

- Open a local folder through a user-triggered directory picker.
- Recursively scan supported Markdown files within safe limits.
- Display a folder tree.
- Open files into the current workspace tab model.
- Save edits back to the selected local file.
- Create new Markdown files.
- Rename, move, and delete files only after MVP if the read/write foundation is stable.
- Follow local Markdown links between files.
- Continue using the installed PWA shell offline when the app and folder permission are available.

### Tier 2: Browser Fallback Mode

For browsers without directory write support:

- Keep current paste, file import, URL import, tabs, share, export, and draft restore.
- Allow opening one or more files through normal file inputs where possible.
- Preserve changes in local draft storage.
- Offer download/export instead of write-back.
- Explain that folder write-back requires a supported desktop browser.

### Tier 3: Future Extension

- OPFS sandbox workspace for browsers that cannot write to arbitrary local folders.
- Folder import/export as `.zip`.
- Cloud-folder sync guidance through iCloud, Dropbox, OneDrive, or Google Drive.
- Self-hosted sync only if there is strong evidence users need it.

## MVP Scope

### Entry Points

- Add an `Open folder` action in the workspace import menu.
- Add an empty-state card in the tabs rail or source panel when no folder is open.
- Add PWA-friendly copy: installed app works best for local folders in Chrome/Edge desktop.

### Folder Session

- Store a granted `FileSystemDirectoryHandle` in IndexedDB when supported.
- On app load, detect whether a previous folder handle exists.
- Request read/write permission when needed.
- If permission is denied or expired, show a clear reconnect action.
- Track whether the active document came from a folder file, imported file, URL, paste, or share payload.

### File Tree

- Show a collapsible file tree in the existing left rail area.
- Include `.md`, `.markdown`, `.mdx`, and `.txt` in MVP.
- Exclude hidden directories and common heavy directories by default: `.git`, `node_modules`, `.next`, `dist`, `build`, `vendor`.
- Cap recursive scan depth and file count to prevent poor performance.
- Show unsupported/too-large-folder states without freezing the UI.

### File Opening

- Clicking a tree item opens the file in the active tab.
- If the active tab has unsaved changes, prompt to save, discard, or cancel.
- The document title comes from the first heading, then filename fallback.
- Existing outline, preview typography, themes, split mode, editor mode, export, and share continue to work.

### Saving

- Auto-save folder-backed files after a short debounce only after the first explicit successful save.
- Provide a visible save state: saved, saving, unsaved, failed.
- Support `Ctrl+S` / `Cmd+S`.
- Write back through `FileSystemFileHandle.createWritable()`.
- On write failure, preserve the current Markdown in draft storage and show recovery guidance.

### New File

- Create a new Markdown file in the selected folder or currently selected folder path.
- Default filename: `Untitled.md`, with conflict-safe suffixes.
- Initial content: `# Untitled`.
- Open the new file immediately after creation.

### Search

- Add command-palette style file search.
- Search by filename first.
- Include fuzzy matching if simple substring search feels insufficient.
- Keyboard shortcut: `Ctrl+K` / `Cmd+K`.
- Results should open files without disturbing the current split/preview mode.

### Local Markdown Links

- Resolve relative Markdown links such as `[Guide](docs/guide.md)` and `[Changelog](../CHANGELOG.md)`.
- Open local `.md`, `.markdown`, `.mdx`, and `.txt` links inside Markdownviewer.
- External `http(s)` links continue to open normally.
- Missing local target shows a non-blocking "file not found" message.

### Offline/PWA

- Keep existing manifest and file-handler behavior.
- Cache the workspace app shell and static assets needed for folder mode.
- Do not promise offline sync or automatic reauthorization.
- If the app opens offline and a previously granted folder handle is unavailable, show reconnect instructions.

## Out Of MVP

- Full folder rename/move/delete.
- Backlinks.
- Graph view.
- Chat capture.
- Journal/tasks/checklist workflows.
- Image paste/write into local `media/`.
- Multi-window conflict resolution.
- Git integration.
- Hosted sync.
- Mobile folder write-back.

## User Experience Requirements

### First Run

The workspace should make folder mode feel optional and clear:

- Primary actions: paste, file, URL, open folder.
- Folder mode copy: "Open a local folder. Files stay on your device."
- If unsupported: "Folder editing is available in Chrome/Edge desktop. You can still open individual files here."

### Workspace Layout

The current tabs rail should evolve into a workspace rail:

- When no folder is open, it shows document tabs.
- When a folder is open, it shows a compact file tree with tabs/active document affordances.
- The file tree must not crowd the editor on narrow screens; on mobile it collapses behind a button.

### Safety

Users should always know when edits are local only, saved to disk, or stored as a draft.

The UI should avoid destructive operations in MVP. File creation and saving are enough to prove the model.

### Copy Tone

Avoid PKM-heavy language. Use plain utility language:

- "Open folder"
- "Save to disk"
- "Reconnect folder"
- "File changed outside Markdownviewer"
- "This browser supports single-file import, not folder editing"

## Architecture Direction

### New Local Modules

Add a folder workspace layer under `lib/workspace/`:

- `folder-capabilities.ts`: detects API support and permission state.
- `folder-handles.ts`: IndexedDB persistence for directory and file handles.
- `folder-scan.ts`: safe recursive scanning, extension filters, ignored directories, scan limits.
- `folder-paths.ts`: path normalization and relative link resolution.
- `folder-documents.ts`: read/write helpers, save status, file metadata.

### Workspace State

Extend `WorkspaceTab` with optional source metadata:

- `sourceKind`: `draft | paste | file-import | remote-url | share | folder-file`.
- `folderFilePath`: normalized path inside the opened folder.
- `folderFileHandleId` or enough metadata to reacquire the handle from the folder index.
- `savedMarkdownHash` for dirty-state comparisons.

The Markdown string remains the single source of truth while editing. The folder file is the persistence target for folder-backed tabs.

### Data Flow

1. User clicks `Open folder`.
2. App calls `showDirectoryPicker({ mode: "readwrite" })`.
3. App stores the directory handle in IndexedDB when available.
4. App scans supported files into a lightweight folder index.
5. User opens a file from the tree.
6. App reads the file text into the active tab and marks it folder-backed.
7. User edits Markdown through the existing editor.
8. User saves with toolbar or shortcut.
9. App writes Markdown to the file handle and updates dirty/save state.
10. Preview, outline, export, and share use the existing Markdown renderer and export/share paths.

### Error Handling

- Unsupported API: show fallback mode, keep current import paths.
- Permission denied: keep existing drafts; show reconnect folder CTA.
- Scan too large: stop scan at limit and show partial result message.
- File read error: leave current document unchanged and show error status.
- File write error: preserve draft, mark save failed, offer export/download.
- External modification: compare file modification metadata before write when possible; if changed, ask user to overwrite, reload, or keep draft.
- Link target missing: show status message and keep current document.

## Technical Constraints

- `showDirectoryPicker()` requires a secure context and user activation.
- Directory picker and write-back support are not baseline across all major browsers.
- Browser permissions can expire or require re-prompting.
- Installed PWA status improves product feel but does not remove browser security constraints.
- Folder handles should not be serialized directly into localStorage; use IndexedDB.
- Scanning must be incremental or yield to the browser for large folders.

## Testing Requirements

### Unit Tests

- Capability detection for supported and unsupported browsers.
- Path normalization and relative Markdown link resolution.
- Ignore-list filtering.
- Scan depth and file count limits.
- Dirty-state detection and save status transitions.
- Fallback messages for unsupported browser paths.

### Component Tests

- `Open folder` action appears in workspace import UI.
- Unsupported browser hides or disables folder action with explanatory copy.
- Folder tree renders nested Markdown files.
- Selecting a file loads Markdown into the existing editor/preview.
- Unsaved-change guard blocks accidental tab/file switches.
- Save button and `Ctrl+S` trigger folder write for folder-backed tabs.

### Browser/E2E Tests

Use Playwright where browser APIs can be stubbed:

- Mock `showDirectoryPicker` with an in-memory directory handle.
- Open folder, scan files, open file, edit, save, verify write call.
- Reconnect flow after permission denial.
- Local Markdown link opens another folder file.
- Large folder scan shows capped/partial state.

Manual QA should cover installed PWA behavior in Chrome/Edge desktop.

## Success Metrics

### Product Metrics

- Folder open success rate.
- First folder file opened after folder picker.
- Save success rate.
- Repeat usage of folder mode within 7 days.
- Export/share rate from folder-backed documents.

### Quality Metrics

- Zero known data-loss bugs before release.
- No UI freeze on folders within documented limits.
- Clear fallback behavior in unsupported browsers.
- Existing workspace tests remain green.

## Release Plan

### Phase 1: Read-Only Folder Preview

- Capability detection.
- Open folder action.
- Folder tree scan.
- Open local files into existing workspace.
- File search.
- Local Markdown link navigation.
- No write-back yet except current import/export flows.

### Phase 2: Safe Write-Back

- Save state.
- `Ctrl+S` / save button.
- Write back to selected file.
- New file creation.
- Unsaved-change guard.
- Save failure recovery.

### Phase 3: PWA Polish

- Persist folder handles in IndexedDB.
- Reconnect flow.
- Offline app shell verification.
- Installed PWA copy and QA.
- Browser fallback refinement.

### Phase 4: Future Evaluation

Evaluate, but do not pre-commit to:

- OPFS workspace.
- Folder zip import/export.
- Image paste into local media folder.
- Backlinks.
- Quick capture.
- Self-hosted sync.

## Acceptance Criteria

- In Chrome/Edge desktop, a user can open a local folder, see Markdown files, open one, edit it, save it, refresh the app, reconnect the folder if needed, and continue.
- In unsupported browsers, a user sees a clear fallback and can still use existing single-file/paste/URL workflows.
- Existing Markdown rendering, outline, tabs, themes, share, HTML export, PDF print, i18n routes, and PWA file handling continue to work.
- No destructive file operation ships in MVP without explicit confirmation and test coverage.
- The feature is documented in README with browser support notes.

## Risks

- Browser file permissions are inconsistent and can surprise users.
- A write-back bug could cause data loss.
- Large folders can degrade performance if scanned naively.
- The left rail can become crowded if tabs and files are combined without a clear model.
- Product positioning can drift toward PKM if future features are added too aggressively.

## Mitigations

- Ship read-only folder preview before write-back.
- Keep every write operation explicit and recoverable until save reliability is proven.
- Preserve unsaved content in local draft storage before writes.
- Add scan limits and excluded directories from day one.
- Keep folder mode optional and secondary to the existing viewer workflow.
- Defer chat, backlinks, and sync until folder mode has real usage evidence.

## References

- `files.md`: https://github.com/zakirullin/files.md
- `files.md` app: https://files.md/
- MDN `showDirectoryPicker()`: https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker
- Chrome File System Access API: https://developer.chrome.com/docs/capabilities/web-apis/file-system-access
- Chrome PWA File Handling: https://developer.chrome.com/docs/capabilities/web-apis/file-handling
