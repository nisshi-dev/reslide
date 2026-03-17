import { remark } from "remark";
import remarkDirective from "remark-directive";
import remarkMdx from "remark-mdx";
import { expect, test } from "vite-plus/test";

import { remarkClick } from "../src/remark-click.js";
import { remarkSlides } from "../src/remark-slides.js";

test("debug: multi-slide ClickSteps indices", async () => {
  const input = `---
layout: center
---

# Slide 1

---

## Slide 2

::click

Item A

---

## Slide 3

No clicks here

---

## Slide 4

::click

Item B

::click

Item C
`;

  const result = await remark()
    .use(remarkMdx)
    .use(remarkDirective)
    .use(remarkSlides)
    .use(remarkClick)
    .process(input);

  const output = String(result);

  // Extract individual slides
  const slides = output.split("</Slide>").slice(0, -1);
  expect(slides).toHaveLength(4);

  // Slide 1 (center layout, no clicks)
  expect(slides[0]).toContain('layout="center"');
  expect(slides[0]).not.toContain("ClickSteps");

  // Slide 2 has 1 click
  expect(slides[1]).toContain("count={1}");

  // Slide 3 has no clicks
  expect(slides[2]).toContain("No clicks here");
  expect(slides[2]).not.toContain("ClickSteps");

  // Slide 4 has 2 clicks
  expect(slides[3]).toContain("count={2}");
  expect(slides[3]).toContain("at={1}");
  expect(slides[3]).toContain("at={2}");
});
