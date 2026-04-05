import { expect, test } from "vite-plus/test";

import { toEmbedData } from "../src/compile.js";
import type { CompileResult } from "../src/compile.js";

test("converts CompileResult to ReslideEmbedData with all fields", () => {
  const result: CompileResult = {
    code: "const x = 1;",
    metadata: {
      title: "Test",
      slideCount: 3,
      transition: "fade",
      designWidth: "1280",
      designHeight: "720",
    },
    baseUrl: "file:///slides/",
    css: "body { color: red; }",
  };

  expect(toEmbedData(result)).toEqual({
    code: "const x = 1;",
    css: "body { color: red; }",
    transition: "fade",
    baseUrl: "file:///slides/",
    designWidth: 1280,
    designHeight: 720,
  });
});

test("omits undefined optional fields", () => {
  const result: CompileResult = {
    code: "const x = 1;",
    metadata: { slideCount: 1 },
  };

  const data = toEmbedData(result);
  expect(data).toEqual({ code: "const x = 1;" });
  expect("css" in data).toBe(false);
  expect("transition" in data).toBe(false);
  expect("baseUrl" in data).toBe(false);
  expect("designWidth" in data).toBe(false);
  expect("designHeight" in data).toBe(false);
});

test("converts string designWidth/designHeight to numbers", () => {
  const result: CompileResult = {
    code: "",
    metadata: { slideCount: 1, designWidth: "1920", designHeight: "1080" },
  };

  const data = toEmbedData(result);
  expect(data.designWidth).toBe(1920);
  expect(data.designHeight).toBe(1080);
});
