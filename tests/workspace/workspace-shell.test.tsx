import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getBoundStackeditEditor } from "@/lib/workspace/stackedit-cledit";
import { serializeRichEditorSurface } from "@/lib/workspace/rich-editor-surface";
import { pendingWorkspaceImportKey } from "@/lib/workspace/pending-import";
import { convertDocumentToMarkdown } from "@/lib/workspace/convert-document";

vi.mock("@/lib/workspace/convert-document", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/workspace/convert-document")>();

  return {
    ...actual,
    convertDocumentToMarkdown: vi.fn()
  };
});

const workspaceTabsStorageKey = "markdownviewer.workspace.tabs.v1";
const mockedConvertDocumentToMarkdown = vi.mocked(convertDocumentToMarkdown);

function getStackeditEditor(richEditor: HTMLElement) {
  const editor = getBoundStackeditEditor(richEditor);

  expect(editor).not.toBeNull();
  return editor;
}

async function waitForRichEditorReady(richEditor: HTMLElement) {
  await waitFor(() => {
    expect((richEditor as HTMLDivElement).contentEditable).toBeTruthy();
    expect(richEditor.textContent).not.toBe("");
  }, { timeout: 10000 });
}

type FakeFolderEntry = FakeDirectoryHandle | FakeFileHandle;

class FakeFileHandle {
  readonly kind = "file" as const;
  lastModified: number;

  constructor(
    readonly name: string,
    public content: string,
    lastModified = 1_700_000_000_000
  ) {
    this.lastModified = lastModified;
  }

  async getFile() {
    return new File([this.content], this.name, {
      lastModified: this.lastModified,
      type: "text/markdown"
    });
  }

  async createWritable() {
    let nextContent = this.content;

    return {
      write: vi.fn(async (chunk: unknown) => {
        nextContent = String(chunk);
      }),
      close: vi.fn(async () => {
        this.content = nextContent;
        this.lastModified += 1000;
      })
    } as unknown as FileSystemWritableFileStream;
  }
}

class FakeDirectoryHandle {
  readonly kind = "directory" as const;
  readonly children = new Map<string, FakeFolderEntry>();

  constructor(
    readonly name: string,
    entries: Record<string, FakeFolderEntry> = {},
    private permission: PermissionState = "granted"
  ) {
    Object.entries(entries).forEach(([key, entry]) => {
      this.children.set(key, entry);
    });
  }

  async queryPermission() {
    return this.permission;
  }

  async requestPermission() {
    return this.permission;
  }

  async *values() {
    for (const entry of this.children.values()) {
      yield entry as unknown as FileSystemHandle;
    }
  }

  async *entries() {
    for (const [name, entry] of this.children.entries()) {
      yield [name, entry as unknown as FileSystemHandle] as [string, FileSystemHandle];
    }
  }

  async getFileHandle(name: string, options: { create?: boolean } = {}) {
    const existing = this.children.get(name);

    if (existing instanceof FakeFileHandle) {
      return existing as unknown as FileSystemFileHandle;
    }

    if (existing) {
      throw new DOMException("Entry is not a file.", "TypeMismatchError");
    }

    if (!options.create) {
      throw new DOMException("File does not exist.", "NotFoundError");
    }

    const created = new FakeFileHandle(name, "");
    this.children.set(name, created);
    return created as unknown as FileSystemFileHandle;
  }

  async getDirectoryHandle(name: string, options: { create?: boolean } = {}) {
    const existing = this.children.get(name);

    if (existing instanceof FakeDirectoryHandle) {
      return existing as unknown as FileSystemDirectoryHandle;
    }

    if (existing) {
      throw new DOMException("Entry is not a directory.", "TypeMismatchError");
    }

    if (!options.create) {
      throw new DOMException("Directory does not exist.", "NotFoundError");
    }

    const created = new FakeDirectoryHandle(name);
    this.children.set(name, created);
    return created as unknown as FileSystemDirectoryHandle;
  }
}

function createFolderFixture() {
  const readme = new FakeFileHandle(
    "README.md",
    "# Home\n\n[Guide](docs/guide.md)\n\n[Missing](missing.md)\n"
  );
  const guide = new FakeFileHandle("guide.md", "# Guide\n");
  const untitled = new FakeFileHandle("Untitled.md", "# Existing\n");
  const root = new FakeDirectoryHandle("Docs", {
    "README.md": readme,
    "Untitled.md": untitled,
    docs: new FakeDirectoryHandle("docs", {
      "guide.md": guide
    })
  });

  return { guide, readme, root, untitled };
}

function mockDirectoryPicker(root: FakeDirectoryHandle) {
  const showDirectoryPicker = vi.fn(async () => root as unknown as FileSystemDirectoryHandle);

  Object.defineProperty(window, "showDirectoryPicker", {
    configurable: true,
    value: showDirectoryPicker
  });

  return showDirectoryPicker;
}

function mockCompactWorkspace() {
  const mediaQuery = {
    matches: true,
    media: "(max-width: 720px)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  };

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => mediaQuery)
  });

  return mediaQuery;
}

afterEach(() => {
  Reflect.deleteProperty(window, "showDirectoryPicker");
  Reflect.deleteProperty(window, "matchMedia");
  mockedConvertDocumentToMarkdown.mockReset();
  vi.restoreAllMocks();
});

