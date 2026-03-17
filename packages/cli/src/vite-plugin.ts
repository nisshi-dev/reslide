import mdx from "@mdx-js/rollup";
import { remarkClick, remarkMark, remarkSlides } from "@reslide/mdx";
import remarkDirective from "remark-directive";
import type { Plugin } from "vite";

export interface ReslidePluginOptions {
  /** Additional remark plugins */
  remarkPlugins?: unknown[];
  /** Additional rehype plugins */
  rehypePlugins?: unknown[];
}

/**
 * Vite plugin for reslide presentations.
 * Sets up MDX processing with reslide's remark plugins.
 *
 * Usage in vite.config.ts:
 * ```ts
 * import { reslide } from '@reslide/cli/vite'
 * export default defineConfig({ plugins: [reslide()] })
 * ```
 */
export function reslide(options: ReslidePluginOptions = {}): Plugin[] {
  const { remarkPlugins = [], rehypePlugins = [] } = options;

  return [
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
}
