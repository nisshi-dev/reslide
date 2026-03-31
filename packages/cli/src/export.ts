import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { createServer } from "vite";

import { reslide } from "./vite-plugin.js";

type ImageFormat = "png" | "jpg" | "webp" | "avif";
type ExportFormat = "pdf" | ImageFormat;

/** Design resolution — always capture at this size, then resize. */
const CAPTURE_WIDTH = 1920;
const CAPTURE_HEIGHT = 1080;

/** Wait after initial page load for fonts/images to settle. */
const LOAD_WAIT_MS = 2000;

/** Wait after each slide transition for animations to complete. */
const TRANSITION_WAIT_MS = 600;

/**
 * Browser-side script to wait for all CSS background images to be fully loaded.
 * Must be passed to page.evaluate() as a string.
 */
const WAIT_FOR_BG_IMAGES_SCRIPT = `
async () => {
  const promises = [];
  for (const el of document.querySelectorAll('*')) {
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') {
      for (const m of bg.matchAll(/url\\(["']?([^"')]+)["']?\\)/g)) {
        promises.push(new Promise(resolve => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = m[1];
        }));
      }
    }
  }
  await Promise.all(promises);
}
`;

interface ExportOptions {
  format: ExportFormat;
  out: string;
  /** Output width (images are captured at 1920x1080 then resized) */
  width: number;
  /** Output height (images are captured at 1920x1080 then resized) */
  height: number;
  port: number;
  slides?: string;
  quality?: number;
  publicDir?: string;
  tailwind?: boolean;
}

/**
 * Parse a slide range string like "1", "1,3,5", "2-5", "1,3-5,8" into
 * a sorted array of 0-based slide indices.
 */
