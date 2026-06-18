import { describe, expect, it } from "vitest";
import {
  defaultDarkWorkspaceTheme,
  defaultLightWorkspaceTheme,
  getWorkspaceThemeColorScheme,
  resolvePreferredWorkspaceTheme,
  workspaceThemeStorageKeys
} from "@/lib/workspace/themes";

describe("workspace theme preference helpers", () => {
  it("classifies reader templates by light and dark color scheme", () => {
    expect(getWorkspaceThemeColorScheme("paper")).toBe("light");
    expect(getWorkspaceThemeColorScheme("primer")).toBe("light");
    expect(getWorkspaceThemeColorScheme("aurora")).toBe("light");
    expect(getWorkspaceThemeColorScheme("night")).toBe("dark");
    expect(getWorkspaceThemeColorScheme("graphite")).toBe("dark");
    expect(getWorkspaceThemeColorScheme("terminal")).toBe("dark");
  });

  it("defaults each system color scheme to its matching template family", () => {
    expect(resolvePreferredWorkspaceTheme({ systemColorScheme: "light" })).toBe(defaultLightWorkspaceTheme);
    expect(resolvePreferredWorkspaceTheme({ systemColorScheme: "dark" })).toBe(defaultDarkWorkspaceTheme);
  });

  it("restores the last template selected for the active system color scheme", () => {
    expect(
      resolvePreferredWorkspaceTheme({
        systemColorScheme: "dark",
        storedDarkTheme: "terminal",
        storedLightTheme: "primer"
      })
    ).toBe("terminal");
    expect(
      resolvePreferredWorkspaceTheme({
        systemColorScheme: "light",
        storedDarkTheme: "terminal",
        storedLightTheme: "primer"
      })
    ).toBe("primer");
  });

  it("uses legacy template storage only for the matching color scheme", () => {
    expect(
      resolvePreferredWorkspaceTheme({
        legacyTheme: "terminal",
        systemColorScheme: "dark"
      })
    ).toBe("terminal");
    expect(
      resolvePreferredWorkspaceTheme({
        legacyTheme: "terminal",
        systemColorScheme: "light"
      })
    ).toBe(defaultLightWorkspaceTheme);
    expect(
      resolvePreferredWorkspaceTheme({
        legacyTheme: "porcelain",
        systemColorScheme: "light"
      })
    ).toBe("porcelain");
    expect(
      resolvePreferredWorkspaceTheme({
        legacyTheme: "porcelain",
        systemColorScheme: "dark"
      })
    ).toBe(defaultDarkWorkspaceTheme);
  });

  it("names dedicated storage slots for light, dark, and legacy template preferences", () => {
    expect(workspaceThemeStorageKeys.light).toBe("markdownviewer.workspace.template.light");
    expect(workspaceThemeStorageKeys.dark).toBe("markdownviewer.workspace.template.dark");
    expect(workspaceThemeStorageKeys.template).toBe("markdownviewer.workspace.template");
    expect(workspaceThemeStorageKeys.theme).toBe("markdownviewer.workspace.theme");
  });
});
