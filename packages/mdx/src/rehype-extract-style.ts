import type { Root, RootContent } from "mdast";

interface MdxJsxFlowElement {
  type: "mdxJsxFlowElement";
  name: string | null;
  children?: Array<{ type: string; value?: string }>;
}

interface VFileData {
  data: Record<string, unknown>;
}

/**
 * Remark plugin that extracts `<style>` JSX elements from the MDX AST
 * and stores the concatenated CSS string in `vfile.data.css`.
 *
 * In MDX, `<style>{`...`}</style>` is parsed as an `mdxJsxFlowElement`
 * with `mdxFlowExpression` children containing the CSS as a template literal.
 */
export function rehypeExtractStyle() {
  return (tree: Root, file: VFileData) => {
    const cssChunks: string[] = [];
    extractFromChildren(tree.children, cssChunks);

    if (cssChunks.length > 0) {
      const existing = (file.data.css as string) ?? "";
      file.data.css = existing + cssChunks.join("\n");
    }
  };
}

function extractFromChildren(children: RootContent[], chunks: string[]): void {
  const toRemove: number[] = [];

  for (let i = 0; i < children.length; i++) {
    const node = children[i] as unknown;
    if (isStyleJsxElement(node)) {
      const css = extractCssFromStyleElement(node as MdxJsxFlowElement);
      if (css) chunks.push(css);
      toRemove.push(i);
    } else if (hasChildren(node)) {
      extractFromChildren((node as { children: RootContent[] }).children, chunks);
    }
  }

  // Remove in reverse order to maintain indices
  for (let i = toRemove.length - 1; i >= 0; i--) {
    children.splice(toRemove[i], 1);
  }
}

function isStyleJsxElement(node: unknown): boolean {
  const n = node as MdxJsxFlowElement;
  return n.type === "mdxJsxFlowElement" && n.name === "style";
}

function hasChildren(node: unknown): boolean {
  const n = node as { children?: unknown };
  return Array.isArray(n.children) && n.children.length > 0;
}

function extractCssFromStyleElement(node: MdxJsxFlowElement): string | null {
  if (!node.children) return null;

  const parts: string[] = [];
  for (const child of node.children) {
    if (child.type === "mdxFlowExpression" && child.value) {
      // The value is a JS expression like `` `...css...` ``
      // Extract content from template literal
      const css = extractTemplateLiteral(child.value);
      if (css) parts.push(css);
    } else if (child.type === "text" && child.value) {
      parts.push(child.value);
    }
  }

  return parts.length > 0 ? parts.join("\n") : null;
}

/**
 * Extract string content from a template literal expression.
 * Handles both `` `...` `` and `"..."` / `'...'`.
 */
function extractTemplateLiteral(expr: string): string | null {
  const trimmed = expr.trim();

  // Template literal: `...`
  if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
    return trimmed.slice(1, -1);
  }

  // Double-quoted string
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }

  // Single-quoted string
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }

  return null;
}
