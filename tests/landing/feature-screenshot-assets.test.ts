import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

type WebpDimensions = {
  height: number;
  width: number;
};

function readThreeByteInt(buffer: Buffer, offset: number) {
  return buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16);
}

function readWebpDimensions(path: string): WebpDimensions {
  const buffer = readFileSync(path);

  expect(buffer.toString("ascii", 0, 4)).toBe("RIFF");
  expect(buffer.toString("ascii", 8, 12)).toBe("WEBP");

  let offset = 12;

  while (offset < buffer.length) {
    const chunkType = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (chunkType === "VP8X") {
      return {
        width: readThreeByteInt(buffer, dataOffset + 4) + 1,
        height: readThreeByteInt(buffer, dataOffset + 7) + 1
      };
    }

    if (chunkType === "VP8 ") {
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff
      };
    }

    if (chunkType === "VP8L") {
      const b0 = buffer[dataOffset + 1];
      const b1 = buffer[dataOffset + 2];
      const b2 = buffer[dataOffset + 3];
      const b3 = buffer[dataOffset + 4];

      return {
        width: 1 + b0 + ((b1 & 0x3f) << 8),
        height: 1 + ((b1 & 0xc0) >> 6) + (b2 << 2) + ((b3 & 0x0f) << 10)
      };
    }

    offset = dataOffset + chunkSize + (chunkSize % 2);
  }

  throw new Error(`No VP8 image chunk found in ${path}`);
}

describe("feature screenshot assets", () => {
  it("keeps the corrected production screenshots as full-card WebP assets", () => {
    const assets = [
      "D:/GitHub/markdownviewer/public/feature-screenshots/pwa-file-open.webp",
      "D:/GitHub/markdownviewer/public/feature-screenshots/share-export.webp"
    ];

    for (const asset of assets) {
      expect(statSync(asset).size).toBeGreaterThan(12_000);
      expect(readWebpDimensions(asset)).toEqual({ width: 960, height: 540 });
    }
  });
});
