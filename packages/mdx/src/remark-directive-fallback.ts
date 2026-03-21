import type { Root, Text } from "mdast";
import { visit } from "unist-util-visit";

interface DirectiveNode {
  type: "textDirective" | "leafDirective";
  name: string;
  children: Array<{ type: string; value?: string }>;
  attributes?: Record<string, string>;
}

function isDirectiveNode(node: unknown): node is DirectiveNode {
  if (typeof node !== "object" || node === null) return false;
  const n = node as { type?: string };
  return n.type === "textDirective" || n.type === "leafDirective";
}

function directiveToText(node: DirectiveNode): string {
  const prefix = node.type === "leafDirective" ? "::" : ":";
  let text = `${prefix}${node.name}`;

  if (node.children.length > 0) {
    const content = node.children.map((c) => c.value ?? "").join("");
    if (content) text += `[${content}]`;
  }

  if (node.attributes && Object.keys(node.attributes).length > 0) {
    const attrs = Object.entries(node.attributes)
      .map(([k, v]) => (v ? `${k}="${v}"` : k))
      .join(" ");
    text += `{${attrs}}`;
  }

  return text;
}

/**
 * Remark plugin that converts remaining (unprocessed) directive nodes
 * back to plain text. This prevents `remark-directive` from eating
 * colon-prefixed patterns like time notations (13:00), port numbers
 * (localhost:3000), or unknown directives.
 *
 * Should be placed **after** `remarkClick` and `remarkMark` in the
 * plugin pipeline so that it only touches leftovers.
 */
export function remarkDirectiveFallback() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (!isDirectiveNode(node)) return;
      if (!parent || typeof index !== "number") return;

      (parent.children as Text[])[index] = {
        type: "text",
        value: directiveToText(node),
      };
    });
  };
}
