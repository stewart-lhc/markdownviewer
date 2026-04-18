import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

describe("WorkspaceShell interactions", () => {
  it("updates the live preview while editing", async () => {
    const user = userEvent.setup();

    render(<WorkspaceShell markdown="# First draft" sourceInput="" />);

    await user.click(screen.getByRole("button", { name: /split/i }));

    const editor = screen.getByLabelText(/markdown editor/i);

    fireEvent.change(editor, { target: { value: "# Updated draft" } });

    expect(screen.getByRole("heading", { level: 1, name: "Updated draft" })).toBeInTheDocument();
  });

  it("imports markdown from a url and exports html", async () => {
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
        markdown="# First draft"
        sourceInput=""
      />
    );

    await user.click(screen.getByRole("button", { name: /split/i }));

    fireEvent.change(screen.getByLabelText(/markdown source url/i), {
      target: { value: "https://example.com/readme.md" }
    });
    await user.click(screen.getByRole("button", { name: /parse url/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Imported from URL" })).toBeInTheDocument();
    });

    expect(loadSource).toHaveBeenCalledWith("https://example.com/readme.md");

    await user.click(screen.getByRole("button", { name: /export html/i }));

    expect(createObjectURL).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /export pdf/i }));

    expect(print).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /share link/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });
  });

  it("loads a dropped file and switches layout mode", async () => {
    const user = userEvent.setup();

    render(<WorkspaceShell markdown="# Draft" sourceInput="" />);

    expect(screen.queryByTestId("source-panel")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /editor/i }));

    const input = screen.getByLabelText(/upload markdown file/i) as HTMLInputElement;
    const file = new File(["# Uploaded file"], "note.md", { type: "text/markdown" });

    await user.upload(input, file);

    await user.click(screen.getByRole("button", { name: /split/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Uploaded file" })).toBeInTheDocument();
    });

    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
    expect(screen.getByTestId("source-panel")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /preview/i }));

    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("source-panel")).not.toBeInTheDocument();
  });
});
