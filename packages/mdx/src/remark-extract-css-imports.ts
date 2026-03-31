import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Root, RootContent } from "mdast";

const CSS_IMPORT_RE = /^import\s+["'](.+\.css)["']\s*;?\s*$/;

/**
 * Remark plugin that detects CSS file imports (e.g. `import "./styles.css"`),
 * reads the file contents, stores them in `vfile.data.css`, and removes the
 * import declaration from the AST (since the MDX runtime cannot resolve CSS files).
 *
 * Handles combined nodes where MDX parser merges consecutive import lines
 * into a single mdxjsEsm node — only CSS import lines are removed,
 * other import lines are preserved.
 */
interface VFileData {
  data: Record<string, unknown>;
}

export function remarkExtractCssImports(options?: { baseUrl?: string }) {
  return (tree: Root, file: VFileData) => {
    const baseUrl = options?.baseUrl ?? (file.data.baseUrl as string | undefined);
    const cssChunks: string[] = [];

    const newChildren: RootContent[] = [];

    for (const node of tree.children) {
      if (node.type !== "mdxjsEsm") {
        newChildren.push(node);
        continue;
      }

      const value = (node as { value?: string }).value;
      if (!value) {
        newChildren.push(node);
        continue;
      }

      // Split multi-line node into individual lines
      const lines = value.split("\n");
      const remainingLines: string[] = [];
      let hasCssImport = false;

      for (const line of lines) {
        const match = line.match(CSS_IMPORT_RE);
        if (!match) {
          remainingLines.push(line);
          continue;
        }

        hasCssImport = true;
        const importPath = match[1];

        if (!baseUrl) {
          throw new Error(
            `Cannot resolve CSS import "${importPath}": no baseUrl provided. ` +
              `Pass baseUrl option to compileMdxSlides().`,
          );
        }

        const resolvedUrl = new URL(importPath, baseUrl);
        const filePath = fileURLToPath(resolvedUrl);

        try {
          cssChunks.push(readFileSync(filePath, "utf-8"));
        } catch {
          throw new Error(
            `CSS file not found: "${filePath}" (imported as "${importPath}" from MDX)`,
          );
        }
      }

      if (!hasCssImport) {
        // No CSS imports in this node, keep it as-is
        newChildren.push(node);
      } else if (remainingLines.some((l) => l.trim())) {
        // Some non-CSS lines remain — create a new node with just those
        newChildren.push({
          type: "mdxjsEsm",
          value: remainingLines.join("\n"),
        } as unknown as RootContent);
      }
      // If all lines were CSS imports, the node is dropped entirely
    }

    tree.children = newChildren;

    if (cssChunks.length > 0) {
      const existing = (file.data.css as string) ?? "";
      file.data.css = existing + cssChunks.join("\n");
    }
  };
}
