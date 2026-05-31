import { render, screen } from "@testing-library/react";
import SharePage from "@/app/share/[id]/page";
import ChineseSharePage from "@/app/zh-CN/share/[id]/page";
import { encodeMarkdownShare } from "@/lib/share/share-codec";

describe("share page", () => {
  it("renders a seeded public document", async () => {
    const page = await SharePage({
      params: Promise.resolve({ id: "starter-doc" })
    });

    render(page);

    expect(screen.getByRole("heading", { level: 1, name: /markdown feature atlas/i })).toBeInTheDocument();
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
