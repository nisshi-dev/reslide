#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { cac } from "cac";
import { build, createServer } from "vite";

import { reslide } from "./vite-plugin.js";

const cli = cac("reslide");

function generateEntryFiles(slidesPath: string, outDir: string) {
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

  // main.tsx — imports the MDX slides and renders them
  writeFileSync(
    resolve(outDir, "main.tsx"),
    `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Deck, Slide, Click, ClickSteps, Mark, Notes, SlotRight } from "@reslide/core";
import Slides from "${absSlides}";

// Make components available to MDX
const components = { Deck, Slide, Click, ClickSteps, Mark, Notes, SlotRight };

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Slides components={components} />
  </StrictMode>
);
`,
  );
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

cli.help();
cli.version("0.0.0");
cli.parse();
