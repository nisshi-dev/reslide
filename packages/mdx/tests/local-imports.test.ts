import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";

import { compileMdxSlides } from "../src/compile.js";

const tmpDir = join(tmpdir(), "reslide-local-imports-test-" + Date.now());

beforeAll(() => {
  mkdirSync(join(tmpDir, "components"), { recursive: true });

  writeFileSync(
    join(tmpDir, "components", "feature-card.tsx"),
    `export function FeatureCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="feature-card"><h3>{title}</h3><div>{children}</div></div>;
}`,
  );

  writeFileSync(
    join(tmpDir, "utils.ts"),
    `export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

export const VERSION = "1.0.0";`,
  );

  writeFileSync(
    join(tmpDir, "components", "hero.tsx"),
    `export default function Hero({ title }: { title: string }) {
  return <section><h1>{title}</h1></section>;
}`,
  );
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("Local component imports", () => {
  test("inlines TSX component import", { timeout: 30_000 }, async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import { FeatureCard } from "./components/feature-card"

# Hello

<FeatureCard title="Fast">Turbopack HMR</FeatureCard>
`;
    const result = await compileMdxSlides(source, { baseUrl });
    expect(result.code).not.toContain('from "./components/feature-card"');
    expect(result.code).toContain("FeatureCard");
    // Inlined component should NOT be in props.components destructuring
    expect(result.code).not.toContain('_missingMdxReference("FeatureCard"');
  });

  test("inlines TS utility import", { timeout: 30_000 }, async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import { greet, VERSION } from "./utils.ts"

# Hello
`;
    const result = await compileMdxSlides(source, { baseUrl });
    expect(result.code).not.toContain('from "./utils.ts"');
    expect(result.code).toContain("greet");
    expect(result.code).toContain("VERSION");
  });

  test("inlines default import", { timeout: 30_000 }, async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import Hero from "./components/hero"

# Hello
`;
    const result = await compileMdxSlides(source, { baseUrl });
    expect(result.code).not.toContain('from "./components/hero"');
    expect(result.code).toContain("Hero");
  });

  test("throws on missing file", async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import { Missing } from "./nonexistent.tsx"

# Hello
`;
    await expect(compileMdxSlides(source, { baseUrl })).rejects.toThrow("Local module not found");
  });

  test("throws when no baseUrl provided", async () => {
    const source = `---
title: Test
---

import { FeatureCard } from "./components/feature-card.tsx"

# Hello
`;
    await expect(compileMdxSlides(source)).rejects.toThrow("no baseUrl provided");
  });

  test("deduplicates identical imports", { timeout: 30_000 }, async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import { greet } from "./utils.ts"

# Slide 1

---

import { VERSION } from "./utils.ts"

# Slide 2
`;
    const result = await compileMdxSlides(source, { baseUrl });
    expect(result.code).toContain("greet");
    expect(result.code).toContain("VERSION");
  });

  test("does not affect non-local imports", { timeout: 30_000 }, async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import { FeatureCard } from "./components/feature-card"

# Hello
`;
    const result = await compileMdxSlides(source, { baseUrl });
    expect(result.code).toContain("Deck");
    expect(result.code).toContain("Slide");
  });

  test("resolves extensionless .tsx import", { timeout: 30_000 }, async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import { FeatureCard } from "./components/feature-card"

# Hello

<FeatureCard title="Test">Content</FeatureCard>
`;
    const result = await compileMdxSlides(source, { baseUrl });
    // Should be inlined (no unresolved import)
    expect(result.code).not.toContain('from "./components/feature-card"');
    expect(result.code).toContain("FeatureCard");
  });

  test("resolves extensionless .ts import", { timeout: 30_000 }, async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import { greet } from "./utils"

# Hello
`;
    const result = await compileMdxSlides(source, { baseUrl });
    expect(result.code).not.toContain('from "./utils"');
    expect(result.code).toContain("greet");
  });

  test("throws on extensionless import with no matching file", async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import { X } from "./nonexistent"

# Hello
`;
    await expect(compileMdxSlides(source, { baseUrl })).rejects.toThrow("Local module not found");
  });

  test("strips react/jsx-runtime imports from inlined code", { timeout: 30_000 }, async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    const source = `---
title: Test
---

import { FeatureCard } from "./components/feature-card"

# Hello

<FeatureCard title="Test">Content</FeatureCard>
`;
    const result = await compileMdxSlides(source, { baseUrl });
    // The inlined code should NOT contain import from "react/jsx-runtime"
    // because MDX's run() provides _jsx/_jsxs via arguments[0]
    expect(result.code).not.toContain('from "react/jsx-runtime"');
    expect(result.code).not.toContain("from 'react/jsx-runtime'");
    // The component should still be present
    expect(result.code).toContain("FeatureCard");
  });

  test("does not process CSS imports", { timeout: 30_000 }, async () => {
    const baseUrl = pathToFileURL(tmpDir + "/").href;
    // CSS imports should be left to remarkExtractCssImports
    const source = `---
title: Test
---

import "./styles.css"

# Hello
`;
    // This should not throw about local module resolution
    // (CSS plugin handles it separately, and may throw about missing CSS file)
    await expect(compileMdxSlides(source, { baseUrl })).rejects.toThrow("CSS file not found");
  });
});
