import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";

function mockMobileViewport() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes("max-width") || query.includes("pointer: coarse") ? true : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

function mockUserAgent(userAgent: string, platform = "Linux armv8l", maxTouchPoints = 5) {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: userAgent
  });
  Object.defineProperty(window.navigator, "platform", {
    configurable: true,
    value: platform
  });
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    configurable: true,
    value: maxTouchPoints
  });
}

function createBeforeInstallPromptEvent(prompt: () => Promise<void>) {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted"; platform: string }>;
  };

  event.prompt = prompt;
  event.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
  return event;
}

afterEach(() => {
  window.localStorage.clear();
  Reflect.deleteProperty(window, "matchMedia");
  vi.restoreAllMocks();
});

describe("PwaInstallPrompt", () => {
  it("uses the browser install prompt when beforeinstallprompt is available", async () => {
    const user = userEvent.setup();
    const prompt = vi.fn().mockResolvedValue(undefined);

    mockMobileViewport();
    mockUserAgent("Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36");
    render(<PwaInstallPrompt />);

    fireEvent(window, createBeforeInstallPromptEvent(prompt));

    await user.click(await screen.findByRole("button", { name: /^install$/i }));

    expect(prompt).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("complementary", { name: /install markdownviewer/i })).not.toBeInTheDocument();
    });
  });

  it("shows add-to-home-screen instructions when iOS cannot expose a native prompt", async () => {
    const user = userEvent.setup();

    mockMobileViewport();
    mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1", "iPhone");
    render(<PwaInstallPrompt />);

    expect(await screen.findByText(/tap share/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /how to install/i }));

    expect(screen.getByRole("button", { name: /got it/i })).toBeInTheDocument();
  });
});
