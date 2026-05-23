import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("D:/GitHub/markdownviewer/app/globals.css", "utf8");

describe("mermaid diagram styles", () => {
  it("keeps rendered diagrams responsive without forcing them to fill the card", () => {
    const svgRuleMatch = css.match(/\.mermaid-svg svg \{([\s\S]*?)\}/);

    expect(svgRuleMatch).not.toBeNull();
    expect(svgRuleMatch?.[1]).toContain("max-width: 100%;");
    expect(svgRuleMatch?.[1]).not.toContain("min-width: 100%;");
  });
});
