import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const parseOffice = vi.fn(async () => ({
    to: vi.fn(async () => ({ value: "# Converted DOCX" }))
  }));
  const execFile = vi.fn((_command, _args, _options, callback) => {
    const error = Object.assign(new Error("not found"), { code: "ENOENT" });

    callback(error);
  });

  return { execFile, parseOffice };
});

vi.mock("node:child_process", () => ({
  default: {
    execFile: mocks.execFile
  },
  execFile: mocks.execFile
}));

vi.mock("officeparser", () => ({
  OfficeParser: {
    parseOffice: mocks.parseOffice
  }
}));

const { convertFileWithMarkItDown } = await import("@/lib/server/markitdown-runner");

function testFile(contents: string, name: string, type: string) {
  const bytes = Buffer.from(contents, "utf8");

  return {
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    name,
    type
  } as File;
}

describe("markitdown runner file type hints", () => {
  it("passes a DOCX file type hint when falling back to officeparser", async () => {
    const markdown = await convertFileWithMarkItDown(
      testFile("fake docx bytes", "brief.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    );

    expect(markdown).toBe("# Converted DOCX");
    expect(mocks.parseOffice).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({
        fileType: "docx"
      })
    );
  });
});
