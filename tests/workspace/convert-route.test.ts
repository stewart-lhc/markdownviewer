import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/convert/route";
import { convertFileWithMarkItDown } from "@/lib/server/markitdown-runner";

vi.mock("@/lib/server/markitdown-runner", () => ({
  convertFileWithMarkItDown: vi.fn()
}));

const mockedConvertFileWithMarkItDown = vi.mocked(convertFileWithMarkItDown);

function createConvertRequest(file: File) {
  const body = new FormData();
  body.append("file", file);

  return {
    formData: async () => body
  } as unknown as Request;
}

describe("convert api route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("converts one supported uploaded document and returns Markdown", async () => {
    mockedConvertFileWithMarkItDown.mockResolvedValue("# Converted DOCX");

    const response = await POST(
      createConvertRequest(
        new File(["demo"], "brief.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        })
      )
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      label: "Converted document",
      markdown: "# Converted DOCX",
      sourceName: "brief.docx"
    });
    expect(mockedConvertFileWithMarkItDown).toHaveBeenCalledWith(expect.any(File));
  });

  it("rejects unsupported, missing, oversized, and empty conversion files", async () => {
    const unsupported = await POST(createConvertRequest(new File(["demo"], "image.png")));
    expect(unsupported.status).toBe(400);
    expect(await unsupported.json()).toEqual({
      error: "This file type is not supported for Markdown conversion."
    });

    const emptyBody = new FormData();
    const missing = await POST(
      {
        formData: async () => emptyBody
      } as unknown as Request
    );
    expect(missing.status).toBe(400);
    expect(await missing.json()).toEqual({ error: "Provide one file to convert." });

    const oversizedFile = new File(["demo"], "huge.pdf");
    Object.defineProperty(oversizedFile, "size", {
      configurable: true,
      value: 20 * 1024 * 1024 + 1
    });
    const oversized = await POST(createConvertRequest(oversizedFile));
    expect(oversized.status).toBe(413);
    expect(await oversized.json()).toEqual({ error: "This file is too large to convert." });

    mockedConvertFileWithMarkItDown.mockResolvedValue("   ");
    const empty = await POST(createConvertRequest(new File(["demo"], "empty.docx")));
    expect(empty.status).toBe(422);
    expect(await empty.json()).toEqual({ error: "The converted Markdown was empty." });
  });

  it("maps runner timeout and unavailable errors to clear statuses", async () => {
    mockedConvertFileWithMarkItDown.mockRejectedValueOnce(
      new Error("Conversion timed out. Try a smaller or simpler file.")
    );
    const timeout = await POST(createConvertRequest(new File(["demo"], "slow.pdf")));
    expect(timeout.status).toBe(504);
    expect(await timeout.json()).toEqual({
      error: "Conversion timed out. Try a smaller or simpler file."
    });

    mockedConvertFileWithMarkItDown.mockRejectedValueOnce(
      new Error("MarkItDown is not available in this deployment.")
    );
    const unavailable = await POST(createConvertRequest(new File(["demo"], "brief.docx")));
    expect(unavailable.status).toBe(500);
    expect(await unavailable.json()).toEqual({
      error: "MarkItDown is not available in this deployment."
    });
  });
});
