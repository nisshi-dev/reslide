import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdx from "remark-mdx";
import { expect, test } from "vite-plus/test";

import { remarkSlides } from "../src/remark-slides.js";

async function process(input: string) {
  const result = await remark()
    .use(remarkMdx)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkSlides)
    .process(input);
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

test("applies headmatter layout to first slide", async () => {
  const input = `---
layout: none
---

# First Slide`;

  const output = await process(input);
  expect(output).toContain('layout="none"');
});

test("applies defaults.layout to slides without explicit layout", async () => {
  const input = `---
title: Test
defaults:
  layout: none
---

# Slide 1

---

# Slide 2

---
layout: center
---

# Slide 3`;

  const output = await process(input);
  // Slide 1 and 2 should get defaults.layout
  const noneMatches = output.match(/layout="none"/g);
  expect(noneMatches).toHaveLength(2);
  // Slide 3 should use its explicit layout
  expect(output).toContain('layout="center"');
});

test("individual slide layout overrides defaults", async () => {
  const input = `---
defaults:
  layout: none
---

# Slide 1

---
layout: center
---

# Slide 2`;

  const output = await process(input);
  expect(output).toContain('layout="none"');
  expect(output).toContain('layout="center"');
});
