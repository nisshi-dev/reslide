import { defineConfig } from "vite-plus/pack";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    export: "src/export.ts",
    "vite-plugin": "src/vite-plugin.ts",
  },
  external: ["vite", /^@vitejs\//, /^@mdx-js\//, "react", "react-dom", "cac", "remark-directive"],
  dts: {
    tsgo: true,
  },
  exports: true,
});
