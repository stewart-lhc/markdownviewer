import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const toMarkdown = vi.fn(async () => ({
    value: "---\nauthor: \"python-docx\"\n---\n\n<div style=\"text-align: center\">**公司注销、合作退出及责任承担协议**</div>\n\n正文"
  }));
  const parseOffice = vi.fn(async () => ({
    to: toMarkdown
  }));
  const execFile = vi.fn((_command, _args, _options, callback) => {
    const error = Object.assign(new Error("not found"), { code: "ENOENT" });

    callback(error);
  });

  return { execFile, parseOffice, toMarkdown };
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

    expect(markdown).toBe("# 公司注销、合作退出及责任承担协议\n\n正文");
    expect(mocks.parseOffice).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({
        fileType: "docx"
      })
    );
    expect(mocks.toMarkdown).toHaveBeenCalledWith(
      "md",
      expect.objectContaining({
        includeImages: false,
        renderMetadata: false
      })
    );
  });
});
