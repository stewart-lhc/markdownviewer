import { render, screen } from "@testing-library/react";
import ChangelogPage from "@/app/changelog/page";
import ChineseChangelogPage from "@/app/zh-CN/changelog/page";

describe("changelog page", () => {
  it("lists recent deploy batches with date-based versions", () => {
    render(<ChangelogPage />);

    expect(screen.getByRole("heading", { level: 1, name: /markdownviewer changelog/i })).toBeInTheDocument();
    expect(screen.getByText("26.619")).toBeInTheDocument();
    expect(screen.getByText(/workspace chrome, reader controls, and mermaid stability/i)).toBeInTheDocument();
    expect(screen.getByText("26.617")).toBeInTheDocument();
    expect(screen.getByText(/share growth, theme polish, screenshots, and mobile navigation/i)).toBeInTheDocument();
    expect(screen.queryByText("26.617.5")).not.toBeInTheDocument();
    expect(screen.queryByText("26.617.4")).not.toBeInTheDocument();
    expect(screen.queryByText("26.617.3")).not.toBeInTheDocument();
    expect(screen.queryByText("26.617.2")).not.toBeInTheDocument();
    expect(screen.getByText("26.612")).toBeInTheDocument();
    expect(screen.getByText("26.611")).toBeInTheDocument();
    expect(screen.getByText("26.531")).toBeInTheDocument();
    expect(screen.getByText("26.530")).toBeInTheDocument();
    expect(screen.getByText("26.529")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /workspace/i })).toHaveAttribute("href", "/workspace");
    expect(screen.getAllByRole("link", { name: "中" }).some((link) => link.getAttribute("href") === "/zh-CN/changelog")).toBe(true);
  });

  it("renders the Chinese changelog route with localized navigation", () => {
    render(<ChineseChangelogPage />);

    expect(screen.getByRole("heading", { level: 1, name: /markdownviewer 更新日志/i })).toBeInTheDocument();
    expect(screen.getByText("26.619")).toBeInTheDocument();
    expect(screen.getByText(/workspace 控制层、阅读控制和 mermaid 稳定性/i)).toBeInTheDocument();
    expect(screen.getByText("26.617")).toBeInTheDocument();
    expect(screen.getByText(/分享增长、主题修复、真实截图和移动端导航/i)).toBeInTheDocument();
    expect(screen.queryByText("26.617.5")).not.toBeInTheDocument();
    expect(screen.queryByText("26.617.4")).not.toBeInTheDocument();
    expect(screen.queryByText("26.617.3")).not.toBeInTheDocument();
    expect(screen.queryByText("26.617.2")).not.toBeInTheDocument();
    expect(screen.getByText("26.612")).toBeInTheDocument();
    expect(screen.getByText("26.611")).toBeInTheDocument();
    expect(screen.getByText("26.531")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "en" }).some((link) => link.getAttribute("href") === "/changelog")).toBe(true);
    expect(screen.getByRole("link", { name: /工作区/i })).toHaveAttribute("href", "/zh-CN/workspace");
  });
});
