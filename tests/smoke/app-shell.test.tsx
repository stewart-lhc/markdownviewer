import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("app shell", () => {
  it("shows the primary landing headline", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /open markdown like it deserves/i
      })
    ).toBeInTheDocument();
  });
});
