import { defineConfig } from "vite-plus/pack";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    export: "src/export.ts",
    "vite-plugin": "src/vite-plugin.ts",
  },
  dts: {
    tsgo: true,
  },
  exports: true,
});
