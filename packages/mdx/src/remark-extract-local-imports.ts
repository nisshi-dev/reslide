import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";
import type { Root } from "mdast";

/**
 * Regex to match local relative imports (with or without extension).
 * Captures: [1] = full import clause, [2] = import path
 *
 * Examples:
 *   import { FeatureCard } from "./components/feature-card"
 *   import { FeatureCard } from "./components/feature-card.tsx"
 *   import TimelineItem from "./timeline-item"
 *   import * as utils from "./lib/utils.ts"
 *
 * Excludes CSS imports (handled by remarkExtractCssImports).
 */
const LOCAL_IMPORT_RE = /^import\s+(.+)\s+from\s+["'](\.[^"']+?)["']/;

interface VFileData {
  data: Record<string, unknown>;
}

/** Extensions handled by remarkExtractCssImports — skip here. */
const CSS_EXT_RE = /\.css$/;

/** Extensions that indicate a TS/JS module. */
const MODULE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"] as const;

function getLoader(filePath: string): "tsx" | "ts" | "jsx" | "js" {
  if (filePath.endsWith(".tsx")) return "tsx";
  if (filePath.endsWith(".ts")) return "ts";
  if (filePath.endsWith(".jsx")) return "jsx";
  return "js";
}

/**
 * Resolve a module import path to an absolute file path.
 * If the path already has a TS/JS extension, resolve directly.
 * Otherwise try .tsx → .ts → .jsx → .js in order.
 */
function resolveModulePath(importPath: string, baseUrl: string): string {
  if (/\.(?:tsx?|jsx?)$/.test(importPath)) {
    return fileURLToPath(new URL(importPath, baseUrl));
  }
  for (const ext of MODULE_EXTENSIONS) {
    const candidate = fileURLToPath(new URL(importPath + ext, baseUrl));
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    `Local module not found: "${importPath}" (tried ${MODULE_EXTENSIONS.join(", ")})`,
  );
}

/**
 * Remark plugin that detects local TS/JS file imports, compiles them with
 * esbuild, and inlines the compiled code as an IIFE replacing the import
 * statement in the AST.
 *
 * This allows MDX files to import components from the same directory
 * without requiring host-app registration.
 *
 * The pattern mirrors remarkExtractCssImports — files are resolved at
 * compile time so the browser runtime never needs to resolve them.
 */
