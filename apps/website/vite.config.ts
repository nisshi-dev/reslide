import mdx from "@mdx-js/rollup";
import { remarkClick, remarkMark, remarkSlides } from "@reslide-dev/mdx";
import react from "@vitejs/plugin-react";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";

import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [
    react(),
    mdx({
      remarkPlugins: [
        remarkDirective,
        [remarkFrontmatter, ["yaml"]],
        remarkSlides,
        remarkClick,
        remarkMark,
      ],
    }),
  ],
  server: {
    fs: {
      allow: ["../.."],
    },
  },
});
