import mdx from "@mdx-js/rollup";
import { remarkClick, remarkDirectiveFallback, remarkMark, remarkSlides } from "@reslide-dev/mdx";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { Plugin } from "vite";

export interface ReslidePluginOptions {
  /** Additional remark plugins */
  remarkPlugins?: unknown[];
  /** Additional rehype plugins */
  rehypePlugins?: unknown[];
  /** Enable Mermaid diagram rendering via CDN */
  mermaid?: boolean;
}

/**
 * Vite plugin for reslide presentations.
 * Sets up MDX processing with reslide's remark plugins.
 */
export function reslide(options: ReslidePluginOptions = {}): Plugin[] {
  const { remarkPlugins = [], rehypePlugins = [], mermaid = false } = options;

  const plugins: Plugin[] = [
    mdx({
      remarkPlugins: [
        remarkDirective,
        remarkGfm,
        [remarkFrontmatter, ["yaml"]],
        remarkMath,
        remarkSlides,
        remarkClick,
        remarkMark,
        remarkDirectiveFallback,
        ...(remarkPlugins as never[]),
      ],
      rehypePlugins: rehypePlugins as never[],
      providerImportSource: undefined,
    }) as unknown as Plugin,
    {
      name: "reslide:inject-react",
      config() {
        return {
          optimizeDeps: {
            include: ["react", "react-dom", "@reslide-dev/core"],
          },
        };
      },
    },
  ];

  if (mermaid) {
    plugins.push({
      name: "reslide:mermaid",
      transformIndexHtml() {
        return [
          {
            tag: "script",
            attrs: { type: "module" },
            children: `
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: false, theme: 'default' });
const observer = new MutationObserver(() => {
  document.querySelectorAll('pre code.language-mermaid').forEach(async (el) => {
    if (el.dataset.mermaidRendered) return;
    el.dataset.mermaidRendered = 'true';
    const container = el.closest('pre');
    const { svg } = await mermaid.render('mermaid-' + Math.random().toString(36).slice(2), el.textContent);
    if (container) container.outerHTML = '<div class="reslide-mermaid">' + svg + '</div>';
  });
});
observer.observe(document.body, { childList: true, subtree: true });
`,
          },
        ];
      },
    });
  }

  return plugins;
}