function parseSlideRange(range: string | number, total: number): number[] {
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

/**
 * Dynamically import sharp (optional peer dependency).
 * Required for WebP/AVIF export and output resizing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadSharp(): Promise<any> {
  const mod = "sharp";
  try {
    return await import(mod);
  } catch {
    console.error("Error: sharp is required for this export.\n" + "Install it: vp add sharp");
    process.exit(1);
  }
}

/**
 * Convert and optionally resize a PNG buffer to the target format/size.
 */
async function convertImage(
  pngBuffer: Buffer,
  format: ImageFormat,
  outputWidth: number,
  outputHeight: number,
  quality?: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharp?: any,
): Promise<Buffer> {
  if (!sharp) {
    // Without sharp, can only output PNG at capture resolution
    return pngBuffer;
  }

  let pipeline = sharp.default(pngBuffer);

  // Resize if output dimensions differ from capture
  if (outputWidth !== CAPTURE_WIDTH || outputHeight !== CAPTURE_HEIGHT) {
    pipeline = pipeline.resize(outputWidth, outputHeight, { fit: "fill" });
  }

  switch (format) {
    case "png":
      return pipeline.png().toBuffer();
    case "jpg":
      return pipeline.jpeg({ quality: quality ?? 90 }).toBuffer();
    case "webp":
      return pipeline.webp({ quality: quality ?? 80 }).toBuffer();
    case "avif":
      return pipeline.avif({ quality: quality ?? 50 }).toBuffer();
  }
}

/**
 * Export slides to PDF or images using Playwright.
 *
 * Slides are always captured at the design resolution (1920x1080) for
 * consistent rendering, then resized to --width/--height with sharp.
 *
 * Playwright must be installed by the user: `vp add playwright`
 * sharp is required for resizing and WebP/AVIF: `vp add sharp`
 */
export async function exportSlides(
  slidesPath: string,
  generateEntryFiles: (slidesPath: string, outDir: string) => void,
  options: ExportOptions,
) {
  if (!existsSync(slidesPath)) {
    console.error(`Error: File not found: ${slidesPath}`);
    process.exit(1);
  }

  // Dynamic import of Playwright (optional peer dependency).
  const playwrightModule = "playwright";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pw: any;
  try {
    pw = await import(playwrightModule);
  } catch {
    console.error(
      "Error: Playwright is required for export.\n" +
        "Install it: vp add playwright && vp dlx playwright install chromium",
    );
    process.exit(1);
  }

  // Determine if sharp is needed: resizing or non-PNG format
  const imageFormat = options.format === "pdf" ? undefined : options.format;
  const needsResize = options.width !== CAPTURE_WIDTH || options.height !== CAPTURE_HEIGHT;
  const needsSharp =
    imageFormat === "webp" || imageFormat === "avif" || imageFormat === "jpg" || needsResize;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sharp: any;
  if (needsSharp) {
    sharp = await loadSharp();
  }

  const tmpDir = resolve(dirname(slidesPath), ".reslide");
  generateEntryFiles(slidesPath, tmpDir);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let browser: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let server: any;

  try {
    // Build Vite plugins, optionally including Tailwind CSS v4
    const plugins = [...reslide()];
    if (options.tailwind) {
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

    server = await createServer({
      root: tmpDir,
      plugins,
      server: {
        port: options.port,
        fs: { allow: [tmpDir, resolve(dirname(slidesPath)), process.cwd()] },
      },
      publicDir: options.publicDir,
    });
    await server.listen();
    const url = `http://localhost:${options.port}`;

    console.log("Starting export...");

    browser = await pw.chromium.launch();
    const page = await browser.newPage();

    // Always capture at design resolution (1920x1080) for consistent rendering
    await page.setViewportSize({ width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT });
    await page.goto(url, { waitUntil: "networkidle" });

    // Wait for the deck to render — use .reslide-slide as fallback selector
    try {
      await page.waitForSelector(".reslide-deck", { timeout: 30_000 });
    } catch {
      // Try alternative selector in case slide number is hidden
      await page.waitForSelector(".reslide-slide", { timeout: 10_000 });
    }

    // Extra wait for fonts, images, and initial rendering to settle
    await page.waitForTimeout(LOAD_WAIT_MS);

    // Wait for CSS background images to be fully loaded
    await page.evaluate(WAIT_FOR_BG_IMAGES_SCRIPT);

    // Detect total slides — try slide number text first, fallback to counting slides
    let total = 1;
    const totalText = await page.textContent(".reslide-slide-number").catch(() => null);
    if (totalText) {
      const parsed = parseInt(totalText.split("/")[1]?.trim() ?? "", 10);
      if (Number.isFinite(parsed) && parsed > 0) total = parsed;
    } else {
      // Slide numbers might be hidden; count by navigating
      let count = 1;
      const maxSlides = 200;
      while (count < maxSlides) {
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(100);
        // Check if we actually advanced by looking at the URL hash
        const hash: string = await page.evaluate("window.location.hash");
        const slideNum = parseInt(hash.replace("#", ""), 10);
        if (Number.isFinite(slideNum) && slideNum > count) {
          count = slideNum;
        } else {
          break;
        }
      }
      total = count;
      // Navigate back to first slide
      await page.evaluate("window.location.hash = ''");
      await page.waitForTimeout(TRANSITION_WAIT_MS);
    }

    // Determine which slides to export
    const targetIndices = options.slides
      ? parseSlideRange(options.slides, total)
      : Array.from({ length: total }, (_, i) => i);

    if (targetIndices.length === 0) {
      console.error("Error: No valid slides in the specified range.");
      process.exit(1);
    }

    console.log(
      `Found ${total} slides, exporting ${targetIndices.length}: [${targetIndices.map((i) => i + 1).join(", ")}]`,
    );

    const outDir = resolve(options.out);
    mkdirSync(outDir, { recursive: true });

    // Navigate to each target slide and capture screenshots
    let currentSlide = 0;

    async function navigateTo(targetIndex: number) {
      while (currentSlide < targetIndex) {
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(TRANSITION_WAIT_MS);
        currentSlide++;
      }
      // Wait for CSS background images on the new slide
      await page.evaluate(WAIT_FOR_BG_IMAGES_SCRIPT);
    }

    if (options.format === "pdf") {
      const screenshots: Buffer[] = [];
      for (const idx of targetIndices) {
        await navigateTo(idx);
        screenshots.push(await page.screenshot({ type: "png" }));
      }

      const pdfPage = await browser.newPage();
      const htmlSlides = screenshots
        .map(
          (buf: Buffer) =>
            `<div style="page-break-after:always;width:${CAPTURE_WIDTH}px;height:${CAPTURE_HEIGHT}px">` +
            `<img src="data:image/png;base64,${buf.toString("base64")}" style="width:100%;height:100%;object-fit:contain"/>` +
            `</div>`,
        )
        .join("");

      await pdfPage.setContent(
        `<html><head><style>@page{size:${CAPTURE_WIDTH}px ${CAPTURE_HEIGHT}px;margin:0}body{margin:0}</style></head><body>${htmlSlides}</body></html>`,
      );

      const pdfPath = resolve(outDir, "slides.pdf");
      await pdfPage.pdf({
        path: pdfPath,
        width: `${CAPTURE_WIDTH}px`,
        height: `${CAPTURE_HEIGHT}px`,
        printBackground: true,
      });
      console.log(`  Exported: ${pdfPath}`);
    } else {
      const fmt = options.format as ImageFormat;
      const ext = fmt === "jpg" ? "jpg" : fmt;

      for (const idx of targetIndices) {
        await navigateTo(idx);
        const pngBuf: Buffer = await page.screenshot({ type: "png" });
        const outputBuf = await convertImage(
          pngBuf,
          fmt,
          options.width,
          options.height,
          options.quality,
          sharp,
        );
        const filePath = resolve(outDir, `${idx + 1}.${ext}`);
        writeFileSync(filePath, outputBuf);
        console.log(`  Exported: ${filePath}`);
      }
    }

    console.log("\nExport complete!");
  } finally {
    if (browser) await browser.close();
    if (server) await server.close();
    rmSync(tmpDir, { recursive: true, force: true });
  }
}
