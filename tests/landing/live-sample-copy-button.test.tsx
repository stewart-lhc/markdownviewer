import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LiveSampleCopyButton } from "@/components/landing/live-sample-copy-button";

const originalClipboard = Object.getOwnPropertyDescriptor(window.navigator, "clipboard");
const originalExecCommand = Object.getOwnPropertyDescriptor(document, "execCommand");

describe("LiveSampleCopyButton", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();

    if (originalClipboard) {
      Object.defineProperty(window.navigator, "clipboard", originalClipboard);
    } else {
      delete (window.navigator as Navigator & { clipboard?: Clipboard }).clipboard;
    }

    if (originalExecCommand) {
      Object.defineProperty(document, "execCommand", originalExecCommand);
    } else {
      delete (document as Document & { execCommand?: Document["execCommand"] }).execCommand;
    }
  });

  it("falls back when the browser clipboard write stalls", async () => {
    vi.useFakeTimers();

    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn(() => new Promise<void>(() => {}))
      }
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => true)
    });

    render(<LiveSampleCopyButton code="hello" language="ts" />);

    const button = screen.getByRole("button", { name: /copy ts code/i });
    fireEvent.click(button);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(501);
    });

    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(button).toHaveTextContent("Copied");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(button).toHaveTextContent("Copy");
  });
});
