import { render, screen } from "@testing-library/react";
import ChangelogPage from "@/app/changelog/page";
import ChineseChangelogPage from "@/app/zh-CN/changelog/page";

describe("changelog page", () => {
  it("lists recent deploy batches with date-based versions", () => {
    render(<ChangelogPage />);

    expect(screen.getByRole("heading", { level: 1, name: /markdownviewer changelog/i })).toBeInTheDocument();
    expect(screen.getByText("26.531")).toBeInTheDocument();
    expect(screen.getByText("26.530")).toBeInTheDocument();
    expect(screen.getByText("26.529")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /workspace/i })).toHaveAttribute("href", "/workspace");
    expect(screen.getByRole("link", { name: "中" })).toHaveAttribute("href", "/zh-CN/changelog");
  });

  it("renders the Chinese changelog route with localized navigation", () => {
    render(<ChineseChangelogPage />);

    expect(screen.getByRole("heading", { level: 1, name: /markdownviewer 更新日志/i })).toBeInTheDocument();
    expect(screen.getByText("26.531")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "en" })).toHaveAttribute("href", "/changelog");
    expect(screen.getByRole("link", { name: /工作区/i })).toHaveAttribute("href", "/zh-CN/workspace");
  });
});
