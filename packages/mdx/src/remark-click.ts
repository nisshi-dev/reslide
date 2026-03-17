import type { Root, RootContent } from "mdast";

/**
 * Remark plugin that converts `::click` directives (from remark-directive)
 * into `<Click>` MDX JSX components.
 *
 * For leaf directives (`::click`), all subsequent sibling nodes until the
 * next `::click` or `---` are gathered as children of the `<Click>`.
 *
 * For container directives (`::: click ... :::`), children are wrapped directly.
 *
 * Auto-increments the `at` attribute for sequential click steps.
 */
export function remarkClick() {
  return (tree: Root) => {
    processNode(tree);
  };
}

function isClickDirective(node: RootContent): boolean {
  return (
    (node.type === "leafDirective" || node.type === "containerDirective") &&
    "name" in node &&
    node.name === "click"
  );
}

function processNode(node: { children: RootContent[] }) {
  // First, recurse into children that have their own children
  for (const child of node.children) {
    if ("children" in child && Array.isArray(child.children)) {
      processNode(child as { children: RootContent[] });
    }
  }

  // Then process this node's direct children for ::click directives
  const newChildren: RootContent[] = [];
  let stepCounter = 0;
  let i = 0;

  while (i < node.children.length) {
    const child = node.children[i];

    if (!isClickDirective(child)) {
      newChildren.push(child);
      i++;
      continue;
    }

    stepCounter++;

    if (child.type === "containerDirective") {
      // Container directive: wrap existing children
      newChildren.push({
        type: "mdxJsxFlowElement",
        name: "Click",
        attributes: [createAtAttribute(stepCounter)],
        children: "children" in child ? (child.children as RootContent[]) : [],
      } as unknown as RootContent);
      i++;
      continue;
    }

    // Leaf directive: gather subsequent siblings until next ::click or ---
    const gathered: RootContent[] = [];
    i++;
    while (i < node.children.length) {
      const sibling = node.children[i];
      if (isClickDirective(sibling)) break;
      if (sibling.type === "thematicBreak") break;
      gathered.push(sibling);
      i++;
    }

    newChildren.push({
      type: "mdxJsxFlowElement",
      name: "Click",
      attributes: [createAtAttribute(stepCounter)],
      children: gathered,
    } as unknown as RootContent);
  }

  node.children = newChildren;
}

function createAtAttribute(step: number) {
  return {
    type: "mdxJsxAttribute",
    name: "at",
    value: {
      type: "mdxJsxAttributeValueExpression",
      value: String(step),
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExpressionStatement",
              expression: {
                type: "Literal",
                value: step,
                raw: String(step),
              },
            },
          ],
        },
      },
    },
  };
}
