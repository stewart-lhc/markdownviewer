import { describe, expect, it, vi } from "vitest";
import {
  convertDocumentToMarkdown,
  convertedDocumentAccept,
  isConvertibleDocumentFile,
  maxConvertedDocumentBytes
} from "@/lib/workspace/convert-document";

describe("convert-document helper", () => {
  it("recognizes supported conversion files without treating Markdown as convertible", () => {
    expect(convertedDocumentAccept).toContain(".docx");
    expect(isConvertibleDocumentFile(new File(["demo"], "brief.DOCX"))).toBe(true);
    expect(isConvertibleDocumentFile(new File(["demo"], "slides.pptx"))).toBe(true);
    expect(isConvertibleDocumentFile(new File(["demo"], "table.xls"))).toBe(true);
    expect(isConvertibleDocumentFile(new File(["demo"], "report.pdf"))).toBe(true);
    expect(isConvertibleDocumentFile(new File(["# Demo"], "readme.md"))).toBe(false);
    expect(isConvertibleDocumentFile(new File(["demo"], "image.png"))).toBe(false);
  });

  it("posts supported files to the convert api and returns Markdown", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        markdown: "# Converted",
        label: "Converted document",
        sourceName: "brief.docx"
      })
    });

    const result = await convertDocumentToMarkdown(
      new File(["demo"], "brief.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }),
      fetcher
    );

    expect(fetcher).toHaveBeenCalledWith(
      "/api/convert",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData)
      })
    );
    expect(result).toEqual({
      markdown: "# Converted",
      label: "Converted document",
      sourceName: "brief.docx"
    });
  });

  it("rejects unsupported and oversized files before posting", async () => {
    const fetcher = vi.fn();

    await expect(
      convertDocumentToMarkdown(new File(["demo"], "image.png"), fetcher)
    ).rejects.toThrow("This file type is not supported for Markdown conversion.");

    const oversizedFile = new File(["demo"], "huge.pdf");
    Object.defineProperty(oversizedFile, "size", {
      configurable: true,
      value: maxConvertedDocumentBytes + 1
    });

    await expect(convertDocumentToMarkdown(oversizedFile, fetcher)).rejects.toThrow(
      "This file is too large to convert."
    );
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("surfaces api errors and empty conversion payloads", async () => {
    await expect(
      convertDocumentToMarkdown(
        new File(["demo"], "brief.docx"),
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ error: "Conversion timed out. Try a smaller or simpler file." })
        })
      )
    ).rejects.toThrow("Conversion timed out. Try a smaller or simpler file.");

    await expect(
      convertDocumentToMarkdown(
        new File(["demo"], "brief.docx"),
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ markdown: "", label: "Converted document", sourceName: "brief.docx" })
        })
      )
    ).rejects.toThrow("The converted Markdown was empty.");
  });
});
