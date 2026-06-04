import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = process.env.PORT || "3030";

function run(command, args, options = {}) {
  return spawn(command, args, {
    shell: process.platform === "win32",
    stdio: "inherit",
    ...options
  });
}

const next = run("npm", ["run", "dev", "--", "-p", port]);

await delay(3500);

const tsc = run("npm", ["run", "desktop:build:main"]);

tsc.on("exit", (code) => {
  if (code !== 0) {
    next.kill();
    process.exit(code ?? 1);
  }

  const electron = run("npx", ["electron", "."], {
    env: {
      ...process.env,
      MARKDOWNVIEWER_NEXT_DEV_URL: `http://127.0.0.1:${port}`
    }
  });

  electron.on("exit", (electronCode) => {
    next.kill();
    process.exit(electronCode ?? 0);
  });
});
