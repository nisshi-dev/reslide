import { defineConfig } from "vite-plus/pack";

export default defineConfig({
  entry: ["src/index.ts", "src/mdx-components.ts", "src/embed.ts", "src/server.tsx"],
  dts: {
    tsgo: true,
  },
  exports: false,
});
