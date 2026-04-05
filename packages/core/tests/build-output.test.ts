/// <reference types="node" />
// @vitest-environment node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vite-plus/test";

const distDir = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");

function readDist(file: string): string {
  return readFileSync(resolve(distDir, file), "utf-8");
}

describe("build output: RSC boundary", () => {
  test("server.mjs does NOT contain 'use client' directive", () => {
    const content = readDist("server.mjs");
    expect(content.trimStart().startsWith('"use client"')).toBe(false);
    expect(content.trimStart().startsWith("'use client'")).toBe(false);
  });

  test("server.mjs imports ReslideEmbedClient from a separate chunk", () => {
    const content = readDist("server.mjs");
    expect(content).toContain('from "./ReslideEmbedClient.mjs"');
  });

  test("server.mjs does NOT inline ReslideEmbed import", () => {
    const content = readDist("server.mjs");
    // server.mjs should not directly import ReslideEmbed — that should
    // only appear inside ReslideEmbedClient.mjs
    expect(content).not.toContain("ReslideEmbed-");
  });

  test("ReslideEmbedClient.mjs starts with 'use client'", () => {
    const content = readDist("ReslideEmbedClient.mjs");
    expect(content.trimStart().startsWith('"use client"')).toBe(true);
  });

  test("embed.mjs starts with 'use client'", () => {
    const content = readDist("embed.mjs");
    expect(content.trimStart().startsWith('"use client"')).toBe(true);
  });
});
