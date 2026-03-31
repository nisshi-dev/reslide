import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vite-plus/test";

import { generateEntryFiles } from "../src/utils.js";

const tmpDir = join(tmpdir(), "reslide-cli-test-" + Date.now());
const slidesPath = join(tmpDir, "slides.mdx");
const outDir = join(tmpDir, ".reslide");

beforeAll(() => {
  mkdirSync(tmpDir, { recursive: true });
  writeFileSync(slidesPath, "# Test\n");
});

afterEach(() => {
  // Clean up generated files between tests
  rmSync(outDir, { recursive: true, force: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("generateEntryFiles", () => {
  test("generates index.html with correct structure", () => {
    generateEntryFiles(slidesPath, outDir);
    const html = readFileSync(join(outDir, "index.html"), "utf-8");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('<div id="root"></div>');
    expect(html).toContain('<script type="module" src="./main.tsx">');
  });

  test("generates main.tsx with core CSS import", () => {
    generateEntryFiles(slidesPath, outDir);
    const main = readFileSync(join(outDir, "main.tsx"), "utf-8");
    expect(main).toContain("@reslide-dev/core/themes/default.css");
  });

  test("generates main.tsx with all builtin components", () => {
    generateEntryFiles(slidesPath, outDir);
    const main = readFileSync(join(outDir, "main.tsx"), "utf-8");
    expect(main).toContain("GlobalLayer");
    expect(main).toContain("Draggable");
    expect(main).toContain("Mermaid");
    expect(main).toContain("CodeEditor");
    expect(main).toContain("SlideIndex");
    expect(main).toContain("TotalSlides");
  });

  test("generates tailwind.css with @source when --tailwind", () => {
    generateEntryFiles(slidesPath, outDir, { tailwind: true });
    const tailwindCss = readFileSync(join(outDir, "tailwind.css"), "utf-8");
    expect(tailwindCss).toContain('@import "tailwindcss"');
    expect(tailwindCss).toContain("@source");
    // main.tsx should import tailwind.css
    const main = readFileSync(join(outDir, "main.tsx"), "utf-8");
    expect(main).toContain("./tailwind.css");
  });

  test("generates main.tsx with custom CSS import when --css", () => {
    generateEntryFiles(slidesPath, outDir, { css: "/path/to/custom.css" });
    const main = readFileSync(join(outDir, "main.tsx"), "utf-8");
    expect(main).toContain("custom.css");
  });

  test("generates main.tsx with slideNumbers={false} when --no-slide-numbers", () => {
    generateEntryFiles(slidesPath, outDir, { noSlideNumbers: true });
    const main = readFileSync(join(outDir, "main.tsx"), "utf-8");
    expect(main).toContain("slideNumbers={false}");
  });

  test("does not include tailwind when not specified", () => {
    generateEntryFiles(slidesPath, outDir);
    expect(existsSync(join(outDir, "tailwind.css"))).toBe(false);
    const main = readFileSync(join(outDir, "main.tsx"), "utf-8");
    expect(main).not.toContain("tailwind");
  });
});
