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
});
