import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharePage from "@/app/share/[id]/page";
import ChineseSharePage from "@/app/zh-CN/share/[id]/page";
import { encodeMarkdownShare } from "@/lib/share/share-codec";

describe("share page", () => {
  it("renders a seeded public document with the full preview reader controls", async () => {
    const user = userEvent.setup();
    const dataLayer: unknown[] = [];
    const page = await SharePage({
      params: Promise.resolve({ id: "starter-doc" })
    });

    Object.defineProperty(window, "dataLayer", {
      configurable: true,
      value: dataLayer,
      writable: true
    });

    render(page);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "paper");
    });

    expect(screen.getByRole("heading", { level: 1, name: /markdown feature atlas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /markdownviewer home/i })).toHaveAttribute("href", "/");
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /template: paper/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/preview font/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /immersive reading/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /keyboard shortcuts/i })).toHaveAttribute("title", "Keyboard shortcuts (Ctrl+/)");
    expect(screen.getByRole("button", { name: /contents/i })).toBeInTheDocument();
    expect(screen.getByTestId("preview-scroll-region")).toHaveStyle({
      "--workspace-preview-inline-margin": "25%"
    });

    await user.click(screen.getAllByRole("button", { name: /decrease preview margin/i })[0]);

    expect(screen.getByTestId("preview-scroll-region")).toHaveStyle({
      "--workspace-preview-inline-margin": "22%"
    });

    await user.click(screen.getAllByRole("button", { name: /increase preview font size/i })[0]);

    expect(screen.getByTestId("preview-scroll-region")).toHaveStyle({
      "--workspace-preview-font-size": "16px"
    });

    await user.click(screen.getByRole("button", { name: /keyboard shortcuts/i }));

    const shortcutsDialog = screen.getByRole("dialog", { name: /keyboard shortcuts/i });

    expect(within(shortcutsDialog).getByText("Edit a copy")).toBeInTheDocument();
    expect(within(shortcutsDialog).getByText("Use as template")).toBeInTheDocument();
    expect(within(shortcutsDialog).getByText("Ctrl+Alt+E")).toBeInTheDocument();
    expect(within(shortcutsDialog).getByText("Ctrl+Alt+T")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    expect(screen.queryByRole("dialog", { name: /keyboard shortcuts/i })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(dataLayer).toContainEqual({
        event: "share_reader_opened",
        document_title: "Markdown Feature Atlas",
        share_id: "starter-doc"
      });
    });

    dataLayer.length = 0;
    fireEvent.keyDown(window, { key: "e", code: "KeyE" });
    expect(dataLayer).not.toContainEqual({
      event: "share_reader_edit_copy_clicked",
      share_id: "starter-doc",
      source: "share_reader"
    });

    fireEvent.keyDown(window, { key: ">", code: "Period", ctrlKey: true, shiftKey: true });

    expect(screen.getByTestId("preview-scroll-region")).toHaveStyle({
      "--workspace-preview-font-size": "17px"
    });
    expect(screen.getAllByRole("link", { name: /open in workspace/i })[0]).toHaveAttribute(
      "href",
      "/workspace?share=starter-doc&shareAction=open"
    );
    expect(screen.getByRole("link", { name: /edit a copy/i })).toHaveAttribute(
      "href",
      "/workspace?share=starter-doc&shareAction=copy"
    );
    expect(screen.getByRole("link", { name: /use as template/i })).toHaveAttribute(
      "href",
      "/workspace?share=starter-doc&shareAction=template"
    );

    await user.click(screen.getByRole("link", { name: /edit a copy/i }));

    expect(dataLayer).toContainEqual({
      event: "share_reader_edit_copy_clicked",
      share_id: "starter-doc",
      source: "share_reader"
    });

    await user.click(screen.getAllByRole("button", { name: /immersive reading/i })[0]);

    const dialog = screen.getByRole("dialog", { name: /immersive reading/i });

    expect(within(dialog).getByRole("heading", { level: 1, name: /markdown feature atlas/i })).toBeInTheDocument();
    expect(within(dialog).getByTestId("immersive-reader-progress")).toBeInTheDocument();
    expect(within(dialog).queryByRole("link", { name: /open in workspace/i })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /reading settings/i })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /contents/i })).toHaveClass("workspace-toc-trigger");
  });

  it("renders a Chinese shared document shell", async () => {
    const page = await ChineseSharePage({
      params: Promise.resolve({ id: "starter-doc" })
    });

    render(page);

    expect(screen.getAllByRole("link", { name: /在工作区打开/i })[0]).toHaveAttribute(
      "href",
      "/zh-CN/workspace?share=starter-doc&shareAction=open"
    );
    expect(screen.getByRole("link", { name: /编辑副本/i })).toHaveAttribute(
      "href",
      "/zh-CN/workspace?share=starter-doc&shareAction=copy"
    );
    expect(screen.getByRole("link", { name: /作为模板使用/i })).toHaveAttribute(
      "href",
      "/zh-CN/workspace?share=starter-doc&shareAction=template"
    );
  });

  it("renders a generated share link document instead of treating it as a fake id", async () => {
    const id = encodeMarkdownShare("# Shared from workspace\n\nGenerated links should open directly.");
    const page = await SharePage({
      params: Promise.resolve({ id })
    });

    render(page);

    expect(screen.getByRole("heading", { level: 1, name: /shared from workspace/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /open in workspace/i })[0]).toHaveAttribute(
      "href",
      `/workspace?share=${encodeURIComponent(id)}&shareAction=open`
    );
  });
});
