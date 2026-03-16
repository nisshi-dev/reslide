import type { RootContent as OriginalRootContent } from "mdast";

interface DirectiveFields {
  name: string;
  attributes?: Record<string, string>;
}

interface LeafDirective extends DirectiveFields {
  type: "leafDirective";
  children: OriginalRootContent[];
}

interface ContainerDirective extends DirectiveFields {
  type: "containerDirective";
  children: OriginalRootContent[];
}

interface TextDirective extends DirectiveFields {
  type: "textDirective";
  children: OriginalRootContent[];
}

declare module "mdast" {
  interface RootContentMap {
    leafDirective: LeafDirective;
    containerDirective: ContainerDirective;
  }

  interface PhrasingContentMap {
    textDirective: TextDirective;
  }
}