export function remarkExtractLocalImports(options?: { baseUrl?: string }) {
  return (tree: Root, file: VFileData) => {
    const baseUrl = options?.baseUrl ?? (file.data.baseUrl as string | undefined);
    // Track already-compiled modules to deduplicate identical imports
    const compiled = new Map<string, string>();

    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type !== "mdxjsEsm") continue;

      const value = (node as { value?: string }).value;
      if (!value) continue;

      const match = value.match(LOCAL_IMPORT_RE);
      if (!match) continue;

      const importClause = match[1].trim();
      const importPath = match[2];

      // Skip CSS imports — handled by remarkExtractCssImports
      if (CSS_EXT_RE.test(importPath)) continue;

      if (!baseUrl) {
        throw new Error(
          `Cannot resolve local import "${importPath}": no baseUrl provided. ` +
            `Pass baseUrl option to compileMdxSlides().`,
        );
      }

      // Resolve the file path, trying extensions if omitted
      let filePath: string;
      try {
        filePath = resolveModulePath(importPath, baseUrl);
      } catch {
        throw new Error(`Local module not found: "${importPath}" (imported from MDX)`);
      }

      // Compile only once per resolved file path
      if (!compiled.has(filePath)) {
        let source: string;
        try {
          source = readFileSync(filePath, "utf-8");
        } catch {
          throw new Error(
            `Local module not found: "${filePath}" (imported as "${importPath}" from MDX)`,
          );
        }

        try {
          const result = transformSync(source, {
            loader: getLoader(filePath),
            format: "esm",
            jsx: "automatic",
            target: "es2022",
          });
          compiled.set(filePath, result.code);
        } catch (err) {
          throw new Error(
            `Failed to compile local module "${filePath}": ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      const compiledCode = compiled.get(filePath)!;

      // Build the inline replacement:
      //   const { FeatureCard } = await (async () => { <compiled code>; return { FeatureCard }; })();
      //
      // We need to figure out which names are imported so we can return them.
      // The import clause can be:
      //   - Named:   { A, B as C }
      //   - Default: Foo
      //   - Star:    * as Foo
      const inlined = buildInlineModule(importClause, compiledCode);

      // Replace the ESM import node with the inlined code
      const replacement = node as { value?: string; data?: Record<string, unknown> };
      replacement.value = inlined;
    }
  };
}

/**
 * Build an IIFE that replaces an import statement with inlined compiled code.
 */
function buildInlineModule(importClause: string, compiledCode: string): string {
  // Strip trailing semicolons and whitespace from compiled code
  const code = compiledCode.trimEnd().replace(/;$/, "");

  const defaultMatch = importClause.match(/^(\w+)$/);
  const starMatch = importClause.match(/^\*\s+as\s+(\w+)$/);
  const namedMatch = importClause.match(/^\{([^}]+)\}$/);
  // Mixed: `Default, { Named }` or `Default, * as Star`
  const mixedNamedMatch = importClause.match(/^(\w+)\s*,\s*\{([^}]+)\}$/);
  const mixedStarMatch = importClause.match(/^(\w+)\s*,\s*\*\s+as\s+(\w+)$/);

  if (starMatch) {
    // import * as utils from "./utils"
    // → const utils = await (async () => { ...code...; return { ...exported }; })();
    // We wrap everything and re-export all top-level declarations
    const name = starMatch[1];
    return `const ${name} = await (async () => {\n${code};\nreturn { ${extractExportedNames(compiledCode).join(", ")} };\n})();`;
  }

  if (mixedStarMatch) {
    const defaultName = mixedStarMatch[1];
    const starName = mixedStarMatch[2];
    const exports = extractExportedNames(compiledCode);
    return (
      `const { default: ${defaultName}, ...__rest } = await (async () => {\n${code};\n` +
      `return { ${exports.join(", ")} };\n})();\nconst ${starName} = __rest;`
    );
  }

  if (namedMatch) {
    // import { A, B as C } from "./mod"
    const specs = namedMatch[1];
    const exportNames = parseNamedImports(specs);
    return `const { ${specs} } = await (async () => {\n${code};\nreturn { ${exportNames.join(", ")} };\n})();`;
  }

  if (mixedNamedMatch) {
    const defaultName = mixedNamedMatch[1];
    const specs = mixedNamedMatch[2];
    const exportNames = parseNamedImports(specs);
    return (
      `const { default: ${defaultName}, ${specs} } = await (async () => {\n${code};\n` +
      `return { default: ${findDefaultExport(compiledCode)}, ${exportNames.join(", ")} };\n})();`
    );
  }

  if (defaultMatch) {
    // import Foo from "./foo"
    const name = defaultMatch[1];
    const defaultExpr = findDefaultExport(compiledCode);
    return `const ${name} = await (async () => {\n${code};\nreturn ${defaultExpr};\n})();`;
  }

  // Fallback: treat the whole clause as-is
  return `const ${importClause} = await (async () => {\n${code};\n})();`;
}

/**
 * Parse named import specifiers to get the original export names.
 * e.g. "A, B as C" → ["A", "B"]
 */
function parseNamedImports(specs: string): string[] {
  return specs.split(",").map((s) => {
    const parts = s.trim().split(/\s+as\s+/);
    return parts[0].trim();
  });
}

/**
 * Find the default export expression in compiled ESM code.
 * esbuild compiles `export default X` to various forms.
 */
function findDefaultExport(code: string): string {
  // esbuild with format: "esm" keeps `export default` as-is
  // Match: export default function Foo / export default class Foo
  const namedDefault = code.match(/export\s+default\s+(?:function|class)\s+(\w+)/);
  if (namedDefault) return namedDefault[1];

  // Match: export default <expression>
  // We'll just reference it as the module's default via a wrapper
  // The IIFE needs to capture it — safest approach is to use a variable
  return `__default`;
}

/**
 * Extract exported names from compiled ESM code.
 * Matches: export { name }, export function name, export const name, etc.
 */
function extractExportedNames(code: string): string[] {
  const names = new Set<string>();

  // export function/class name
  for (const m of code.matchAll(/export\s+(?:function|class)\s+(\w+)/g)) {
    names.add(m[1]);
  }
  // export const/let/var name
  for (const m of code.matchAll(/export\s+(?:const|let|var)\s+(\w+)/g)) {
    names.add(m[1]);
  }
  // export { a, b, c }
  for (const m of code.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const spec of m[1].split(",")) {
      const parts = spec.trim().split(/\s+as\s+/);
      const name = (parts[1] ?? parts[0]).trim();
      if (name) names.add(name);
    }
  }
  // export default
  if (/export\s+default\s/.test(code)) {
    names.add("default");
  }

  return [...names];
}
