import { extractHeadings } from "@/lib/markdown/extract-headings";

describe("extractHeadings", () => {
  it("builds a nested heading map from markdown using the preview slug behavior", () => {
    expect(
      extractHeadings("# Intro\n\nOverview\n---\n\n## Details\n\n## Details")
    ).toEqual([
      { depth: 1, id: "intro", text: "Intro" },
      { depth: 2, id: "overview", text: "Overview" },
      { depth: 2, id: "details", text: "Details" },
      { depth: 2, id: "details-1", text: "Details" }
    ]);
  });

  it("matches CommonMark headings with up to three leading spaces", () => {
    expect(
      extractHeadings("  # Mobile report\n\n   0. Summary\n   ---\n\n    # Code, not a heading")
    ).toEqual([
      { depth: 1, id: "mobile-report", text: "Mobile report" },
      { depth: 2, id: "0-summary", text: "0. Summary" }
    ]);
  });
});
