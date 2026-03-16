import mdx from "@mdx-js/rollup";
import { remarkClick, remarkMark, remarkSlides } from "@reslide/mdx";
import remarkDirective from "remark-directive";
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
 *
 * For LaTeX math support:
 * ```ts
 * import remarkMath from 'remark-math'
 * import rehypeKatex from 'rehype-katex'
 * reslide({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] })
 * ```
 *
 * For Shiki syntax highlighting:
 * ```ts
 * import rehypePrettyCode from 'rehype-pretty-code'
 * reslide({ rehypePlugins: [[rehypePrettyCode, { theme: 'one-dark-pro' }]] })
 * ```
 */
export function reslide(options: ReslidePluginOptions = {}): Plugin[] {
  const { remarkPlugins = [], rehypePlugins = [], mermaid = false } = options;

  const plugins: Plugin[] = [
    mdx({
      remarkPlugins: [
        remarkDirective,
        remarkSlides,
        remarkClick,
        remarkMark,
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
            include: ["react", "react-dom", "@reslide/core"],
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
