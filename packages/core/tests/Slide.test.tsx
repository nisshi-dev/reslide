import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { Deck, Slide } from "../src";

afterEach(cleanup);

test("renders content with default layout", () => {
  render(
    <Deck>
      <Slide>Hello World</Slide>
    </Deck>,
  );

  expect(screen.getByText("Hello World")).toBeTruthy();
});

test("applies layout class", () => {
  render(
    <Deck>
      <Slide layout="center">Centered</Slide>
    </Deck>,
  );

  const slide = screen.getByText("Centered").closest(".reslide-slide");
  expect(slide?.classList.contains("reslide-layout-center")).toBe(true);
});

test("applies custom className", () => {
  render(
    <Deck>
      <Slide className="my-class">Content</Slide>
    </Deck>,
  );

  const slide = screen.getByText("Content").closest(".reslide-slide");
  expect(slide?.classList.contains("my-class")).toBe(true);
});
