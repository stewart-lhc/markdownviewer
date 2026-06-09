import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceToolbar } from "@/components/workspace/workspace-toolbar";
import { getMessages } from "@/lib/i18n/messages";

describe("WorkspaceToolbar", () => {
  it("opens the current URL input value even before parent state rerenders", () => {
    const onParseSource = vi.fn();
    const pastedUrl = "https://github.com/BuilderPulse/BuilderPulse/blob/main/zh%2F2026%2F2026-06-09.md";

    render(
      <WorkspaceToolbar
        activeImportMode="url"
        messages={getMessages("en").workspace.toolbar}
        mode="split"
        sourceValue=""
        onActiveImportModeChange={vi.fn()}
        onConvertFile={vi.fn()}
        onExportHtml={vi.fn()}
        onExportPdf={vi.fn()}
        onFileImport={vi.fn()}
        onModeChange={vi.fn()}
        onOpenFolder={vi.fn()}
        onParseSource={onParseSource}
        onPasteIntoEditor={vi.fn()}
        onSaveToDisk={vi.fn()}
        onSourceChange={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/markdown source url/i), {
      target: { value: pastedUrl }
    });
    fireEvent.click(screen.getByRole("button", { name: /^open$/i }));

    expect(onParseSource).toHaveBeenCalledWith(pastedUrl);
  });
});