describe("WorkspaceShell interactions", () => {
  it("shows a dedicated document conversion entry in the import controls", () => {
    render(<WorkspaceShell markdown="" sourceInput="" />);

    expect(screen.getByRole("button", { name: /convert/i })).toBeInTheDocument();
  });

  it("defaults to split mode, renders a syntax-visible rich editor, and updates the live preview while editing", async () => {
    render(<WorkspaceShell markdown="# First draft" sourceInput="" />);

    expect(screen.getByRole("tablist", { name: /open tabs/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /first draft/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: /new tab/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new tab/i }).closest(".workspace-tabs-list-actions")).not.toBeNull();
    expect(screen.getByLabelText(/markdownviewer home/i).closest(".workspace-tabs-rail")).not.toBeNull();
    expect(screen.queryByText(/^tabs$/i)).not.toBeInTheDocument();
    const sourcePanel = screen.getByTestId("source-panel");
    const richEditor = screen.getByTestId("editor-rich-surface");

    expect(screen.getByTestId("workspace-grid")).toHaveAttribute("data-mode", "split");
    expect(sourcePanel).toBeInTheDocument();
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /template: paper/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /template: paper/i }).closest(".toolbar")).toBeNull();
    expect(
      screen.getByRole("button", { name: /template: paper/i }).closest(".workspace-pane-header--preview")
    ).not.toBeNull();
    expect(
      within(screen.getByTestId("preview-panel")).getByLabelText(/^preview font$/i).closest(".workspace-pane-header--preview")
    ).not.toBeNull();
    expect(
      within(screen.getByTestId("preview-panel")).getByRole("button", { name: /increase preview font size/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^url$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /contents/i }).closest(".workspace-toc")).not.toBeNull();
    expect(
      within(sourcePanel).getByRole("toolbar", { name: /markdown formatting/i }).closest(".workspace-pane-header--editor")
    ).not.toBeNull();
    expect(screen.queryByLabelText(/markdown source url/i)).not.toBeInTheDocument();
    expect(richEditor).toBeInTheDocument();
    expect(screen.queryByTestId("editor-highlight")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/markdown editor/i, { selector: "textarea" })).not.toBeInTheDocument();

    await waitForRichEditorReady(richEditor);
    expect(within(sourcePanel).getByText("#", { selector: ".md-token--syntax" })).toBeInTheDocument();
    expect(within(sourcePanel).getByText("First draft", { selector: ".md-token--heading-text" })).toBeInTheDocument();

    const editor = getStackeditEditor(richEditor);
    editor.replace(0, editor.getContent().length, "# Updated draft\n");

    await waitFor(() => {
      expect(
        within(screen.getByTestId("preview-panel")).getByRole("heading", {
          level: 1,
          name: "Updated draft"
        })
      ).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it("lets the user create and switch workspace tabs without losing each tab's document", async () => {
    const user = userEvent.setup();
    const readText = vi.fn().mockResolvedValue("# Second draft");

    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { readText }
    });

    render(<WorkspaceShell markdown="# First draft" sourceInput="" />);

    await user.click(screen.getByRole("button", { name: /new tab/i }));
    const dialog = screen.getByRole("dialog", { name: /new tab/i });
    await user.click(within(dialog).getByRole("button", { name: /paste/i }));

    expect(await screen.findByRole("tab", { name: /second draft/i })).toHaveAttribute("aria-selected", "true");
    expect(
      await within(screen.getByTestId("preview-panel")).findByRole("heading", {
        level: 1,
        name: "Second draft"
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: "First draft" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /first draft/i }));

    expect(screen.getByRole("tab", { name: /first draft/i })).toHaveAttribute("aria-selected", "true");
    expect(
      within(screen.getByTestId("preview-panel")).getByRole("heading", {
        level: 1,
        name: "First draft"
      })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /second draft/i }));

    expect(screen.getByRole("tab", { name: /second draft/i })).toHaveAttribute("aria-selected", "true");
  });

  it("shows a localized folder fallback when the browser does not support directory access", async () => {
    const user = userEvent.setup();

    render(<WorkspaceShell markdown="" sourceInput="" locale="zh-CN" />);

    await user.click(screen.getByRole("button", { name: "打开文件夹" }));

    expect(await screen.findByText(/Chrome\/Edge 桌面/)).toBeInTheDocument();
  });

  it("opens a local folder and switches between files from the folder rail", async () => {
    const user = userEvent.setup();
    const { root } = createFolderFixture();
    const showDirectoryPicker = mockDirectoryPicker(root);

    render(<WorkspaceShell markdown="" sourceInput="" />);

    await user.click(screen.getByRole("button", { name: /^folder$/i }));

    expect(showDirectoryPicker).toHaveBeenCalledWith({ mode: "readwrite" });
    expect(await screen.findByLabelText(/local folder files/i)).toBeInTheDocument();
    expect(screen.getByText("Docs", { selector: ".workspace-folder-title" })).toBeInTheDocument();

    await user.click(await screen.findByRole("treeitem", { name: "README.md" }));

    expect(
      await within(screen.getByTestId("preview-panel")).findByRole("heading", {
        level: 1,
        name: "Home"
      })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("treeitem", { name: "README.md" })).toHaveAttribute("aria-selected", "true");
    });

    await user.click(screen.getByRole("treeitem", { name: "guide.md" }));

    expect(
      await within(screen.getByTestId("preview-panel")).findByRole("heading", {
        level: 1,
        name: "Guide"
      })
    ).toBeInTheDocument();
  });

  it("writes the active folder file back to disk with Ctrl+S", async () => {
    const user = userEvent.setup();
    const { readme, root } = createFolderFixture();
    mockDirectoryPicker(root);

    render(<WorkspaceShell markdown="" sourceInput="" />);

    await user.click(screen.getByRole("button", { name: /^folder$/i }));
    await user.click(await screen.findByRole("treeitem", { name: "README.md" }));
    await user.click(screen.getByRole("button", { name: /raw/i }));

    fireEvent.change(screen.getByLabelText(/markdown editor/i), {
      target: { value: "# Saved locally" }
    });

    expect(
      await within(screen.getByTestId("preview-panel")).findByRole("heading", {
        level: 1,
        name: "Saved locally"
      })
    ).toBeInTheDocument();

    fireEvent.keyDown(window, {
      ctrlKey: true,
      key: "s"
    });

    await waitFor(() => {
      expect(readme.content).toBe("# Saved locally");
    });
    expect(await screen.findByText(/saved to disk/i)).toBeInTheDocument();
  });

  it("guards dirty folder files before switching to another file", async () => {
    const user = userEvent.setup();
    const { root } = createFolderFixture();
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(false);

    mockDirectoryPicker(root);
    render(<WorkspaceShell markdown="" sourceInput="" />);

    await user.click(screen.getByRole("button", { name: /^folder$/i }));
    await user.click(await screen.findByRole("treeitem", { name: "README.md" }));
    await user.click(screen.getByRole("button", { name: /raw/i }));

    fireEvent.change(screen.getByLabelText(/markdown editor/i), {
      target: { value: "# Keep me" }
    });
    expect(await within(screen.getByTestId("preview-panel")).findByRole("heading", { name: "Keep me" })).toBeInTheDocument();

    await user.click(screen.getByRole("treeitem", { name: "guide.md" }));

    expect(confirm).toHaveBeenCalledTimes(2);
    expect(confirm).toHaveBeenNthCalledWith(1, expect.stringMatching(/save changes/i));
    expect(confirm).toHaveBeenNthCalledWith(2, expect.stringMatching(/discard unsaved/i));
    expect(within(screen.getByTestId("preview-panel")).getByRole("heading", { name: "Keep me" })).toBeInTheDocument();
  });

  it("creates a conflict-suffixed Untitled file and opens it immediately", async () => {
    const user = userEvent.setup();
    const { root } = createFolderFixture();
    mockDirectoryPicker(root);

    render(<WorkspaceShell markdown="" sourceInput="" />);

    await user.click(screen.getByRole("button", { name: /^folder$/i }));
    await screen.findByRole("treeitem", { name: "Untitled.md" });
    await user.click(screen.getByRole("button", { name: /new file/i }));

    expect(await screen.findByRole("treeitem", { name: "Untitled 2.md" })).toBeInTheDocument();
    expect(root.children.get("Untitled 2.md")).toBeInstanceOf(FakeFileHandle);
    expect(
      await within(screen.getByTestId("preview-panel")).findByRole("heading", {
        level: 1,
        name: "Untitled"
      })
    ).toBeInTheDocument();
  });

  it("opens local Markdown links and reports missing folder links without navigating away", async () => {
    const user = userEvent.setup();
    const { root } = createFolderFixture();
    mockDirectoryPicker(root);

    render(<WorkspaceShell markdown="" sourceInput="" />);

    await user.click(screen.getByRole("button", { name: /^folder$/i }));
    await user.click(await screen.findByRole("treeitem", { name: "README.md" }));

    const previewPanel = screen.getByTestId("preview-panel");

    await user.click(await within(previewPanel).findByRole("link", { name: "Missing" }));
    expect(await screen.findByText(/could not find \/missing\.md/i)).toBeInTheDocument();
    expect(within(previewPanel).getByRole("heading", { name: "Home" })).toBeInTheDocument();

    const refreshedPreviewPanel = screen.getByTestId("preview-panel");

    await user.click(within(refreshedPreviewPanel).getByRole("link", { name: "Guide" }));

    expect(
      await within(refreshedPreviewPanel).findByRole("heading", {
        level: 1,
        name: "Guide"
      })
    ).toBeInTheDocument();
  });

  it("collapses the tabs sidebar into the workspace header without leaving a side rail", async () => {
    const user = userEvent.setup();

    const { container } = render(<WorkspaceShell markdown="# First draft" sourceInput="" />);

    expect(screen.getByText("First draft", { selector: ".workspace-header-title" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /collapse tabs sidebar/i }));

    expect(screen.getByText("First draft", { selector: ".workspace-header-title" })).toBeInTheDocument();
    expect(container.querySelector(".workspace-page")).toHaveAttribute("data-tabs-collapsed", "true");
    expect(container.querySelector(".workspace-tabs-rail")).not.toBeInTheDocument();
    const header = container.querySelector(".workspace-header") as HTMLElement;
    expect(within(header).getByRole("button", { name: /expand tabs sidebar/i })).toBeInTheDocument();
    expect(within(header).queryByLabelText(/markdownviewer home/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("tablist", { name: /open tabs/i })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(window.localStorage.getItem("markdownviewer.workspace.tabs.collapsed")).toBe("true");
    });

    await user.click(screen.getByRole("button", { name: /expand tabs sidebar/i }));

    expect(screen.getByRole("tablist", { name: /open tabs/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(window.localStorage.getItem("markdownviewer.workspace.tabs.collapsed")).toBe("false");
    });
  });

  it("collapses the mobile tabs rail after creating or switching tabs", async () => {
    const user = userEvent.setup();
    const readText = vi.fn().mockResolvedValue("# Mobile pasted tab");

    mockCompactWorkspace();
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { readText }
    });

    const { container } = render(<WorkspaceShell markdown="# First tab" sourceInput="" />);
    const page = container.querySelector(".workspace-page");

    await waitFor(() => {
      expect(page).toHaveAttribute("data-tabs-collapsed", "true");
    });

    await user.click(screen.getByRole("button", { name: /expand tabs sidebar/i }));
    expect(page).toHaveAttribute("data-tabs-collapsed", "false");

    const backdrop = container.querySelector(".workspace-tabs-backdrop");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);

    await waitFor(() => {
      expect(page).toHaveAttribute("data-tabs-collapsed", "true");
    });

    await user.click(screen.getByRole("button", { name: /expand tabs sidebar/i }));
    expect(page).toHaveAttribute("data-tabs-collapsed", "false");

    await user.click(screen.getByRole("button", { name: /new tab/i }));
    expect(screen.getByRole("dialog", { name: /new tab/i })).toBeInTheDocument();
    fireEvent.click(container.querySelector(".workspace-new-tab-dialog-backdrop") as Element);
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /new tab/i })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /new tab/i }));
    await user.click(screen.getByRole("button", { name: /^paste$/i }));

    await waitFor(() => {
      expect(screen.getByText("Mobile pasted tab", { selector: ".workspace-header-title" })).toBeInTheDocument();
      expect(page).toHaveAttribute("data-tabs-collapsed", "true");
    });

    await user.click(screen.getByRole("button", { name: /expand tabs sidebar/i }));
    expect(screen.getByRole("tab", { name: /mobile pasted tab/i })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: /first tab/i }));

    await waitFor(() => {
      expect(screen.getByText("First tab", { selector: ".workspace-header-title" })).toBeInTheDocument();
      expect(page).toHaveAttribute("data-tabs-collapsed", "true");
    });
  });

  it("restores persisted workspace tabs from browser storage", async () => {
    window.localStorage.setItem(
      workspaceTabsStorageKey,
      JSON.stringify({
        version: 1,
        activeTabId: "tab-beta",
        tabs: [
          {
            createdAt: 1,
            id: "tab-alpha",
            markdown: "# Persisted alpha",
            sourceInput: "",
            updatedAt: 1
          },
          {
            createdAt: 2,
            id: "tab-beta",
            markdown: "# Persisted beta",
            sourceInput: "https://example.com/beta.md",
            updatedAt: 2
          }
        ]
      })
    );

    render(<WorkspaceShell markdown="# Starter" sourceInput="" />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /persisted beta/i })).toHaveAttribute("aria-selected", "true");
    });

    expect(screen.getByRole("tab", { name: /persisted alpha/i })).toBeInTheDocument();
    expect(screen.getAllByText("example.com")).toHaveLength(2);
    expect(
      within(screen.getByTestId("preview-panel")).getByRole("heading", {
        level: 1,
        name: "Persisted beta"
      })
    ).toBeInTheDocument();
  });

  it("persists open workspace tabs before the page is hidden", async () => {
    const user = userEvent.setup();
    const readText = vi.fn().mockResolvedValue("");

    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { readText }
    });

    render(<WorkspaceShell markdown="# First draft" sourceInput="" />);

    await user.click(screen.getByRole("button", { name: /new tab/i }));
    await user.click(within(screen.getByRole("dialog", { name: /new tab/i })).getByRole("button", { name: /paste/i }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /untitled document/i })).toHaveAttribute("aria-selected", "true");
    });
    expect(await screen.findByText(/clipboard is empty/i)).toBeInTheDocument();

    window.dispatchEvent(new Event("pagehide"));

    const storedTabs = JSON.parse(window.localStorage.getItem(workspaceTabsStorageKey) ?? "{}");

    expect(storedTabs.activeTabId).toEqual(expect.stringMatching(/^workspace-tab-/));
    expect(storedTabs.tabs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          markdown: "# First draft",
          sourceInput: ""
        }),
        expect.objectContaining({
          markdown: "",
          sourceInput: ""
        })
      ])
    );
  });

  it("lets the user resize editor and preview panes in split mode", async () => {
    window.localStorage.removeItem("markdownviewer.workspace.split");

    render(<WorkspaceShell markdown="# Resize me" sourceInput="" />);

    const grid = screen.getByTestId("workspace-grid");
    const resizer = screen.getByRole("separator", { name: /resize editor and preview panes/i });

    Object.defineProperty(grid, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({
          top: 0,
          bottom: 600,
          left: 100,
          right: 1100,
          width: 1000,
          height: 600,
          x: 100,
          y: 0,
          toJSON: () => ({})
        }) satisfies DOMRect
    });

    expect(grid.style.getPropertyValue("--workspace-editor-fr")).toBe("50fr");
    expect(grid.style.getPropertyValue("--workspace-preview-fr")).toBe("50fr");

    fireEvent.pointerDown(resizer, {
      clientX: 500,
      pointerId: 1
    });

    await waitFor(() => {
      expect(grid).toHaveAttribute("data-resizing", "true");
    });

    fireEvent.pointerMove(window, {
      clientX: 780
    });

    await waitFor(() => {
      expect(grid.style.getPropertyValue("--workspace-editor-fr")).toBe("68fr");
      expect(grid.style.getPropertyValue("--workspace-preview-fr")).toBe("32fr");
      expect(resizer).toHaveAttribute("aria-valuenow", "68");
    });

    fireEvent.keyDown(resizer, {
      key: "ArrowLeft"
    });

    expect(grid.style.getPropertyValue("--workspace-editor-fr")).toBe("64fr");
    expect(grid.style.getPropertyValue("--workspace-preview-fr")).toBe("36fr");

    fireEvent.pointerUp(window);

    await waitFor(() => {
      expect(grid).toHaveAttribute("data-resizing", "false");
    });

    window.localStorage.removeItem("markdownviewer.workspace.split");
  });

  it("lets the reader adjust preview font and size from the preview header", async () => {
    window.localStorage.removeItem("markdownviewer.workspace.preview.font");
    window.localStorage.removeItem("markdownviewer.workspace.preview.fontSize");
    window.localStorage.removeItem("markdownviewer.workspace.preview.margin.v3");
    const user = userEvent.setup();

    render(<WorkspaceShell markdown="# Typography\n\nReadable preview text." sourceInput="" />);

    const previewPanel = screen.getByTestId("preview-panel");
    const previewRegion = screen.getByTestId("preview-scroll-region");
    const fontButton = within(previewPanel).getByRole("button", { name: /^preview font$/i });

    await user.click(fontButton);
    await user.click(screen.getByRole("menuitemradio", { name: /^serif/i }));
    await user.click(within(previewPanel).getByRole("button", { name: /increase preview font size/i }));
    await user.click(within(previewPanel).getByRole("button", { name: /increase preview font size/i }));
    expect(previewRegion).toHaveStyle({
      "--workspace-preview-inline-margin": "25%"
    });

    await user.click(within(previewPanel).getByRole("button", { name: /decrease preview margin/i }));

    expect(previewRegion).toHaveStyle({
      "--workspace-preview-font-family": "Georgia, 'Times New Roman', serif",
      "--workspace-preview-font-size": "17px",
      "--workspace-preview-inline-margin": "22%"
    });
    expect(window.localStorage.getItem("markdownviewer.workspace.preview.font")).toBe("serif");
    expect(window.localStorage.getItem("markdownviewer.workspace.preview.fontSize")).toBe("17");
    expect(window.localStorage.getItem("markdownviewer.workspace.preview.margin.v3")).toBe("6");
  });

  it("moves editor formatting tools into an overflow menu when the pane is narrow", async () => {
    const previousResizeObserver = globalThis.ResizeObserver;

    Object.defineProperty(globalThis, "ResizeObserver", {
      configurable: true,
      value: undefined
    });

    try {
      render(<WorkspaceShell markdown="# Narrow toolbar" sourceInput="" />);

      const toolbar = screen.getByRole("toolbar", { name: /markdown formatting/i });

      Object.defineProperty(toolbar, "clientWidth", {
        configurable: true,
        value: 178
      });

      fireEvent(window, new Event("resize"));

      const overflowButton = await screen.findByRole("button", { name: /more formatting tools/i });

      expect(screen.queryByRole("button", { name: /code/i })).not.toBeInTheDocument();

      fireEvent.click(overflowButton);

      const menu = screen.getByRole("menu", { name: /more formatting tools/i });

      expect(within(menu).getByRole("menuitem", { name: /code/i })).toBeInTheDocument();
      expect(within(menu).getByRole("menuitem", { name: /table/i })).toBeInTheDocument();
      expect(within(menu).getByRole("menuitem", { name: /image/i })).toBeInTheDocument();
    } finally {
      Object.defineProperty(globalThis, "ResizeObserver", {
        configurable: true,
        value: previousResizeObserver
      });
    }
  });

  it("synchronizes raw editor scroll positions with the preview pane", async () => {
    const user = userEvent.setup();

    render(
      <WorkspaceShell
        markdown={"# Title\n\n" + Array.from({ length: 120 }, (_, index) => `- item ${index}`).join("\n")}
        sourceInput=""
      />
    );

    await user.click(screen.getByRole("button", { name: /raw/i }));

    const editor = screen.getByLabelText(/markdown editor/i) as HTMLTextAreaElement;
    const preview = screen.getByTestId("preview-scroll-region") as HTMLDivElement;

    Object.defineProperties(editor, {
      clientHeight: { configurable: true, value: 300 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, value: 0, writable: true }
    });

    Object.defineProperties(preview, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1600 },
      scrollTop: { configurable: true, value: 0, writable: true }
    });

    editor.scrollTop = 300;
    fireEvent.scroll(editor);
    await waitFor(() => {
      expect(preview.scrollTop).toBe(600);
    });

    preview.scrollTop = 900;
    fireEvent.scroll(preview);
    await waitFor(() => {
      expect(editor.scrollTop).toBe(450);
    });
  });

  it("synchronizes rich editor scroll positions with the preview pane", async () => {
    render(
      <WorkspaceShell
        markdown={"# Title\n\n" + Array.from({ length: 120 }, (_, index) => `- item ${index}`).join("\n")}
        sourceInput=""
      />
    );

    const richEditor = screen.getByTestId("editor-rich-surface");
    const preview = screen.getByTestId("preview-scroll-region") as HTMLDivElement;

    await waitForRichEditorReady(richEditor);

    Object.defineProperties(richEditor, {
      clientHeight: { configurable: true, value: 300 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, value: 0, writable: true }
    });

    Object.defineProperties(preview, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1600 },
      scrollTop: { configurable: true, value: 0, writable: true }
    });

    richEditor.scrollTop = 300;
    fireEvent.scroll(richEditor);
    await waitFor(() => {
      expect(preview.scrollTop).toBe(600);
    });

    preview.scrollTop = 900;
    fireEvent.scroll(preview);
    await waitFor(() => {
      expect(richEditor.scrollTop).toBe(450);
    });
  });

  it("does not sync the preview when arrow-key navigation nudges the editor scroll", async () => {
    render(
      <WorkspaceShell
        markdown={"# Title\n\n" + Array.from({ length: 120 }, (_, index) => `- item ${index}`).join("\n")}
        sourceInput=""
      />
    );

    const richEditor = screen.getByTestId("editor-rich-surface");
    const preview = screen.getByTestId("preview-scroll-region") as HTMLDivElement;

    await waitForRichEditorReady(richEditor);

    Object.defineProperties(richEditor, {
      clientHeight: { configurable: true, value: 300 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, value: 0, writable: true }
    });

    Object.defineProperties(preview, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1600 },
      scrollTop: { configurable: true, value: 0, writable: true }
    });

    fireEvent.keyDown(richEditor, {
      bubbles: true,
      code: "ArrowDown",
      key: "ArrowDown"
    });

    richEditor.scrollTop = 300;
    fireEvent.scroll(richEditor);

    expect(preview.scrollTop).toBe(0);
  });

  it("keeps rich editor arrow navigation from scrolling the outer page", async () => {
    render(
      <WorkspaceShell
        markdown={"# Title\n\n" + Array.from({ length: 120 }, (_, index) => `- item ${index}`).join("\n")}
        sourceInput=""
      />
    );

    const richEditor = screen.getByTestId("editor-rich-surface");

    await waitForRichEditorReady(richEditor);

    let scrollX = 0;
    let scrollY = 320;
    let restoreScroll: FrameRequestCallback | undefined;
    const scrollTo = vi.fn((nextX: number, nextY: number) => {
      scrollX = nextX;
      scrollY = nextY;
    });
    const windowKeydown = vi.fn();
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      restoreScroll = callback;
      return 1;
    });
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    Object.defineProperties(window, {
      scrollX: { configurable: true, get: () => scrollX },
      scrollY: { configurable: true, get: () => scrollY },
      scrollTo: { configurable: true, value: scrollTo }
    });
    window.addEventListener("keydown", windowKeydown);

    try {
      fireEvent.keyDown(richEditor, {
        bubbles: true,
        code: "ArrowDown",
        key: "ArrowDown"
      });
      scrollY = 760;
      restoreScroll?.(0);

      expect(windowKeydown).not.toHaveBeenCalled();
      expect(scrollTo).toHaveBeenCalledWith(0, 320);
      expect(scrollY).toBe(320);
      expect(document.documentElement.style.scrollBehavior).toBe("");
    } finally {
      window.removeEventListener("keydown", windowKeydown);
      requestAnimationFrame.mockRestore();
      cancelAnimationFrame.mockRestore();
    }
  });

  it("does not sync the preview when rich editor keyboard navigation does not scroll the editor", async () => {
    const markdown = "# Title\n\n" + Array.from({ length: 120 }, (_, index) => `- item ${index}`).join("\n");

    render(<WorkspaceShell markdown={markdown} sourceInput="" />);

    const richEditor = screen.getByTestId("editor-rich-surface");
    const preview = screen.getByTestId("preview-scroll-region") as HTMLDivElement;

    await waitForRichEditorReady(richEditor);

    Object.defineProperties(richEditor, {
      clientHeight: { configurable: true, value: 300 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, value: 0, writable: true }
    });

    Object.defineProperties(preview, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1600 },
      scrollTop: { configurable: true, value: 180, writable: true }
    });

    let navigationFrame: FrameRequestCallback | undefined;
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      navigationFrame = callback;
      return 1;
    });
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    try {
      fireEvent.keyDown(richEditor, {
        bubbles: true,
        code: "ArrowDown",
        key: "ArrowDown"
      });

      const editor = getStackeditEditor(richEditor);
      const itemStart = markdown.indexOf("- item 119");

      richEditor.focus();
      editor.selectionMgr.setSelectionStartEnd(itemStart, itemStart);
      navigationFrame?.(0);

      expect(preview.scrollTop).toBe(180);
    } finally {
      requestAnimationFrame.mockRestore();
      cancelAnimationFrame.mockRestore();
    }
  });

  it("syncs the preview to the caret block after rich editor keyboard navigation scrolls the editor", async () => {
    const markdown = "# Title\n\n" + Array.from({ length: 120 }, (_, index) => `- item ${index}`).join("\n");

    render(<WorkspaceShell markdown={markdown} sourceInput="" />);

    const richEditor = screen.getByTestId("editor-rich-surface");
    const preview = screen.getByTestId("preview-scroll-region") as HTMLDivElement;

    await waitForRichEditorReady(richEditor);

    Object.defineProperties(richEditor, {
      clientHeight: { configurable: true, value: 300 },
      scrollHeight: { configurable: true, value: 900 },
      scrollTop: { configurable: true, value: 0, writable: true }
    });

    Object.defineProperties(preview, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1600 },
      scrollTop: { configurable: true, value: 0, writable: true }
    });

    Object.defineProperty(preview, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({
          top: 100,
          bottom: 500,
          left: 0,
          right: 640,
          width: 640,
          height: 400,
          x: 0,
          y: 100,
          toJSON: () => ({})
        }) satisfies DOMRect
    });

    const lastListItem = within(screen.getByTestId("preview-panel")).getByText("item 119").closest("li");

    expect(lastListItem).not.toBeNull();

    Object.defineProperty(lastListItem as HTMLLIElement, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({
          top: 620,
          bottom: 654,
          left: 0,
          right: 620,
          width: 620,
          height: 34,
          x: 0,
          y: 620,
          toJSON: () => ({})
        }) satisfies DOMRect
    });

    let navigationFrame: FrameRequestCallback | undefined;
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      navigationFrame = callback;
      return 1;
    });
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    try {
      fireEvent.keyDown(richEditor, {
        bubbles: true,
        code: "ArrowDown",
        key: "ArrowDown"
      });

      const editor = getStackeditEditor(richEditor);
      const itemStart = markdown.indexOf("- item 119");

      richEditor.focus();
      editor.selectionMgr.setSelectionStartEnd(itemStart, itemStart);
      richEditor.scrollTop = 300;
      navigationFrame?.(0);

      expect(preview.scrollTop).toBe(424);
    } finally {
      requestAnimationFrame.mockRestore();
      cancelAnimationFrame.mockRestore();
    }
  });

  it("does not jump the preview when the rich editor selection changes without an editor scroll", async () => {
    render(
      <WorkspaceShell
        markdown={"# Title\n\n" + Array.from({ length: 120 }, (_, index) => `- item ${index}`).join("\n")}
        sourceInput=""
      />
    );

    const richEditor = screen.getByTestId("editor-rich-surface");
    const preview = screen.getByTestId("preview-scroll-region") as HTMLDivElement;

    await waitForRichEditorReady(richEditor);

    Object.defineProperties(preview, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1600 },
      scrollTop: { configurable: true, value: 180, writable: true }
    });

    const editor = getStackeditEditor(richEditor);
    editor.selectionMgr.setSelectionStartEnd(editor.getContent().length - 20, editor.getContent().length - 20);
    document.dispatchEvent(new Event("selectionchange"));

    expect(preview.scrollTop).toBe(180);
  });

  it("resyncs the preview to the active markdown block after rich editor line edits", async () => {
    render(
      <WorkspaceShell
        markdown={"# Title\n\n" + Array.from({ length: 120 }, (_, index) => `- item ${index}`).join("\n")}
        sourceInput=""
      />
    );

    const richEditor = screen.getByTestId("editor-rich-surface");
    const preview = screen.getByTestId("preview-scroll-region") as HTMLDivElement;

    await waitForRichEditorReady(richEditor);

    Object.defineProperties(preview, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1600 },
      scrollTop: { configurable: true, value: 0, writable: true }
    });

    Object.defineProperty(preview, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({
          top: 100,
          bottom: 500,
          left: 0,
          right: 640,
          width: 640,
          height: 400,
          x: 0,
          y: 100,
          toJSON: () => ({})
        }) satisfies DOMRect
    });

    const lastListItem = within(screen.getByTestId("preview-panel")).getByText("item 119").closest("li");

    expect(lastListItem).not.toBeNull();

    Object.defineProperty(lastListItem as HTMLLIElement, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({
          top: 620,
          bottom: 654,
          left: 0,
          right: 620,
          width: 620,
          height: 34,
          x: 0,
          y: 620,
          toJSON: () => ({})
        }) satisfies DOMRect
    });

    const editor = getStackeditEditor(richEditor);
    editor.selectionMgr.setSelectionStartEnd(editor.getContent().length - 1, editor.getContent().length - 1);
    editor.replace(editor.getContent().length - 1, editor.getContent().length - 1, "\n");

    await waitFor(() => {
      expect(preview.scrollTop).toBe(424);
    });
  });

  it("imports markdown from a url and lets the reader pick from the template palette", async () => {
    const user = userEvent.setup();
    const loadSource = vi.fn().mockResolvedValue({
      markdown: "# Imported from URL",
      label: "Remote source"
    });
    const createObjectURL = vi.fn(() => "blob:download");
    const revokeObjectURL = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const print = vi.fn();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL
    });
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    Object.defineProperty(window, "print", {
      configurable: true,
      value: print
    });

    render(
      <WorkspaceShell
        loadSource={loadSource}
        markdown=""
        sourceInput=""
      />
    );

    expect(screen.queryByLabelText(/markdown source url/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^url$/i }));

    fireEvent.change(screen.getByLabelText(/markdown source url/i), {
      target: { value: "https://example.com/readme.md" }
    });
    await user.click(screen.getByRole("button", { name: /^open$/i }));

    await waitFor(() => {
      expect(
        within(screen.getByTestId("preview-panel")).getByRole("heading", {
          level: 1,
          name: "Imported from URL"
        })
      ).toBeInTheDocument();
    });

    expect(loadSource).toHaveBeenCalledWith("https://example.com/readme.md");

    await user.click(screen.getByRole("button", { name: /template: paper/i }));
    const themePalette = screen.getByRole("menu", { name: /template palette/i });

    expect(within(themePalette).getAllByRole("menuitemradio")).toHaveLength(10);
    expect(document.querySelector(".workspace-menu-backdrop")).not.toBeNull();
    fireEvent.click(document.querySelector(".workspace-menu-backdrop") as Element);
    expect(screen.queryByRole("menu", { name: /template palette/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /template: paper/i }));

    await user.click(within(screen.getByRole("menu", { name: /template palette/i })).getByRole("menuitemradio", { name: /graphite/i }));
    expect(document.documentElement.dataset.theme).toBe("graphite");
    expect(screen.getByRole("button", { name: /template: graphite/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /more/i }));
    expect(within(screen.getByRole("menu")).queryByRole("button", { name: /template:/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /export html/i }));
    expect(createObjectURL).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /more/i }));
    await user.click(screen.getByRole("button", { name: /export pdf/i }));
    expect(print).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /share link/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/\/share\/md-/));
    });

    const generatedShareLink = screen.getByRole("link", { name: /open generated share link/i });
    expect(generatedShareLink).toHaveAttribute("href", expect.stringMatching(/\/share\/md-/));
    expect(screen.getByText(/share link ready/i)).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: /share link/i })).toBeInTheDocument();
    fireEvent.click(document.querySelector(".workspace-share-backdrop") as Element);
    expect(screen.queryByRole("dialog", { name: /share link/i })).not.toBeInTheDocument();
  });

  it("loads a dropped file and switches between preview and editor modes", async () => {
    const user = userEvent.setup();

    render(<WorkspaceShell markdown="# Draft" sourceInput="" />);

    const input = screen.getByLabelText(/upload markdown file/i) as HTMLInputElement;
    const file = new File(["# Uploaded file"], "note.md", { type: "text/markdown" });

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        within(screen.getByTestId("preview-panel")).getByRole("heading", {
          level: 1,
          name: "Uploaded file"
        })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /^preview$/i }));
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("source-panel")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /editor/i }));
    expect(screen.getByTestId("source-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("preview-panel")).not.toBeInTheDocument();
  });

  it("shows the generated share link when clipboard writing stalls", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => new Promise<void>(() => undefined));
    const execCommand = vi.fn(() => true);

    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand
    });

    render(<WorkspaceShell markdown="# Share fallback\n\nReadable document." sourceInput="" />);

    await user.click(screen.getByRole("button", { name: /share link/i }));

    const generatedShareLink = await screen.findByRole("link", { name: /open generated share link/i });

    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/\/share\/md-/));
    await waitFor(() => {
      expect(execCommand).toHaveBeenCalledWith("copy");
    });
    expect(generatedShareLink).toHaveAttribute("href", expect.stringMatching(/\/share\/md-/));
    expect(screen.getByText(/share link ready/i)).toBeInTheDocument();
  });

  it("opens a dragged Markdown file as a new workspace tab", async () => {
    const { container } = render(<WorkspaceShell markdown="# Existing draft" sourceInput="" />);
    const page = container.querySelector(".workspace-page");
    const file = new File(["# Dragged file"], "dragged.md", { type: "text/markdown" });

    expect(page).not.toBeNull();

    fireEvent.dragOver(page as Element, {
      dataTransfer: {
        dropEffect: "copy",
        files: [file],
        types: ["Files"]
      }
    });

    expect(page).toHaveAttribute("data-file-drag-active", "true");

    fireEvent.drop(page as Element, {
      dataTransfer: {
        files: [file],
        types: ["Files"]
      }
    });

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /dragged file/i })).toHaveAttribute("aria-selected", "true");
    });
    expect(screen.getByRole("tab", { name: /existing draft/i })).toBeInTheDocument();
    expect(page).toHaveAttribute("data-file-drag-active", "false");
  });

  it("converts a supported document and opens the Markdown in a new workspace tab", async () => {
    const user = userEvent.setup();
    mockedConvertDocumentToMarkdown.mockResolvedValue({
      markdown: "# Converted Brief\n\nGenerated from DOCX.",
      label: "Converted document",
      sourceName: "brief.docx"
    });

    render(<WorkspaceShell markdown="# Existing draft" sourceInput="" />);

    await user.upload(
      screen.getByLabelText(/convert document to markdown/i),
      new File(["demo"], "brief.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      })
    );

    expect(mockedConvertDocumentToMarkdown).toHaveBeenCalledWith(expect.any(File));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /converted brief/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    await waitFor(() => {
      expect(
        within(screen.getByTestId("preview-panel")).getByRole("heading", { name: "Converted Brief" })
      ).toBeInTheDocument();
    });
    expect(screen.getAllByText("brief.docx").length).toBeGreaterThan(0);
    expect(screen.getByText("Converted brief.docx to Markdown.")).toBeInTheDocument();
  });

  it("persists converted document tabs in browser workspace storage", async () => {
    const user = userEvent.setup();
    mockedConvertDocumentToMarkdown.mockResolvedValue({
      markdown: "# Converted Persisted",
      label: "Converted document",
      sourceName: "persisted.pdf"
    });

    render(<WorkspaceShell markdown="" sourceInput="" />);

    await user.upload(
      screen.getByLabelText(/convert document to markdown/i),
      new File(["demo"], "persisted.pdf", { type: "application/pdf" })
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /converted persisted/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    window.dispatchEvent(new Event("pagehide"));

    const stored = JSON.parse(window.localStorage.getItem(workspaceTabsStorageKey) ?? "{}");
    expect(stored.tabs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          markdown: "# Converted Persisted",
          sourceInput: "converted:persisted.pdf",
          sourceKind: "converted-file"
        })
      ])
    );
  });

  it("reports conversion errors without replacing the active Markdown document", async () => {
    const user = userEvent.setup();
    mockedConvertDocumentToMarkdown.mockRejectedValue(new Error("This file is too large to convert."));

    render(<WorkspaceShell markdown="# Existing draft" sourceInput="" />);

    await user.upload(
      screen.getByLabelText(/convert document to markdown/i),
      new File(["demo"], "huge.pdf", { type: "application/pdf" })
    );

    expect(await screen.findByText("This file is too large to convert.")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("preview-panel")).getByRole("heading", { name: "Existing draft" })
    ).toBeInTheDocument();
  });

  it("opens a file handed off from the homepage import action", async () => {
    window.history.pushState(null, "", "/workspace?import=file");
    window.localStorage.setItem(
      pendingWorkspaceImportKey,
      JSON.stringify({
        markdown: "# Homepage file\n\nOpened from the landing page.",
        sourceInput: "file:homepage.md",
        statusMessage: "Loaded homepage.md."
      })
    );

    try {
      render(<WorkspaceShell markdown="# Starter" sourceInput="" />);

      await waitFor(() => {
        expect(
          within(screen.getByTestId("preview-panel")).getByRole("heading", {
            level: 1,
            name: "Homepage file"
          })
        ).toBeInTheDocument();
      });

      expect(screen.getByRole("tab", { name: /homepage file/i })).toHaveAttribute("aria-selected", "true");
      expect(window.localStorage.getItem(pendingWorkspaceImportKey)).toBeNull();
    } finally {
      window.history.pushState(null, "", "/");
      window.localStorage.removeItem(pendingWorkspaceImportKey);
    }
  });

  it("opens markdown files passed to the installed PWA launch queue as workspace tabs", async () => {
    let launchConsumer:
      | ((launchParams: { files?: Array<{ getFile: () => Promise<File> }> }) => void)
      | undefined;
    const setConsumer = vi.fn((consumer) => {
      launchConsumer = consumer;
    });

    Object.defineProperty(window, "launchQueue", {
      configurable: true,
      value: { setConsumer }
    });

    try {
      render(<WorkspaceShell markdown="# Starter" sourceInput="" />);

      expect(setConsumer).toHaveBeenCalledTimes(1);

      launchConsumer?.({
        files: [
          {
            getFile: () => Promise.resolve(new File(["# System file"], "system.md", { type: "text/markdown" }))
          },
          {
            getFile: () => Promise.resolve(new File(["# Follow-up file"], "follow-up.md", { type: "text/markdown" }))
          }
        ]
      });

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /system file/i })).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          within(screen.getByTestId("preview-panel")).getByRole("heading", {
            level: 1,
            name: "Follow-up file"
          })
        ).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /follow-up file/i })).toHaveAttribute("aria-selected", "true");
      });
    } finally {
      Object.defineProperty(window, "launchQueue", {
        configurable: true,
        value: undefined
      });
    }
  });

  it("handles rich-mode backspace and delete as single-character markdown edits", async () => {
    render(<WorkspaceShell markdown={"ab\ncd"} sourceInput="" />);

    const richEditor = screen.getByTestId("editor-rich-surface");

    await waitForRichEditorReady(richEditor);
    const editor = getStackeditEditor(richEditor);

    editor.replace(1, 2, "");

    await waitFor(() => {
      expect(editor.getContent()).toBe("a\ncd\n");
    });

    editor.replace(1, 2, "");

    await waitFor(() => {
      expect(editor.getContent()).toBe("acd\n");
      expect(serializeRichEditorSurface(richEditor)).toContain("acd");
    });
  });

  it("keeps the stackedit surface editable inside React strict mode", async () => {
    render(
      <StrictMode>
        <WorkspaceShell markdown="# Strict draft" sourceInput="" />
      </StrictMode>
    );

    const richEditor = screen.getByTestId("editor-rich-surface");

    await waitForRichEditorReady(richEditor);

    const editor = getStackeditEditor(richEditor);
    editor.replace(0, editor.getContent().length, "# Strictly updated\n");

    await waitFor(() => {
      expect(editor.getContent()).toContain("# Strictly updated\n");
      expect(
        within(screen.getByTestId("preview-panel")).getByRole("heading", {
          level: 1,
          name: "Strictly updated"
        })
      ).toBeInTheDocument();
    });
  });

  it("tracks browser selection changes so select-all backspace clears the rich editor", async () => {
    render(<WorkspaceShell markdown="hello world" sourceInput="" />);

    const richEditor = screen.getByTestId("editor-rich-surface");

    await waitForRichEditorReady(richEditor);

    const editor = getStackeditEditor(richEditor);
    richEditor.focus();
    const selection = window.getSelection();
    const range = document.createRange();

    range.selectNodeContents(richEditor);
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));

    fireEvent.keyDown(richEditor, {
      bubbles: true,
      code: "Backspace",
      key: "Backspace",
      keyCode: 8,
      which: 8
    });

    await waitFor(() => {
      expect(editor.getContent()).toBe("\n");
      expect(richEditor.textContent?.trim()).toBe("");
    });
  });

  it("supports undo and redo shortcuts in the rich editor", async () => {
    render(<WorkspaceShell markdown="hello" sourceInput="" />);

    const richEditor = screen.getByTestId("editor-rich-surface");

    await waitForRichEditorReady(richEditor);
    const editor = getStackeditEditor(richEditor);

    editor.replace(editor.getContent().length - 1, editor.getContent().length - 1, " world");

    await waitFor(() => {
      expect(editor.getContent()).toBe("hello world\n");
    });

    fireEvent.keyDown(richEditor, {
      bubbles: true,
      code: "KeyZ",
      ctrlKey: true,
      key: "z",
      keyCode: 90,
      which: 90
    });

    await waitFor(() => {
      expect(editor.getContent()).toBe("hello\n");
    });

    fireEvent.keyDown(richEditor, {
      bubbles: true,
      code: "KeyY",
      ctrlKey: true,
      key: "y",
      keyCode: 89,
      which: 89
    });

    await waitFor(() => {
      expect(editor.getContent()).toBe("hello world\n");
    });
  });

  it("supports common formatting shortcuts in both rich and raw modes", async () => {
    render(<WorkspaceShell markdown="hello world" sourceInput="" />);

    const richEditor = screen.getByTestId("editor-rich-surface");

    await waitForRichEditorReady(richEditor);
    const editor = getStackeditEditor(richEditor);
    editor.selectionMgr.setSelectionStartEnd(0, 5);

    fireEvent.keyDown(richEditor, {
      bubbles: true,
      code: "KeyB",
      ctrlKey: true,
      key: "b",
      keyCode: 66,
      which: 66
    });

    await waitFor(() => {
      expect(editor.getContent()).toBe("**hello** world\n");
    });

    fireEvent.click(screen.getByRole("button", { name: /raw/i }));

    const rawEditor = screen.getByLabelText(/markdown editor/i) as HTMLTextAreaElement;
    const worldStart = rawEditor.value.indexOf("world");

    rawEditor.focus();
    rawEditor.setSelectionRange(worldStart, worldStart + "world".length);

    fireEvent.keyDown(rawEditor, {
      bubbles: true,
      code: "KeyK",
      ctrlKey: true,
      key: "k",
      keyCode: 75,
      which: 75
    });

    await waitFor(() => {
      expect((screen.getByLabelText(/markdown editor/i) as HTMLTextAreaElement).value).toBe("**hello** [world](https://example.com)");
    });
  });

  it("applies toolbar actions in both rich and raw modes while keeping markdown syntax visible in rich mode", async () => {
    const user = userEvent.setup();

    render(<WorkspaceShell markdown="hello world" sourceInput="" />);

    const sourcePanel = screen.getByTestId("source-panel");
    const richEditor = screen.getByTestId("editor-rich-surface");

    await waitForRichEditorReady(richEditor);
    const editor = getStackeditEditor(richEditor);
    editor.selectionMgr.setSelectionStartEnd(0, 5);

    const boldButton = screen.getByRole("button", { name: /bold/i });
    fireEvent.mouseDown(boldButton);
    fireEvent.click(boldButton);

    await waitFor(() => {
      expect(editor.getContent()).toBe("**hello** world\n");
    });

    expect(within(sourcePanel).getAllByText("**", { selector: ".md-token--syntax" })).toHaveLength(2);
    expect(within(sourcePanel).getByText("hello", { selector: ".md-token--strong-text" })).toBeInTheDocument();
    expect(within(screen.getByTestId("preview-panel")).getByText("hello", { selector: "strong" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /raw/i }));
    expect(screen.getByTestId("source-panel")).toHaveAttribute("data-editor-view", "raw");
    expect(screen.queryByTestId("editor-highlight")).not.toBeInTheDocument();

    const rawEditor = screen.getByLabelText(/markdown editor/i) as HTMLTextAreaElement;
    const worldStart = rawEditor.value.indexOf("world");

    rawEditor.focus();
    rawEditor.setSelectionRange(worldStart, worldStart + "world".length);

    await user.click(screen.getByRole("button", { name: /bold/i }));

    expect(screen.getByTestId("source-panel")).toHaveAttribute("data-editor-view", "raw");
    expect((screen.getByLabelText(/markdown editor/i) as HTMLTextAreaElement).value).toBe("**hello** **world**");

    await user.click(screen.getByRole("button", { name: /rich/i }));
    expect(screen.getByTestId("source-panel")).toHaveAttribute("data-editor-view", "rich");
    expect(screen.getByTestId("editor-rich-surface")).toBeInTheDocument();
    expect(screen.queryByTestId("editor-highlight")).not.toBeInTheDocument();
    expect(within(sourcePanel).getByText("world", { selector: ".md-token--strong-text" })).toBeInTheDocument();
  });

  it("renders styled markdown inside the rich editor while keeping punctuation visible", async () => {
    render(<WorkspaceShell markdown={"# Title\n\n**Bold** and *italic*"} sourceInput="" />);

    const sourcePanel = screen.getByTestId("source-panel");

    await waitFor(() => {
      expect(within(sourcePanel).getByText("#", { selector: ".md-token--syntax" })).toBeInTheDocument();
    });

    expect(within(sourcePanel).getByText("#", { selector: ".md-token--syntax" })).toBeInTheDocument();
    expect(within(sourcePanel).getByText("Title", { selector: ".md-token--heading-text" })).toBeInTheDocument();
    expect(within(sourcePanel).getAllByText("**", { selector: ".md-token--syntax" })).toHaveLength(2);
    expect(within(sourcePanel).getByText("Bold", { selector: ".md-token--strong-text" })).toBeInTheDocument();
    expect(within(sourcePanel).getAllByText("*", { selector: ".md-token--syntax" })).toHaveLength(2);
    expect(within(sourcePanel).getByText("italic", { selector: ".md-token--emphasis-text" })).toBeInTheDocument();
  });

  it("shows a mirrored highlight layer over the textarea in rich mode", () => {
    render(<WorkspaceShell markdown="# Title" sourceInput="" />);

    expect(screen.getByTestId("editor-rich-surface")).toBeInTheDocument();
    expect(screen.queryByTestId("editor-highlight")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/markdown editor/i, { selector: "textarea" })).not.toBeInTheDocument();
  });

  it("only renders the hidden navigation control when headings exist", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<WorkspaceShell markdown="Plain copy only" sourceInput="" />);

    expect(screen.queryByRole("button", { name: /contents/i })).not.toBeInTheDocument();

    rerender(<WorkspaceShell markdown={"# Title\n\n## Details"} sourceInput="" />);

    expect(screen.getByRole("button", { name: /contents/i }).closest(".workspace-toc")).not.toBeNull();
    expect(screen.queryByRole("complementary", { name: /contents/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /contents/i }));

    expect(screen.getByRole("complementary", { name: /contents/i })).toBeInTheDocument();
  });

  it("keeps the contents panel open across jumps and lets the user close it explicitly", async () => {
    const user = userEvent.setup();

    render(<WorkspaceShell markdown={"# Title\n\n## Alpha\n\n## Beta"} sourceInput="" />);

    await user.click(screen.getByRole("button", { name: /contents/i }));

    const panel = screen.getByRole("complementary", { name: /contents/i });
    const alphaLink = within(panel).getByRole("button", { name: "Alpha" });

    await user.click(alphaLink);

    expect(screen.getByRole("complementary", { name: /contents/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close contents/i })).toBeInTheDocument();
    expect(alphaLink).toHaveAttribute("aria-current", "location");

    await user.click(screen.getByRole("button", { name: /close contents/i }));
    expect(screen.queryByRole("complementary", { name: /contents/i })).not.toBeInTheDocument();
  });

  it("forwards contents panel wheel scrolling to the preview region", async () => {
    const user = userEvent.setup();

    render(<WorkspaceShell markdown={"# Title\n\n## Alpha\n\n## Beta"} sourceInput="" />);

    const preview = screen.getByTestId("preview-scroll-region") as HTMLDivElement;
    preview.scrollTop = 160;

    await user.click(screen.getByRole("button", { name: /contents/i }));
    fireEvent.wheel(screen.getByRole("complementary", { name: /contents/i }), { deltaY: 120 });

    expect(preview.scrollTop).toBe(280);
  });

  it("scrolls the preview region directly when a contents entry is selected", async () => {
    const user = userEvent.setup();

    render(
      <WorkspaceShell
        markdown={`# Title\n\n${Array.from({ length: 40 }, (_, index) => `Body line ${index + 1}`).join("\n")}\n\n## Beta`}
        sourceInput=""
      />
    );

    const preview = screen.getByTestId("preview-scroll-region") as HTMLDivElement;
    const betaHeading = within(screen.getByTestId("preview-panel")).getByRole("heading", {
      level: 2,
      name: "Beta"
    });
    let previewScrollTop = 140;
    const scrollTo = vi.fn(({ top }: { top: number }) => {
      previewScrollTop = top;
    });

    Object.defineProperties(preview, {
      scrollTop: {
        configurable: true,
        get: () => previewScrollTop,
        set: (value: number) => {
          previewScrollTop = value;
        }
      },
      scrollTo: { configurable: true, value: scrollTo }
    });

    Object.defineProperty(preview, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({
          top: 100,
          bottom: 520,
          left: 0,
          right: 640,
          width: 640,
          height: 420,
          x: 0,
          y: 100,
          toJSON: () => ({})
        }) satisfies DOMRect
    });

    Object.defineProperty(betaHeading, "getBoundingClientRect", {
      configurable: true,
      value: () =>
        ({
          top: 460,
          bottom: 504,
          left: 0,
          right: 620,
          width: 620,
          height: 44,
          x: 0,
          y: 460,
          toJSON: () => ({})
        }) satisfies DOMRect
    });

    await user.click(screen.getByRole("button", { name: /contents/i }));
    previewScrollTop = 140;
    await user.click(within(screen.getByRole("complementary", { name: /contents/i })).getByRole("button", { name: "Beta" }));

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        top: 488,
        behavior: "smooth"
      })
    );
    expect(window.location.hash).toBe("#beta");
  });
});
