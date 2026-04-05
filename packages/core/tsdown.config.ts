import { defineConfig } from "vite-plus/pack";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/mdx-components.ts",
    "src/embed.ts",
    "src/server.tsx",
    "src/ReslideEmbedClient.tsx",
  ],
  dts: {
    tsgo: true,
  },
  exports: false,
  banner: ({ fileName }) => {
    // Client Component entries need "use client" at the top of the built output.
    // Next.js bundler uses this directive to determine the RSC/Client boundary.
    if (fileName === "ReslideEmbedClient.mjs" || fileName === "embed.mjs") {
      return { js: '"use client";' };
    }
  },
});
