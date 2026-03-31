import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Root } from "mdast";

const CSS_IMPORT_RE = /import\s+["'](.+\.css)["']/;

/**
 * Remark plugin that detects CSS file imports (e.g. `import "./styles.css"`),
 * reads the file contents, stores them in `vfile.data.css`, and removes the
 * import declaration from the AST (since the MDX runtime cannot resolve CSS files).
 */
interface VFileData {
  data: Record<string, unknown>;
}

export function remarkExtractCssImports(options?: { baseUrl?: string }) {
  return (tree: Root, file: VFileData) => {
    const baseUrl = options?.baseUrl ?? (file.data.baseUrl as string | undefined);
    const cssChunks: string[] = [];

    tree.children = tree.children.filter((node) => {
      if (node.type !== "mdxjsEsm") return true;

      const match = (node as { value?: string }).value?.match(CSS_IMPORT_RE);
      if (!match) return true;

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
        throw new Error(`CSS file not found: "${filePath}" (imported as "${importPath}" from MDX)`);
      }

      return false; // remove from AST
    });

    if (cssChunks.length > 0) {
      const existing = (file.data.css as string) ?? "";
      file.data.css = existing + cssChunks.join("\n");
    }
  };
}
