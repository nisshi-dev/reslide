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
  expect(output).toBe("SHOW");
});
