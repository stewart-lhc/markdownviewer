import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const runtime = join(root, "desktop-runtime");

await rm(runtime, {
  force: true,
  recursive: true
});
await mkdir(runtime, {
  recursive: true
});

await cp(join(root, ".next", "standalone"), runtime, {
  recursive: true
});
await mkdir(join(runtime, ".next"), {
  recursive: true
});
await cp(join(root, ".next", "static"), join(runtime, ".next", "static"), {
  recursive: true
});
await cp(join(root, "public"), join(runtime, "public"), {
  recursive: true
});

if (process.platform === "win32") {
  await cp(process.execPath, join(runtime, "node.exe"));
}
