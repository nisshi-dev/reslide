import type { Heading, Root, RootContent, Text, Yaml } from "mdast";

interface SlideOptions {
  layout?: string;
  class?: string;
  [key: string]: unknown;
}

function parseYamlString(value: string): SlideOptions {
  const options: SlideOptions = {};
  for (const line of value.split("\n")) {
    const match = line.match(/^(\w[\w-]*):\s*(.+)$/);
    if (match) {
      options[match[1]] = match[2].trim();
    }
  }
  return options;
}

/**
 * Try to extract frontmatter-like options from a slide section's first nodes.
 *
 * Two patterns are recognized:
 * 1. `yaml` node (first slide, parsed by remark-frontmatter)
 * 2. Setext heading created by remark when `---\nkey: val\n---` appears
 *    after a thematicBreak separator
 */
function tryExtractOptionsFromNodes(
  nodes: RootContent[],
): { options: SlideOptions; contentStart: number } | null {
  if (nodes[0]?.type === "yaml") {
    return {
      options: parseYamlString((nodes[0] as Yaml).value),
      contentStart: 1,
    };
  }

  if (nodes[0]?.type === "heading") {
    const heading = nodes[0] as Heading;
    if (heading.children.length === 1 && heading.children[0]?.type === "text") {
      const text = (heading.children[0] as Text).value;
      const lines = text.split("\n");
      const isYamlLike = lines.every((line) => /^(\w[\w-]*):\s*.+$/.test(line.trim()));

      if (isYamlLike) {
        return {
          options: parseYamlString(text),
          contentStart: 1,
        };
      }
    }
  }

  return null;
}

interface DirectiveNode {
  type: string;
  name: string;
  children?: RootContent[];
}

/**
 * Remark plugin that splits MDX content at `---` (thematic breaks)
 * into `<Slide>` components wrapped in a `<Deck>`.
 *
 * Requires remark-frontmatter to be added before this plugin in the pipeline.
 * Subsequent slide frontmatters are detected via setext heading pattern.
 */
export function remarkSlides() {
  return (tree: Root) => {
    const slides: RootContent[][] = [];
    let current: RootContent[] = [];

    for (const node of tree.children) {
      if (node.type === "thematicBreak") {
        slides.push(current);
        current = [];
      } else {
        current.push(node);
      }
    }
    slides.push(current);

    const slideElements: RootContent[] = [];

    for (const slideContent of slides) {
      if (slideContent.length === 0) continue;

      const extracted = tryExtractOptionsFromNodes(slideContent);
      const options = extracted?.options ?? {};
      const contentStart = extracted?.contentStart ?? 0;

      const content = slideContent.slice(contentStart);
      if (content.length === 0 && Object.keys(options).length === 0) continue;

      const clickCount = countClickDirectives(content);

      const attrs: Array<{ type: string; name: string; value: unknown }> = [];

      if (options.layout) {
        attrs.push({
          type: "mdxJsxAttribute",
          name: "layout",
          value: options.layout,
        });
      }
      if (options.class) {
        attrs.push({
          type: "mdxJsxAttribute",
          name: "className",
          value: options.class,
        });
      }

      const slideChildren: RootContent[] = [...content];

      if (clickCount > 0) {
        slideChildren.unshift({
          type: "mdxJsxFlowElement",
          name: "ClickSteps",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "count",
              value: {
                type: "mdxJsxAttributeValueExpression",
                value: String(clickCount),
                data: {
                  estree: createNumericExpression(clickCount),
                },
              },
            },
          ],
          children: [],
        } as unknown as RootContent);
      }

      slideElements.push({
        type: "mdxJsxFlowElement",
        name: "Slide",
        attributes: attrs,
        children: slideChildren,
      } as unknown as RootContent);
    }

    tree.children = [
      {
        type: "mdxJsxFlowElement",
        name: "Deck",
        attributes: [],
        children: slideElements,
      } as unknown as RootContent,
    ];
  };
}

function countClickDirectives(nodes: RootContent[]): number {
  let count = 0;
  function walk(node: unknown) {
    const n = node as DirectiveNode;
    if ((n.type === "leafDirective" || n.type === "containerDirective") && n.name === "click") {
      count++;
    }
    if (n.children && Array.isArray(n.children)) {
      for (const child of n.children) {
        walk(child);
      }
    }
  }
  for (const node of nodes) {
    walk(node);
  }
  return count;
}

function createNumericExpression(value: number) {
  return {
    type: "Program",
    sourceType: "module",
    body: [
      {
        type: "ExpressionStatement",
        expression: {
          type: "Literal",
          value,
          raw: String(value),
        },
      },
    ],
  };
}
