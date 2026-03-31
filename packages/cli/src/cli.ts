#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { cac } from "cac";
import { build, createServer } from "vite";

import { reslide } from "./vite-plugin.js";

const cli = cac("reslide");

interface EntryFileOptions {
  css?: string;
  noSlideNumbers?: boolean;
}

function generateEntryFiles(slidesPath: string, outDir: string, entryOptions?: EntryFileOptions) {
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

  const cssImport = entryOptions?.css ? `import "${resolve(entryOptions.css)}";\n` : "";
  const slideNumbersProp = entryOptions?.noSlideNumbers ? " slideNumbers={false}" : "";

  // main.tsx — imports the MDX slides and renders them
  writeFileSync(
    resolve(outDir, "main.tsx"),
    `import "@reslide-dev/core/themes/default.css";
${cssImport}import { StrictMode } from "react";
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

/**
 * Find the project root by looking for a directory containing public/.
 * Walks up from the slides file directory.
 */
function findPublicDir(slidesPath: string): string | undefined {
  let dir = resolve(dirname(slidesPath));
  const root = resolve("/");
  while (dir !== root) {
    const candidate = resolve(dir, "public");
    if (existsSync(candidate)) return candidate;
    dir = dirname(dir);
  }
  return undefined;
}

cli
  .command("dev <slides>", "Start development server")
  .option("--port <port>", "Port number", { default: 3030 })
  .option("--host", "Expose to network")
  .action(async (slides: string, options: { port: number; host?: boolean }) => {
    if (!existsSync(slides)) {
      console.error(`Error: File not found: ${slides}`);
      process.exit(1);
    }

    const tmpDir = resolve(dirname(slides), ".reslide");
    generateEntryFiles(slides, tmpDir);

    const server = await createServer({
      root: tmpDir,
      plugins: [reslide()],
      server: {
        port: options.port,
        host: options.host,
        open: true,
      },
    });

    await server.listen();
    server.printUrls();
  });

cli
  .command("build <slides>", "Build static presentation")
  .option("--out <dir>", "Output directory", { default: "dist" })
  .action(async (slides: string, options: { out: string }) => {
    if (!existsSync(slides)) {
      console.error(`Error: File not found: ${slides}`);
      process.exit(1);
    }

    const tmpDir = resolve(dirname(slides), ".reslide");
    generateEntryFiles(slides, tmpDir);

    await build({
      root: tmpDir,
      plugins: [reslide()],
      build: {
        outDir: resolve(options.out),
        emptyOutDir: true,
      },
    });

    console.log(`\nBuild complete. Output: ${resolve(options.out)}`);
  });

cli
  .command("export <slides>", "Export slides to PDF or images (requires Playwright)")
  .option("--format <format>", "Export format: pdf, png, jpg, webp, avif", {
    default: "pdf",
  })
  .option("--out <dir>", "Output directory", { default: "export" })
  .option("--width <width>", "Viewport width", { default: 1920 })
  .option("--height <height>", "Viewport height", { default: 1080 })
  .option("--slides <range>", "Slide range to export (e.g. 1, 1,3-5, 2-8)")
  .option("--quality <quality>", "Image quality for jpg/webp/avif (1-100)")
  .option("--public-dir <dir>", "Public directory for static assets (auto-detect)")
  .option("--css <path>", "Additional CSS file to include")
  .option("--no-slide-numbers", "Hide slide numbers in export")
  .action(
    async (
      slides: string,
      options: {
        format: string;
        out: string;
        width: number;
        height: number;
        slides?: string | number;
        quality?: number;
        publicDir?: string;
        css?: string;
        slideNumbers: boolean;
      },
    ) => {
      const validFormats = ["pdf", "png", "jpg", "webp", "avif"];
      if (!validFormats.includes(options.format)) {
        console.error(`Error: Invalid format "${options.format}". Use: ${validFormats.join(", ")}`);
        process.exit(1);
      }

      const publicDir = options.publicDir ?? findPublicDir(slides);

      const { exportSlides } = await import("./export.js");
      await exportSlides(
        slides,
        (slidesPath, outDir) =>
          generateEntryFiles(slidesPath, outDir, {
            css: options.css,
            noSlideNumbers: !options.slideNumbers,
          }),
        {
          format: options.format as "pdf" | "png" | "jpg" | "webp" | "avif",
          out: options.out,
          width: options.width,
          height: options.height,
          port: 4173,
          slides: options.slides != null ? String(options.slides) : undefined,
          quality: options.quality,
          publicDir,
        },
      );
    },
  );

cli.help();
cli.version("0.0.0");
cli.parse();
