import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("homepage", () => {
  it("shows direct actions for file, url, and sample import", () => {
    render(<HomePage />);

    expect(screen.getByRole("button", { name: /drop a file/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open sample/i })).toHaveAttribute(
      "href",
      "/workspace?sample=starter"
    );
    expect(screen.getByRole("button", { name: /open markdown now/i })).toBeInTheDocument();
  });
});
