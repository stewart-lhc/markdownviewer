import { render, screen } from "@testing-library/react";
import WorkspacePage from "@/app/workspace/page";
import ChineseWorkspacePage from "@/app/zh-CN/workspace/page";

describe("workspace page", () => {
  it("opens into the split core canvas with minimal controls", async () => {
    const page = await WorkspacePage({
      searchParams: Promise.resolve({})
    });

    render(page);

    expect(screen.getByRole("complementary", { name: /open tabs/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new tab/i })).toBeInTheDocument();
    expect(document.querySelector(".workspace-header-title")).not.toBeInTheDocument();
    expect(screen.getByTestId("workspace-grid")).toHaveAttribute("data-mode", "split");
    expect(screen.getByTestId("source-panel")).toBeInTheDocument();
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /template: paper/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /template: paper/i }).closest(".toolbar")).toBeNull();
    expect(screen.getByRole("button", { name: /template: paper/i }).closest(".workspace-pane-header--preview")).not.toBeNull();
    expect(screen.getByLabelText(/^preview font$/i).closest(".workspace-pane-header--preview")).not.toBeNull();
    expect(screen.getByRole("button", { name: /increase preview font size/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /increase preview margin/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /more/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /markdownviewer home/i }).closest(".workspace-header-tabs-control")).not.toBeNull();
    expect(screen.getByRole("link", { name: "中" })).toHaveAttribute("href", "/zh-CN/workspace");
    expect(screen.queryByRole("button", { name: /^url$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /contents/i }).closest(".workspace-toc")).not.toBeNull();
    expect(screen.queryByText(/document workspace/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/reader preview/i)).not.toBeInTheDocument();
  });

  it("opens the Chinese workspace with localized controls", async () => {
    const page = await ChineseWorkspacePage({
      searchParams: Promise.resolve({})
    });

    render(page);

    expect(screen.getByRole("complementary", { name: /打开的标签/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /新建标签/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /模板：纸张/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /增大预览留白/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^url$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /markdownviewer 首页/i })).toHaveAttribute("href", "/zh-CN/");
    expect(screen.getByRole("link", { name: "en" })).toHaveAttribute("href", "/workspace");
  });
});
