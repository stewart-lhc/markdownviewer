import { render, screen } from "@testing-library/react";
import WorkspacePage from "@/app/workspace/page";

describe("workspace page", () => {
  it("opens into the split core canvas with minimal controls", async () => {
    const page = await WorkspacePage({
      searchParams: Promise.resolve({})
    });

    render(page);

    expect(screen.getByRole("tablist", { name: /open tabs/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new tab/i })).toBeInTheDocument();
    expect(screen.getByText("Markdown Feature Atlas", { selector: ".workspace-header-title" })).toBeInTheDocument();
    expect(screen.getByTestId("workspace-grid")).toHaveAttribute("data-mode", "split");
    expect(screen.getByTestId("source-panel")).toBeInTheDocument();
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /template: paper/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /template: paper/i }).closest(".toolbar")).toBeNull();
    expect(screen.getByRole("button", { name: /template: paper/i }).closest(".workspace-pane-header--preview")).not.toBeNull();
    expect(screen.getByLabelText(/^preview font$/i).closest(".workspace-pane-header--preview")).not.toBeNull();
    expect(screen.getByRole("button", { name: /increase preview font size/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /more/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /markdownviewer home/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^url$/i }).closest(".toolbar")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: /contents/i }).closest(".workspace-pane-header--preview")
    ).not.toBeNull();
    expect(screen.queryByText(/document workspace/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/reader preview/i)).not.toBeInTheDocument();
  });
});
