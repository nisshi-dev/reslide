import { remark } from "remark";
import remarkMdx from "remark-mdx";
import { expect, test } from "vite-plus/test";

import { remarkSlides } from "../src/remark-slides.js";

async function process(input: string) {
  const result = await remark().use(remarkMdx).use(remarkSlides).process(input);
  return String(result);
}

test("splits slides at ---", async () => {
  const input = `# Slide 1

Content 1

---

# Slide 2

Content 2`;

  const output = await process(input);
  expect(output).toContain("<Deck>");
  expect(output).toContain("<Slide>");
  expect(output).toContain("# Slide 1");
  expect(output).toContain("# Slide 2");
});

test("extracts layout from frontmatter", async () => {
  const input = `---
layout: center
---

# Centered Slide`;

  const output = await process(input);
  expect(output).toContain('layout="center"');
});

test("handles multiple slides with frontmatter", async () => {
  const input = `# First

---

---
layout: two-cols
---

# Two Column`;

  const output = await process(input);
  expect(output).toContain('layout="two-cols"');
  expect(output).toContain("# First");
  expect(output).toContain("# Two Column");
});

test("wraps all slides in a single Deck", async () => {
  const input = `# Slide 1

---

# Slide 2

---

# Slide 3`;

  const output = await process(input);
  const deckMatches = output.match(/<Deck>/g);
  expect(deckMatches).toHaveLength(1);
});
