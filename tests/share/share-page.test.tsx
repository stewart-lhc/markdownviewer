import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharePage from "@/app/share/[id]/page";
import ChineseSharePage from "@/app/zh-CN/share/[id]/page";
import { encodeMarkdownShare } from "@/lib/share/share-codec";

describe("share page", () => {
  it("renders a seeded public document with the full preview reader controls", async () => {
    const user = userEvent.setup();
    const page = await SharePage({
      params: Promise.resolve({ id: "starter-doc" })
    });

    render(page);

    expect(screen.getByRole("heading", { level: 1, name: /markdown feature atlas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /markdownviewer home/i })).toHaveAttribute("href", "/");
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /template: paper/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/preview font/i).length).toBeGreaterThan(0);
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
    expect(screen.getByRole("link", { name: /open in workspace/i })).toHaveAttribute(
      "href",
      "/workspace?share=starter-doc"
    );
  });

  it("renders a Chinese shared document shell", async () => {
    const page = await ChineseSharePage({
      params: Promise.resolve({ id: "starter-doc" })
    });

    render(page);

    expect(screen.getByRole("link", { name: /在工作区打开/i })).toHaveAttribute(
      "href",
      "/zh-CN/workspace?share=starter-doc"
    );
  });

  it("renders a generated share link document instead of treating it as a fake id", async () => {
    const id = encodeMarkdownShare("# Shared from workspace\n\nGenerated links should open directly.");
    const page = await SharePage({
      params: Promise.resolve({ id })
    });

    render(page);

    expect(screen.getByRole("heading", { level: 1, name: /shared from workspace/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open in workspace/i })).toHaveAttribute(
      "href",
      `/workspace?share=${encodeURIComponent(id)}`
    );
  });
});
