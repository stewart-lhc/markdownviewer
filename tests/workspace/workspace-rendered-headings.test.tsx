import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/markdown/extract-headings", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/markdown/extract-headings")>();

  return {
    ...actual,
    extractHeadings: vi.fn(() => [])
  };
});

import { WorkspaceShell } from "@/components/workspace/workspace-shell";

describe("WorkspaceShell rendered heading fallback", () => {
  it("keeps the floating contents trigger when rendered preview headings exist", async () => {
    render(<WorkspaceShell markdown={"# Rendered Title\n\n## Rendered Details"} mode="preview" sourceInput="" />);

    const preview = screen.getByTestId("preview-panel");

    expect(within(preview).getByRole("heading", { level: 1, name: "Rendered Title" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /contents/i }).closest(".workspace-toc")).not.toBeNull();
    });
  });
});
