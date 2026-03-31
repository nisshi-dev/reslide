import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Parser } from "acorn";
import { transform } from "sucrase";
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

function getSucraseTransforms(filePath: string): Array<"typescript" | "jsx"> {
  const transforms: Array<"typescript" | "jsx"> = [];
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    transforms.push("typescript");
  }
  if (filePath.endsWith(".tsx") || filePath.endsWith(".jsx")) {
    transforms.push("jsx");
  }
  return transforms;
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
    // Track names that were inlined so recma plugin can exclude them from props.components
    const inlinedNames: string[] = [];

    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type !== "mdxjsEsm") continue;

      const value = (node as { value?: string }).value;
      if (!value) continue;

      // MDX parser may combine consecutive import lines into a single node.
      // Split into individual lines and process each import separately.
      const lines = value.split("\n");
      const inlinedParts: string[] = [];
      const remainingLines: string[] = [];
      let hasLocalImport = false;

      for (const line of lines) {
        const match = line.match(LOCAL_IMPORT_RE);
        if (!match) {
          remainingLines.push(line);
          continue;
        }

        const importClause = match[1].trim();
        const importPath = match[2];

        // Skip CSS imports — handled by remarkExtractCssImports
        if (CSS_EXT_RE.test(importPath)) {
          remainingLines.push(line);
          continue;
        }

        if (!baseUrl) {
          throw new Error(
            `Cannot resolve local import "${importPath}": no baseUrl provided. ` +
              `Pass baseUrl option to compileMdxSlides().`,
          );
        }

        hasLocalImport = true;

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
            const transforms = getSucraseTransforms(filePath);
            const result = transform(source, {
              transforms,
              jsxRuntime: "automatic",
              production: true,
            });
            compiled.set(filePath, result.code);
          } catch (err) {
            throw new Error(
              `Failed to compile local module "${filePath}": ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }

        const compiledCode = compiled.get(filePath)!;
        const inlined = buildInlineModule(importClause, compiledCode);
        inlinedParts.push(inlined);
        inlinedNames.push(...extractImportedNames(importClause));
      }

      if (!hasLocalImport) continue;

      // Build replacement nodes: remaining non-local lines + inlined code
      const newNodes: typeof tree.children = [];

      if (remainingLines.some((l) => l.trim())) {
        const remaining = remainingLines.join("\n");
        newNodes.push({
          type: "mdxjsEsm",
          value: remaining,
        } as unknown as (typeof tree.children)[0]);
      }

      if (inlinedParts.length > 0) {
        const inlinedCode = inlinedParts.join("\n");
        const estree = Parser.parse(inlinedCode, {
          ecmaVersion: 2022,
          sourceType: "module",
        });
        newNodes.push({
          type: "mdxjsEsm",
          value: inlinedCode,
          data: { estree },
        } as unknown as (typeof tree.children)[0]);
      }

      // Replace the original node with new nodes
      tree.children.splice(i, 1, ...newNodes);
      i += newNodes.length - 1; // Adjust index for inserted nodes
    }

    // Store inlined names for the recma plugin to exclude from props.components
    if (inlinedNames.length > 0) {
      file.data.inlinedComponentNames = inlinedNames;
    }
  };
}

/**
 * Build inlined module code that replaces an import statement.
 *
 * The compiled code is inserted as top-level ESM declarations. We strip
 * `export` keywords so the names become local bindings, and handle
 * default exports via a `__default` variable. Import aliases are
 * resolved with const assignments.
 */
function buildInlineModule(importClause: string, compiledCode: string): string {
  const code = stripExports(compiledCode);

  const defaultMatch = importClause.match(/^(\w+)$/);
  const namedMatch = importClause.match(/^\{([^}]+)\}$/);
  const mixedNamedMatch = importClause.match(/^(\w+)\s*,\s*\{([^}]+)\}$/);

  if (defaultMatch) {
    // import Foo from "./foo" → inline code + const Foo = __default
    // If the default export is a named function/class with the same name,
    // skip the alias to avoid duplicate declaration.
    const name = defaultMatch[1];
    const hasNamedDefault = new RegExp(`(?:function|class)\\s+${name}\\s*[({]`).test(code);
    if (hasNamedDefault) return code;
    return `${code}\nconst ${name} = __default;`;
  }

  if (namedMatch) {
    // import { A, B as C } from "./mod" → inline code (names are already declared)
    // Handle aliases: need to create const C = B
    const aliases = buildAliases(namedMatch[1]);
    return aliases ? `${code}\n${aliases}` : code;
  }

  if (mixedNamedMatch) {
    const defaultName = mixedNamedMatch[1];
    const aliases = buildAliases(mixedNamedMatch[2]);
    const parts = [code, `const ${defaultName} = __default;`];
    if (aliases) parts.push(aliases);
    return parts.join("\n");
  }

  // Star or other — just inline the code
  return code;
}

/**
 * Extract the local binding names from an import clause.
 * e.g. "{ A, B as C }" → ["A", "C"], "Foo" → ["Foo"], "* as X" → ["X"]
 */
function extractImportedNames(importClause: string): string[] {
  const names: string[] = [];

  const namedMatch = importClause.match(/^\{([^}]+)\}$/);
  const defaultMatch = importClause.match(/^(\w+)$/);
  const starMatch = importClause.match(/^\*\s+as\s+(\w+)$/);
  const mixedNamedMatch = importClause.match(/^(\w+)\s*,\s*\{([^}]+)\}$/);

  if (namedMatch) {
    for (const spec of namedMatch[1].split(",")) {
      const parts = spec.trim().split(/\s+as\s+/);
      names.push((parts[1] ?? parts[0]).trim());
    }
  } else if (defaultMatch) {
    names.push(defaultMatch[1]);
  } else if (starMatch) {
    names.push(starMatch[1]);
  } else if (mixedNamedMatch) {
    names.push(mixedNamedMatch[1]);
    for (const spec of mixedNamedMatch[2].split(",")) {
      const parts = spec.trim().split(/\s+as\s+/);
      names.push((parts[1] ?? parts[0]).trim());
    }
  }

  return names;
}

/**
 * Build const alias assignments for "as" renames in named imports.
 * e.g. "A, B as C" → "const C = B;" (A needs no alias)
 */
function buildAliases(specs: string): string | null {
  const aliases: string[] = [];
  for (const spec of specs.split(",")) {
    const parts = spec.trim().split(/\s+as\s+/);
    if (parts.length === 2) {
      aliases.push(`const ${parts[1].trim()} = ${parts[0].trim()};`);
    }
  }
  return aliases.length > 0 ? aliases.join("\n") : null;
}

/**
 * Strip `export` keywords from compiled ESM code so names become local declarations.
 * Also strip `import` statements for React JSX runtime — these are provided by
 * MDX's `run()` scope, so the inlined code should use the ambient `_jsx` / `_jsxs`
 * / `_Fragment` bindings already in scope from the MDX function body.
 */
function stripExports(code: string): string {
  let result = code;

  // Remove import statements for react/jsx-runtime and react (provided by MDX run() scope)
  result = result.replace(
    /import\s*\{[^}]*\}\s*from\s*["']react(?:\/jsx-(?:dev-)?runtime)?["']\s*;?\n?/g,
    "",
  );
  // Also remove bare react imports: import React from "react"
  result = result.replace(/import\s+\w+\s+from\s*["']react["']\s*;?\n?/g, "");

  // export default function/class Name(...) { ... }
  // → function Name(...) { ... }\nvar __default = Name;
  // We match the full statement to avoid breaking the function signature.
  result = result.replace(/export\s+default\s+(?=function|class)/g, "");
  // Now extract the name from the remaining `function Name` / `class Name` for __default
  const defaultFnMatch = result.match(/^(function|class)\s+(\w+)/m);
  if (defaultFnMatch && !result.includes("var __default")) {
    result += `\nvar __default = ${defaultFnMatch[2]};`;
  }

  // export default <expression> → var __default = <expression>
  result = result.replace(/export\s+default\s+/g, "var __default = ");

  // export function/class/const/let/var → remove export keyword
  result = result.replace(/export\s+(function|class|const|let|var)\s/g, "$1 ");

  // export { ... } → remove entirely
  result = result.replace(/export\s*\{[^}]*\}\s*;?/g, "");

  return result;
}
