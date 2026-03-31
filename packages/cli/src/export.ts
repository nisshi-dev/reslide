import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { createServer } from "vite";

import { reslide } from "./vite-plugin.js";

type ImageFormat = "png" | "jpg" | "webp" | "avif";
type ExportFormat = "pdf" | ImageFormat;

interface ExportOptions {
  format: ExportFormat;
  out: string;
  width: number;
  height: number;
  port: number;
  slides?: string;
  quality?: number;
  publicDir?: string;
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

const NEEDS_SHARP: Set<ImageFormat> = new Set(["webp", "avif"]);

/**
 * Dynamically import sharp for WebP/AVIF conversion.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadSharp(): Promise<any> {
  const mod = "sharp";
  try {
    return await import(mod);
  } catch {
    console.error("Error: sharp is required for WebP/AVIF export.\n" + "Install it: vp add sharp");
    process.exit(1);
  }
}

/**
 * Convert a PNG buffer to the target image format.
 */
async function convertImage(
  pngBuffer: Buffer,
  format: ImageFormat,
  quality?: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharp?: any,
): Promise<Buffer> {
  if (format === "png") return pngBuffer;

  if (format === "jpg") {
    if (sharp) {
      return sharp
        .default(pngBuffer)
        .jpeg({ quality: quality ?? 90 })
        .toBuffer();
    }
    return pngBuffer;
  }

  // WebP / AVIF — always uses sharp
  const pipeline = sharp.default(pngBuffer);
  if (format === "webp") {
    return pipeline.webp({ quality: quality ?? 80 }).toBuffer();
  }
  return pipeline.avif({ quality: quality ?? 50 }).toBuffer();
}

/**
 * Export slides to PDF or images using Playwright.
 * Playwright must be installed by the user: `vp add playwright`
 * sharp is additionally required for WebP/AVIF: `vp add sharp`
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

  // Load sharp if needed for the target format
  const imageFormat = options.format === "pdf" ? undefined : options.format;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sharp: any;
  if (imageFormat && NEEDS_SHARP.has(imageFormat)) {
    sharp = await loadSharp();
  }
  if (imageFormat === "jpg" && !sharp) {
    try {
      const mod = "sharp";
      sharp = await import(mod);
    } catch {
      // Fall back to Playwright JPEG
    }
  }

  const tmpDir = resolve(dirname(slidesPath), ".reslide");
  generateEntryFiles(slidesPath, tmpDir);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let browser: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let server: any;

  try {
    server = await createServer({
      root: tmpDir,
      plugins: [reslide()],
      server: { port: options.port },
      publicDir: options.publicDir,
    });
    await server.listen();
    const url = `http://localhost:${options.port}`;

    console.log("Starting export...");

    browser = await pw.chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: options.width, height: options.height });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector(".reslide-deck");

    const totalText = await page.textContent(".reslide-slide-number");
    const total = totalText ? parseInt(totalText.split("/")[1].trim(), 10) : 1;

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
        await page.waitForTimeout(400);
        currentSlide++;
      }
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
            `<div style="page-break-after:always;width:${options.width}px;height:${options.height}px">` +
            `<img src="data:image/png;base64,${buf.toString("base64")}" style="width:100%;height:100%;object-fit:contain"/>` +
            `</div>`,
        )
        .join("");

      await pdfPage.setContent(
        `<html><head><style>@page{size:${options.width}px ${options.height}px;margin:0}body{margin:0}</style></head><body>${htmlSlides}</body></html>`,
      );

      const pdfPath = resolve(outDir, "slides.pdf");
      await pdfPage.pdf({
        path: pdfPath,
        width: `${options.width}px`,
        height: `${options.height}px`,
        printBackground: true,
      });
      console.log(`  Exported: ${pdfPath}`);
    } else {
      const fmt = options.format as ImageFormat;
      const ext = fmt === "jpg" ? "jpg" : fmt;

      for (const idx of targetIndices) {
        await navigateTo(idx);
        const pngBuf: Buffer = await page.screenshot({ type: "png" });
        const outputBuf = await convertImage(pngBuf, fmt, options.quality, sharp);
        const filePath = resolve(outDir, `${idx + 1}.${ext}`);
        writeFileSync(filePath, outputBuf);
        console.log(`  Exported: ${filePath}`);
      }
    }

    console.log("\nExport complete!");
  } finally {
    if (browser) await browser.close();
    if (server) await server.close();
    // Clean up temporary .reslide/ directory
    rmSync(tmpDir, { recursive: true, force: true });
  }
}
