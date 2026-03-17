import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { createServer } from "vite";

import { reslide } from "./vite-plugin.js";

interface ExportOptions {
  format: "pdf" | "png";
  out: string;
  width: number;
  height: number;
  port: number;
}

/**
 * Export slides to PDF or PNG using Playwright.
 * Playwright must be installed by the user: `vp add playwright`
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

  // Dynamic import of Playwright (optional peer dependency)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pw: any;
  try {
    pw = await (Function('return import("playwright")')() as Promise<unknown>);
  } catch {
    console.error(
      "Error: Playwright is required for export.\n" +
        "Install it: vp add playwright && vp dlx playwright install chromium",
    );
    process.exit(1);
  }

  const tmpDir = resolve(dirname(slidesPath), ".reslide");
  generateEntryFiles(slidesPath, tmpDir);

  const server = await createServer({
    root: tmpDir,
    plugins: [reslide()],
    server: { port: options.port },
  });
  await server.listen();
  const url = `http://localhost:${options.port}`;

  console.log("Starting export...");

  const browser = await pw.chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: options.width, height: options.height });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".reslide-deck");

  const totalText = await page.textContent(".reslide-slide-number");
  const total = totalText ? parseInt(totalText.split("/")[1].trim(), 10) : 1;

  console.log(`Found ${total} slides`);

  const outDir = resolve(options.out);
  mkdirSync(outDir, { recursive: true });

  if (options.format === "png") {
    for (let i = 0; i < total; i++) {
      if (i > 0) {
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(400);
      }
      const path = resolve(outDir, `slide-${String(i + 1).padStart(3, "0")}.png`);
      await page.screenshot({ path });
      console.log(`  Exported: ${path}`);
    }
  } else {
    const screenshots: Buffer[] = [];
    for (let i = 0; i < total; i++) {
      if (i > 0) {
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(400);
      }
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
  }

  await browser.close();
  await server.close();
  console.log("\nExport complete!");
}
