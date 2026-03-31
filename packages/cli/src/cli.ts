#!/usr/bin/env node

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { cac } from "cac";
import { build, createServer } from "vite";

import type { Plugin } from "vite";

import { generateEntryFiles } from "./utils.js";
import { reslide } from "./vite-plugin.js";

const cli = cac("reslide");

/**
 * Build Vite plugin array, optionally including Tailwind CSS v4.
 */
async function buildPlugins(options?: { tailwind?: boolean }): Promise<Plugin[]> {
  const plugins: Plugin[] = [...reslide()];
  if (options?.tailwind) {
    try {
      const mod = "@tailwindcss/vite";
      const tailwindcss = await import(mod);
      plugins.push((tailwindcss.default ?? tailwindcss)());
    } catch {
      console.error(
        "Error: @tailwindcss/vite is required for --tailwind.\n" +
          "Install it: vp add @tailwindcss/vite",
      );
      process.exit(1);
    }
  }
  return plugins;
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
  .option("--tailwind", "Enable Tailwind CSS v4 processing")
  .action(async (slides: string, options: { port: number; host?: boolean; tailwind?: boolean }) => {
    if (!existsSync(slides)) {
      console.error(`Error: File not found: ${slides}`);
      process.exit(1);
    }

    const tmpDir = resolve(dirname(slides), ".reslide");
    generateEntryFiles(slides, tmpDir, { tailwind: options.tailwind });

    const plugins = await buildPlugins({ tailwind: options.tailwind });
    const server = await createServer({
      root: tmpDir,
      plugins,
      server: {
        port: options.port,
        host: options.host,
        open: true,
        fs: { allow: [tmpDir, resolve(dirname(slides)), process.cwd()] },
      },
    });

    await server.listen();
    server.printUrls();
  });

cli
  .command("build <slides>", "Build static presentation")
  .option("--out <dir>", "Output directory", { default: "dist" })
  .option("--tailwind", "Enable Tailwind CSS v4 processing")
  .action(async (slides: string, options: { out: string; tailwind?: boolean }) => {
    if (!existsSync(slides)) {
      console.error(`Error: File not found: ${slides}`);
      process.exit(1);
    }

    const tmpDir = resolve(dirname(slides), ".reslide");
    generateEntryFiles(slides, tmpDir, { tailwind: options.tailwind });

    const plugins = await buildPlugins({ tailwind: options.tailwind });
    await build({
      root: tmpDir,
      plugins,
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
  .option("--tailwind", "Enable Tailwind CSS v4 processing")
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
        tailwind?: boolean;
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
            tailwind: options.tailwind,
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
          tailwind: options.tailwind,
        },
      );
    },
  );

cli.help();
cli.version("0.0.0");
cli.parse();
