import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import { transformerNotationHighlight } from "@shikijs/transformers";
import { remarkClick, remarkMark, remarkSlides } from "@reslide-dev/mdx";
import react from "@vitejs/plugin-react";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [
    react(),
    mdx({
      remarkPlugins: [
        remarkDirective,
        remarkGfm,
        [remarkFrontmatter, ["yaml"]],
        remarkMath,
        remarkSlides,
        remarkClick,
        remarkMark,
      ],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypeShiki,
          {
            theme: "github-dark",
            transformers: [transformerNotationHighlight()],
          },
        ],
      ],
    }),
  ],
  server: {
    fs: {
      allow: ["../.."],
    },
  },
});
