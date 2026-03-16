import type { Root, RootContent } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Remark plugin that converts `:mark[text]{.style}` directives
 * into `<Mark>` MDX JSX components.
 *
 * Supports styles: highlight, underline, circle
 * Supports color via additional class: .orange, .red, .blue, etc.
 *
 * Example: `:mark[important text]{.highlight.orange}`
 * Produces: `<Mark type="highlight" color="orange">important text</Mark>`
 */
export function remarkMark() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (node.type !== "textDirective") return;
      if (node.name !== "mark") return;
      if (index == null || !parent) return;

      const classStr = node.attributes?.class ?? "";
      const classes = classStr.split(/\s+/).filter(Boolean);

      const markTypes = ["highlight", "underline", "circle"];
      let type = "highlight";
      let color: string | undefined;

      for (const cls of classes) {
        if (markTypes.includes(cls)) {
          type = cls;
        } else if (cls) {
          color = cls;
        }
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
