import { render, screen } from "@testing-library/react";
import WorkspacePage from "@/app/workspace/page";

describe("workspace page", () => {
  it("shows reading and import regions", async () => {
    const page = await WorkspacePage({
      searchParams: Promise.resolve({})
    });

    render(page);

    expect(screen.getByRole("button", { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("source-panel")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /document outline/i })).toBeInTheDocument();
  });
});
