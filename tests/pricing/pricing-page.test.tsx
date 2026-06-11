import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PricingPage from "@/app/pricing/page";
import ChinesePricingPage from "@/app/zh-CN/pricing/page";

describe("pricing page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the commercialization signal pricing page", async () => {
    render(await PricingPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { level: 1, name: /growing the free markdown workspace/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Free" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Share Pro" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Converter API" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open workspace/i })).toHaveAttribute("href", "/workspace");
    expect(screen.getByRole("button", { name: /join share pro waitlist/i })).toBeInTheDocument();
  });

  it("renders the localized pricing page", async () => {
    render(await ChinesePricingPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { level: 1, name: /当前先增长免费 markdown 工作区/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /工作区/i })[0]).toHaveAttribute("href", "/zh-CN/workspace");
    expect(screen.getByRole("button", { name: /加入 Share Pro waitlist/i })).toBeInTheDocument();
  });

  it("submits the Share Pro waitlist form without leaving the page", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ emailSent: true, ok: true, storage: "local-file" })
    });
    Object.defineProperty(window, "fetch", {
      configurable: true,
      value: fetchMock
    });

    render(await PricingPage({ searchParams: Promise.resolve({}) }));

    await user.type(screen.getAllByLabelText(/email/i)[0], "reader@example.com");
    await user.click(screen.getByRole("button", { name: /join share pro waitlist/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/waitlist",
      expect.objectContaining({
        body: expect.stringContaining("reader@example.com"),
        method: "POST"
      })
    );
    expect(await screen.findByText(/confirmation email sent/i)).toBeInTheDocument();
  });

  it("shows confirmed waitlist state after clicking the email link", async () => {
    render(await PricingPage({ searchParams: Promise.resolve({ waitlist: "confirmed" }) }));

    expect(screen.getByRole("status")).toHaveTextContent(/email confirmed/i);
  });
});
