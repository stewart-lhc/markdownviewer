import { render } from "@testing-library/react";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

describe("GoogleAnalytics", () => {
  it("does not render analytics scripts without a measurement id", () => {
    const { container } = render(<GoogleAnalytics />);

    expect(container.querySelector("script")).toBeNull();
  });

  it("renders the first-page-load gtag snippet for the measurement id", () => {
    const { container } = render(<GoogleAnalytics measurementId="G-3KLH3ELPBV" />);
    const externalScript = document.querySelector(
      'script[src="https://www.googletagmanager.com/gtag/js?id=G-3KLH3ELPBV"]'
    );
    const inlineScript = container.querySelector("script:not([src])");

    expect(externalScript).toHaveAttribute("async");
    expect(inlineScript?.textContent).toContain("function gtag(){dataLayer.push(arguments);}");
    expect(inlineScript?.textContent).toContain('gtag("config", "G-3KLH3ELPBV");');
  });
});
