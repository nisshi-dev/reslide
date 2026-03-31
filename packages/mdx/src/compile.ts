import { compile } from "@mdx-js/mdx";
import rehypeShiki from "@shikijs/rehype";
import { transformerNotationHighlight } from "@shikijs/transformers";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { rehypeExtractStyle } from "./rehype-extract-style.js";
import { remarkClick } from "./remark-click.js";
import { remarkDirectiveFallback } from "./remark-directive-fallback.js";
import { remarkExtractCssImports } from "./remark-extract-css-imports.js";
import { remarkExtractLocalImports } from "./remark-extract-local-imports.js";
import { remarkMark } from "./remark-mark.js";
import { remarkSlides } from "./remark-slides.js";

export interface CompileResult {
  /** Compiled JavaScript code string (ESM) */
  code: string;
  /** Extracted metadata from frontmatter */
  metadata: SlideMetadata;
  /** Base URL for resolving relative imports in MDX (pass-through from options) */
  baseUrl?: string;
  /** Extracted CSS from <style> tags and CSS file imports */
  css?: string;
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
    /** Base URL for resolving relative imports in the MDX source (e.g. directory URL of the MDX file) */
    baseUrl?: string;
    /** Shiki code highlight theme (default: "github-dark") */
    shikiTheme?: string | { light: string; dark: string };
  },
): Promise<CompileResult> {
  const metadata = parseSlideMetadata(source);

  const result = await compile(source, {
    outputFormat: "function-body",
    remarkPlugins: [
      remarkDirective,
      remarkGfm,
      [remarkFrontmatter, ["yaml"]],
      remarkMath,
      [remarkExtractCssImports, { baseUrl: options?.baseUrl }],
      [remarkExtractLocalImports, { baseUrl: options?.baseUrl }],
      rehypeExtractStyle,
      remarkSlides,
      remarkClick,
      remarkMark,
      remarkDirectiveFallback,
      ...((options?.remarkPlugins ?? []) as never[]),
    ],
    rehypePlugins: [
      rehypeKatex,
      [
        rehypeShiki,
        {
          ...(typeof options?.shikiTheme === "object"
            ? { themes: options.shikiTheme }
            : { theme: options?.shikiTheme ?? "github-dark" }),
          transformers: [transformerNotationHighlight()],
        },
      ],
      ...((options?.rehypePlugins ?? []) as never[]),
    ],
    providerImportSource: undefined,
  });

  const css = result.data.css as string | undefined;

  return {
    code: String(result),
    metadata,
    ...(options?.baseUrl != null && { baseUrl: options.baseUrl }),
    ...(css != null && { css }),
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

/**
 * Returns true if the text consists only of YAML-like `key: value` lines
 * (i.e. slide frontmatter, not actual content).
 */
function isYamlOnly(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  return trimmed.split("\n").every((line) => /^\s*(\w[\w-]*):\s*.+$/.test(line.trim()));
}

function countSlides(source: string): number {
  // Strip leading headmatter (first ---...--- block)
  const body = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const parts = body.split(/\n---\n/);

  let count = 0;
  let i = 0;
  while (i < parts.length) {
    const part = parts[i];
    // If this part is YAML-only, it's a slide separator's frontmatter.
    // The next part (or end) is the actual slide content for that separator.
    if (i > 0 && isYamlOnly(part)) {
      // This YAML block + the preceding --- form one slide boundary.
      // The content after this YAML (next part) is the slide body.
      i++;
      if (i < parts.length && parts[i].trim().length > 0) {
        count++;
      }
    } else if (part.trim().length > 0) {
      count++;
    }
    i++;
  }
  return Math.max(1, count);
}
