import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { SiteThemeSwitcher } from "@/components/landing/site-theme-switcher";

const storageKey = "markdownviewer.site.colorMode";

afterEach(() => {
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.siteThemeMode;
});

describe("SiteThemeSwitcher", () => {
  it("applies light, dark, and system site modes", async () => {
    const user = userEvent.setup();

    render(<SiteThemeSwitcher locale="en" />);

    expect(screen.getByRole("group", { name: /color mode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /system/i })).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.siteThemeMode).toBe("system");

    await user.click(screen.getByRole("button", { name: /dark/i }));

    expect(document.documentElement.dataset.theme).toBe("night");
    expect(document.documentElement.dataset.siteThemeMode).toBe("dark");
    expect(window.localStorage.getItem(storageKey)).toBe("dark");
    expect(screen.getByRole("button", { name: /dark/i })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /light/i }));

    expect(document.documentElement.dataset.theme).toBe("paper");
    expect(document.documentElement.dataset.siteThemeMode).toBe("light");
    expect(window.localStorage.getItem(storageKey)).toBe("light");

    await user.click(screen.getByRole("button", { name: /system/i }));

    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(document.documentElement.dataset.siteThemeMode).toBe("system");
    expect(window.localStorage.getItem(storageKey)).toBe("system");
  });

  it("restores a saved mode on mount", () => {
    window.localStorage.setItem(storageKey, "dark");

    render(<SiteThemeSwitcher locale="zh-CN" />);

    expect(screen.getByRole("group", { name: /颜色模式/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /暗色/i })).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.theme).toBe("night");
    expect(document.documentElement.dataset.siteThemeMode).toBe("dark");
  });
});
