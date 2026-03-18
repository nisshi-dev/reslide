import { compile } from "@mdx-js/mdx";
import rehypeShiki from "@shikijs/rehype";
import { transformerNotationHighlight } from "@shikijs/transformers";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";

import { remarkClick } from "./remark-click.js";
import { remarkMark } from "./remark-mark.js";
import { remarkSlides } from "./remark-slides.js";

export interface CompileResult {
  /** Compiled JavaScript code string (ESM) */
  code: string;
  /** Extracted metadata from frontmatter */
  metadata: SlideMetadata;
}

export interface SlideMetadata {
  title?: string;
  description?: string;
  createdAt?: string;
  layout?: string;
  transition?: string;
  slideCount: number;
  [key: string]: unknown;
}

/**
 * Parse frontmatter from MDX source without compiling.
 * Useful for extracting metadata in listing pages.
 */
export function parseSlideMetadata(source: string): SlideMetadata {
  const fm = parseFrontmatter(source);
  const slideCount = countSlides(source);
  return {
    ...fm,
    slideCount,
  };
}

/**
 * Compile MDX slides source to JavaScript code.
 * The returned code can be evaluated on the client with `ReslideEmbed`.
 *
 * Usage (server side):
 * ```ts
 * import { compileMdxSlides } from '@reslide/mdx/compile'
 * const { code, metadata } = await compileMdxSlides(mdxSource)
 * ```
 */
export async function compileMdxSlides(
  source: string,
  options?: {
    remarkPlugins?: unknown[];
    rehypePlugins?: unknown[];
  },
): Promise<CompileResult> {
  const metadata = parseSlideMetadata(source);

  const result = await compile(source, {
    outputFormat: "function-body",
    remarkPlugins: [
      remarkDirective,
      [remarkFrontmatter, ["yaml"]],
      remarkMath,
      remarkSlides,
      remarkClick,
      remarkMark,
      ...((options?.remarkPlugins ?? []) as never[]),
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
      ...((options?.rehypePlugins ?? []) as never[]),
    ],
    providerImportSource: undefined,
  });

  return {
    code: String(result),
    metadata,
  };
}

function parseFrontmatter(source: string): Record<string, string> {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w[\w-]*):\s*(.+)$/);
    if (m) result[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return result;
}

function countSlides(source: string): number {
  const body = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const parts = body.split(/\n---\n/);
  return Math.max(1, parts.filter((p) => p.trim().length > 0).length);
}
