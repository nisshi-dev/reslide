import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { Mark } from "../src";

afterEach(cleanup);

test("renders highlight mark by default", () => {
  render(<Mark>Important</Mark>);
  const el = screen.getByText("Important");
  expect(el.classList.contains("reslide-mark-highlight")).toBe(true);
});

test("renders underline mark", () => {
  render(<Mark type="underline">Underlined</Mark>);
  const el = screen.getByText("Underlined");
  expect(el.classList.contains("reslide-mark-underline")).toBe(true);
  expect(el.style.textDecoration).toBe("underline");
});

test("renders circle mark", () => {
  render(<Mark type="circle">Circled</Mark>);
  const el = screen.getByText("Circled");
  expect(el.classList.contains("reslide-mark-circle")).toBe(true);
});

test("applies custom color", () => {
  render(<Mark color="red">Red text</Mark>);
  const el = screen.getByText("Red text");
  expect(el.style.backgroundColor).toBeTruthy();
});
