import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import tsdownConfig from "./tsdown.config.ts";

import { defineConfig } from "vite-plus";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "vite-plus/test": resolve(__dirname, "../../node_modules/vite-plus/dist/test/index.js"),
    },
  },
  pack: tsdownConfig,
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
