import { remark } from "remark";
import remarkDirective from "remark-directive";
import remarkMdx from "remark-mdx";
import { expect, test } from "vite-plus/test";

import { remarkClick } from "../src/remark-click.js";

async function process(input: string) {
  const result = await remark().use(remarkMdx).use(remarkDirective).use(remarkClick).process(input);
  return String(result);
}

test("converts ::click leaf directive to <Click>", async () => {
  const input = `Some text

::click

Revealed text`;

  const output = await process(input);
  expect(output).toContain("<Click");
  expect(output).toContain("Revealed text");
});

test("auto-increments at prop", async () => {
  const input = `Initial

::click

First reveal

::click

Second reveal`;

  const output = await process(input);
  expect(output).toContain("{1}");
  expect(output).toContain("{2}");
});
