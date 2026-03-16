import { remark } from "remark";
import remarkDirective from "remark-directive";
import remarkMdx from "remark-mdx";
import { expect, test } from "vite-plus/test";

import { remarkMark } from "../src/remark-mark.js";

async function process(input: string) {
  const result = await remark().use(remarkMdx).use(remarkDirective).use(remarkMark).process(input);
  return String(result);
}

test("converts ::mark[text]{.highlight} to <Mark>", async () => {
  const input = `This is :mark[important]{.highlight} text`;

  const output = await process(input);
  expect(output).toContain("<Mark");
  expect(output).toContain("important");
});

test("extracts color from classes", async () => {
  const input = `Some :mark[highlighted]{.highlight.orange} text`;

  const output = await process(input);
  expect(output).toContain('type="highlight"');
  expect(output).toContain('color="orange"');
});

test("supports underline type", async () => {
  const input = `An :mark[underlined]{.underline} word`;

  const output = await process(input);
  expect(output).toContain('type="underline"');
});
