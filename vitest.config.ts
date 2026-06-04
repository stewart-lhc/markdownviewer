import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    exclude: [
      ".codex-temp/**",
      ".codex/**",
      ".next/**",
      "desktop-runtime/**",
      "dist-electron/**",
      "node_modules/**",
      "release/**"
    ],
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 15000,
    hookTimeout: 15000
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  }
});
