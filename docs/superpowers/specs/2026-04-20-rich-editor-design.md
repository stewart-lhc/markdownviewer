# Syntax-Visible Rich Editor Redesign

## Summary

Replace the current pure HTML rich editor with a StackEdit-style markdown editor: the left pane must keep markdown syntax visible while styling the content so headings, emphasis, lists, and quotes feel closer to the rendered preview. The user should still edit plain markdown through a single textarea input surface, with a presentation layer behind it that highlights syntax and semantics.

## Goals

- `Rich` mode keeps markdown punctuation visible, including `#`, `##`, `**`, list markers, and quote markers.
- `Rich` mode visually styles markdown so headings, emphasis, and blocks are easier to scan than plain source text.
- `Raw` mode remains a plain source editor without the styled highlight layer.
- Toolbar actions continue to operate on markdown text selections in both modes.
- Split mode keeps the editor and preview aligned without double shells or overlapping layers.

## Non-Goals

- Converting the editor into a true contenteditable WYSIWYG document.
- Perfect tokenization for every advanced markdown construct.
- Replacing the right preview pane.

## User Experience

### Rich Mode

- The user types into a textarea.
- A non-interactive highlight layer mirrors the markdown behind the textarea.
- Markdown syntax characters remain visible.
- Headings, emphasis, lists, and quotes get styled so the source is easier to read.
- The editor behaves like StackEdit, not Typora.

### Raw Mode

- The user sees only the textarea content.
- No styled mirror layer is shown.
- This remains the fallback for exact source editing and debugging.

## Technical Direction

### Source Of Truth

- Markdown text in `WorkspaceShell` remains the only persisted document value.
- Both `Rich` and `Raw` modes edit the same textarea-backed markdown string.

### Editing Model

- `Rich` mode uses:
  - a textarea for input, caret, selection, and scroll ownership
  - a mirrored `<pre>` highlight layer beneath it for styled markdown display
- `Raw` mode uses the same textarea without the visible highlight layer.
- The textarea remains the only editable element in both modes.

### Highlighting Scope

Support lightweight styling for the markdown patterns already present in the starter document:

- headings
- bold / italic / strike
- links
- inline code
- unordered / ordered / task lists
- blockquotes
- thematic breaks

The highlight layer does not need to parse every nested edge case perfectly, but it must preserve visible syntax markers and avoid the current double-render overlap.

## Reference Comparison

StackEdit keeps markdown syntax visible in the editor while making the source feel richly formatted. This redesign follows that model rather than a pure WYSIWYG editor model.

## Testing Requirements

- Add a failing regression test proving `Rich` mode shows the syntax-aware highlight layer again.
- Add a failing regression test proving headings render with visible `#` markers in the editor.
- Add a failing regression test proving bold markdown keeps `**` visible while styling the emphasized text.
- Add a failing regression test proving `Raw` mode hides the styled highlight layer and keeps the plain textarea editor.

## Risks

- Overlay sync can drift if scroll ownership is split incorrectly.
- Token styling can become unreadable if the textarea and highlight layer typography diverge.

## Risk Mitigation

- Keep scroll ownership with the textarea.
- Reuse one typography baseline between textarea and highlight layer.
- Keep the parser lightweight and focused on current document patterns.
