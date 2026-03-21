import { defineConfig } from "vite-plus/pack";

export default defineConfig({
  entry: ["src/index.ts", "src/mdx-components.ts"],
  dts: {
    tsgo: true,
  },
  exports: false,
});
