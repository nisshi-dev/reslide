import type { Root, RootContent } from "mdast";
import { visit } from "unist-util-visit";

const MARK_TYPES = ["highlight", "underline", "circle"];

/**
 * Remark plugin that converts mark directives into `<Mark>` MDX JSX components.
 *
 * Supports two syntax forms (both avoid `{}` for MDX compatibility):
 *
 * 1. Type-based directives — the directive name IS the mark type:
 *    `:highlight[text]`  → `<Mark type="highlight">text</Mark>`
 *    `:underline[text]`  → `<Mark type="underline">text</Mark>`
 *    `:circle[text]`     → `<Mark type="circle">text</Mark>`
 *
 * 2. Type + color via hyphen:
 *    `:highlight-yellow[text]` → `<Mark type="highlight" color="yellow">`
 *    `:underline-blue[text]`   → `<Mark type="underline" color="blue">`
 *    `:circle-red[text]`       → `<Mark type="circle" color="red">`
 *
 * 3. Legacy `:mark[text]{.type.color}` syntax (works in non-MDX contexts):
 *    `:mark[important]{.highlight.orange}` → `<Mark type="highlight" color="orange">`
 */
export function remarkMark() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (node.type !== "textDirective") return;
      if (index == null || !parent) return;

      let type: string | undefined;
      let color: string | undefined;

      if (node.name === "mark") {
        // Legacy syntax: :mark[text]{.highlight.yellow}
        const classStr = node.attributes?.class ?? "";
        const classes = classStr.split(/\s+/).filter(Boolean);
        for (const cls of classes) {
          if (MARK_TYPES.includes(cls)) {
            type = cls;
          } else if (cls) {
            color = cls;
          }
        }
        type ??= "highlight";
      } else {
        // New syntax: :highlight[text] or :highlight-yellow[text]
        const parsed = parseDirectiveName(node.name);
        if (!parsed) return;
        type = parsed.type;
        color = parsed.color;
      }

      const attrs: Array<{ type: string; name: string; value: string }> = [
        { type: "mdxJsxAttribute", name: "type", value: type },
      ];

      if (color) {
        attrs.push({ type: "mdxJsxAttribute", name: "color", value: color });
      }

      (parent.children as RootContent[])[index] = {
        type: "mdxJsxTextElement",
        name: "Mark",
        attributes: attrs,
        children: node.children,
      } as unknown as RootContent;
    });
  };
}

function parseDirectiveName(name: string): { type: string; color?: string } | null {
  // Exact match: :highlight, :underline, :circle
  if (MARK_TYPES.includes(name)) {
    return { type: name };
  }

  // Hyphenated: :highlight-yellow, :circle-red
  for (const markType of MARK_TYPES) {
    if (name.startsWith(markType + "-")) {
      const color = name.slice(markType.length + 1);
      if (color) {
        return { type: markType, color };
      }
    }
  }

  return null;
}
