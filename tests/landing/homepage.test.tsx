import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("homepage", () => {
  it("shows direct actions for file, url, and sample import", () => {
    const { container } = render(<HomePage />);

    expect(screen.getByRole("button", { name: /drop a file/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open sample/i })).toHaveAttribute(
      "href",
      "/workspace?sample=starter"
    );
    expect(screen.getByLabelText(/markdown source url/i)).toHaveAttribute("name", "source");
    expect(screen.getByRole("button", { name: /open markdown now/i })).toBeInTheDocument();
    expect(container.querySelector(".hero-preview .markdown-body--compact")).toBeInTheDocument();
  });

  it("renders a formal site footer with company and legal links", () => {
    render(<HomePage />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about us/i })).toHaveAttribute("href", "#about");
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", "#terms");
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "#privacy");
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "#contact");
    expect(screen.getByText(/© 2026 markdownviewer\.run/i)).toBeInTheDocument();
  });
});
