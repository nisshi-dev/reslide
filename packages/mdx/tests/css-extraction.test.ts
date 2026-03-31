import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test, beforeAll, afterAll } from "vite-plus/test";

import { compileMdxSlides } from "../src/compile.js";

describe("CSS extraction from <style> tags", () => {
  test("extracts <style> content into CompileResult.css", async () => {
    const source = `---
title: Test
---

<style>{\`
.bubble { color: red; }
\`}</style>

# Hello
`;
    const result = await compileMdxSlides(source);
    expect(result.css).toBeDefined();
    expect(result.css).toContain(".bubble { color: red; }");
  });

  test("extracts multiple <style> tags", async () => {
    const source = `---
title: Test
---

<style>{\`.a { color: red; }\`}</style>

# Slide 1

---

<style>{\`.b { color: blue; }\`}</style>

# Slide 2
`;
    const result = await compileMdxSlides(source);
    expect(result.css).toContain(".a { color: red; }");
    expect(result.css).toContain(".b { color: blue; }");
  });

  test("returns no css field when no <style> tags present", async () => {
    const source = `---
title: Test
---

# Hello
`;
    const result = await compileMdxSlides(source);
    expect(result.css).toBeUndefined();
  });

  test("removes <style> from compiled output", async () => {
    const source = `---
title: Test
---

<style>{\`.bubble { color: red; }\`}</style>

# Hello
`;
    const result = await compileMdxSlides(source);
    // The compiled JS code should not contain the raw CSS
    expect(result.code).not.toContain(".bubble { color: red; }");
  });
});

describe("CSS extraction from import statements", () => {
  const tmpDir = join(tmpdir(), "reslide-css-test-" + Date.now());

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(
      join(tmpDir, "styles.css"),
      ".timeline { position: relative; }\n.timeline::before { content: ''; }",
    );
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test("reads and extracts CSS from import statement", async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import "./styles.css"

# Hello
`;
    const result = await compileMdxSlides(source, { baseUrl });
    expect(result.css).toContain(".timeline { position: relative; }");
    expect(result.css).toContain(".timeline::before { content: ''; }");
  });

  test("removes CSS import from compiled output", async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import "./styles.css"

# Hello
`;
    const result = await compileMdxSlides(source, { baseUrl });
    expect(result.code).not.toContain("styles.css");
  });

  test("throws on missing CSS file", async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import "./nonexistent.css"

# Hello
`;
    await expect(compileMdxSlides(source, { baseUrl })).rejects.toThrow("CSS file not found");
  });

  test("combines <style> tags and CSS imports", async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import "./styles.css"

<style>{\`.extra { margin: 0; }\`}</style>

# Hello
`;
    const result = await compileMdxSlides(source, { baseUrl });
    expect(result.css).toContain(".timeline { position: relative; }");
    expect(result.css).toContain(".extra { margin: 0; }");
  });
});
