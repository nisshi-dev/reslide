import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Parse a slide range string like "1", "1,3,5", "2-5", "1,3-5,8" into
 * a sorted array of 0-based slide indices.
 */
export function parseSlideRange(range: string | number, total: number): number[] {
  const rangeStr = String(range);
  const indices = new Set<number>();
  for (const token of rangeStr.split(",")) {
    const trimmed = token.trim();
    const dashMatch = trimmed.match(/^(\d+)-(\d+)$/);
    if (dashMatch) {
      const start = parseInt(dashMatch[1], 10);
      const end = parseInt(dashMatch[2], 10);
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= total) indices.add(i - 1);
      }
    } else {
      const n = parseInt(trimmed, 10);
      if (n >= 1 && n <= total) indices.add(n - 1);
    }
  }
  return [...indices].sort((a, b) => a - b);
}

export interface EntryFileOptions {
  css?: string;
  noSlideNumbers?: boolean;
  tailwind?: boolean;
}

export function generateEntryFiles(
  slidesPath: string,
  outDir: string,
  entryOptions?: EntryFileOptions,
) {
  const absSlides = resolve(slidesPath);

  mkdirSync(outDir, { recursive: true });

  // index.html
  writeFileSync(
    resolve(outDir, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>reslide</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>`,
  );

  // Generate tailwind.css with @source pointing to the slides directory
  if (entryOptions?.tailwind) {
    const slidesDir = dirname(resolve(slidesPath));
    writeFileSync(
      resolve(outDir, "tailwind.css"),
      `@import "tailwindcss";\n@source "${slidesDir}";`,
    );
  }
  const tailwindImport = entryOptions?.tailwind ? `import "./tailwind.css";\n` : "";
  const cssImport = entryOptions?.css ? `import "${resolve(entryOptions.css)}";\n` : "";
  const slideNumbersProp = entryOptions?.noSlideNumbers ? " slideNumbers={false}" : "";

  // main.tsx — imports the MDX slides and renders them
  writeFileSync(
    resolve(outDir, "main.tsx"),
    `import "@reslide-dev/core/themes/default.css";
${tailwindImport}${cssImport}import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Deck, Slide, Click, ClickSteps, Mark, Notes, SlotRight, GlobalLayer, Draggable, Mermaid, Toc, CodeEditor, SlideIndex, TotalSlides } from "@reslide-dev/core";
import Slides from "${absSlides}";

const components = { Deck: (props: Record<string, unknown>) => <Deck {...props}${slideNumbersProp} />, Slide, Click, ClickSteps, Mark, Notes, SlotRight, GlobalLayer, Draggable, Mermaid, Toc, CodeEditor, SlideIndex, TotalSlides };

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Slides components={components} />
  </StrictMode>
);
`,
  );
}
