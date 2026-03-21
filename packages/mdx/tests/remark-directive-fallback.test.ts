import { remark } from "remark";
import remarkDirective from "remark-directive";
import remarkMdx from "remark-mdx";
import { expect, test } from "vite-plus/test";

import { remarkDirectiveFallback } from "../src/remark-directive-fallback.js";
import { remarkClick } from "../src/remark-click.js";
import { remarkMark } from "../src/remark-mark.js";

async function process(input: string) {
  const result = await remark()
    .use(remarkMdx)
    .use(remarkDirective)
    .use(remarkClick)
    .use(remarkMark)
    .use(remarkDirectiveFallback)
    .process(input);
  return String(result);
}

test("restores time notation like 13:00", async () => {
  const output = await process("13:00 のセッション");
  expect(output).toContain("13:00");
  expect(output).toContain("セッション");
});

test("restores port number like localhost:3000", async () => {
  const output = await process("localhost:3000 でアクセス");
  expect(output).toContain(":3000");
});

test("restores time in table cells", async () => {
  const input = `| 13:00 | オープニング |
| 17:30 | クロージング |`;
  const output = await process(input);
  expect(output).toContain("13:00");
  expect(output).toContain("17:30");
});

test("does not affect remarkMark directives", async () => {
  const output = await process(":highlight-yellow[重要]");
  expect(output).toContain("<Mark");
  expect(output).toContain("重要");
});

test("does not affect remarkClick directives", async () => {
  const output = await process("::click\n\nsome content");
  expect(output).toContain("<Click");
});

test("restores unknown text directive with content", async () => {
  const output = await process(":unknown[content]");
  // remark escapes special characters in output
  expect(output).toContain("unknown");
  expect(output).toContain("content");
  expect(output).not.toContain("<unknown");
});
