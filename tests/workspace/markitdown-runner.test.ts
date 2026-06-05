import { describe, expect, it } from "vitest";
import { convertFileWithMarkItDown } from "@/lib/server/markitdown-runner";

function testFile(contents: string, name: string, type: string) {
  const bytes = Buffer.from(contents, "utf8");

  return {
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    name,
    type
  } as File;
}

describe("markitdown runner", () => {
  it("falls back to a serverless Node converter when the markitdown CLI is unavailable", async () => {
    const markdown = await convertFileWithMarkItDown(
      testFile("name,value\nalpha,1\n", "smoke.csv", "text/csv")
    );

    expect(markdown).toContain("| name | value |");
    expect(markdown).toContain("| alpha | 1 |");
  });

  it("converts structured JSON text into Markdown without a system CLI", async () => {
    const markdown = await convertFileWithMarkItDown(
      testFile(JSON.stringify({ name: "alpha", value: 1 }), "smoke.json", "application/json")
    );

    expect(markdown).toContain("# smoke.json");
    expect(markdown).toContain("```json");
    expect(markdown).toContain('"name": "alpha"');
  });
});
