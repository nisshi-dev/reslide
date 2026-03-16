import type { Root, RootContent } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Remark plugin that converts `::click` directives (from remark-directive)
 * into `<Click>` MDX JSX components.
 *
 * Supports both leaf (`::click`) and container (`::: click ... :::`) forms.
 * Auto-increments the `at` attribute for sequential click steps.
 */
export function remarkClick() {
  return (tree: Root) => {
    let stepCounter = 0;

    visit(tree, (node, index, parent) => {
      if (node.type !== "leafDirective" && node.type !== "containerDirective") {
        return;
      }

      if (node.name !== "click") return;
      if (index == null || !parent) return;

      stepCounter++;

      const attrs = [
        {
          type: "mdxJsxAttribute",
          name: "at",
          value: {
            type: "mdxJsxAttributeValueExpression",
            value: String(stepCounter),
            data: {
              estree: {
                type: "Program",
                sourceType: "module",
                body: [
                  {
                    type: "ExpressionStatement",
                    expression: {
                      type: "Literal",
                      value: stepCounter,
                      raw: String(stepCounter),
                    },
                  },
                ],
              },
            },
          },
        },
      ];

      if (node.type === "leafDirective") {
        const siblings = parent.children as RootContent[];
        const gathered: RootContent[] = [];
        let i = index + 1;

        while (i < siblings.length) {
          const sibling = siblings[i];
          if (
            (sibling.type === "leafDirective" || sibling.type === "containerDirective") &&
            sibling.name === "click"
          ) {
            break;
          }
          if (sibling.type === "thematicBreak") break;
          gathered.push(siblings[i]);
          i++;
        }

        if (gathered.length > 0) {
          siblings.splice(index + 1, gathered.length);
        }

        (parent.children as RootContent[])[index] = {
          type: "mdxJsxFlowElement",
          name: "Click",
          attributes: attrs,
          children: gathered,
        } as unknown as RootContent;
        return;
      }

      // Container directive
      (parent.children as RootContent[])[index] = {
        type: "mdxJsxFlowElement",
        name: "Click",
        attributes: attrs,
        children: node.children,
      } as unknown as RootContent;
    });
  };
}
