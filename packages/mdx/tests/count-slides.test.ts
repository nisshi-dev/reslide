import { expect, test } from "vite-plus/test";

import { parseSlideMetadata } from "../src/compile.js";

test("counts slides without layout frontmatter", () => {
  const source = `---
title: Test
---

# Slide 1

---

# Slide 2

---

# Slide 3`;
  expect(parseSlideMetadata(source).slideCount).toBe(3);
});

test("counts slides with layout frontmatter correctly", () => {
  const source = `---
title: Test
layout: none
---

# Slide 1

---
layout: center
---

# Slide 2

---
layout: none
---

# Slide 3`;
  expect(parseSlideMetadata(source).slideCount).toBe(3);
});

test("counts slides with multiple frontmatter fields", () => {
  const source = `---
title: Test
---

# Slide 1

---
layout: center
background: "#000"
---

# Slide 2

---
layout: none
cols: 6/4
---

# Slide 3`;
  expect(parseSlideMetadata(source).slideCount).toBe(3);
});

test("counts single slide", () => {
  const source = `---
title: Test
---

# Only Slide`;
  expect(parseSlideMetadata(source).slideCount).toBe(1);
});

test("counts slides with mixed layout and no-layout separators", () => {
  const source = `---
title: Test
---

# Slide 1

---

# Slide 2

---
layout: center
---

# Slide 3

---

# Slide 4

---
layout: none
---

# Slide 5`;
  expect(parseSlideMetadata(source).slideCount).toBe(5);
});
