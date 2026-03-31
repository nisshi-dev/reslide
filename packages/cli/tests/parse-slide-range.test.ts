import { expect, test } from "vite-plus/test";

import { parseSlideRange } from "../src/utils.js";

test("parses single slide number", () => {
  expect(parseSlideRange("3", 10)).toEqual([2]);
});

test("parses comma-separated slides", () => {
  expect(parseSlideRange("1,3,5", 10)).toEqual([0, 2, 4]);
});

test("parses range", () => {
  expect(parseSlideRange("2-5", 10)).toEqual([1, 2, 3, 4]);
});

test("parses mixed range and individual", () => {
  expect(parseSlideRange("1,3-5,8", 10)).toEqual([0, 2, 3, 4, 7]);
});

test("clamps to total slides", () => {
  expect(parseSlideRange("1-100", 5)).toEqual([0, 1, 2, 3, 4]);
});

test("ignores out-of-range numbers", () => {
  expect(parseSlideRange("0,11", 10)).toEqual([]);
});

test("handles numeric input from cac parser", () => {
  expect(parseSlideRange(1, 10)).toEqual([0]);
});

test("deduplicates overlapping ranges", () => {
  expect(parseSlideRange("1-3,2-4", 10)).toEqual([0, 1, 2, 3]);
});
