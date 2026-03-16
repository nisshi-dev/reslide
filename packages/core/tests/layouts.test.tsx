import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { Deck, Slide, SlotRight } from "../src";

afterEach(cleanup);

test("default layout renders content", () => {
  render(
    <Deck>
      <Slide>Default content</Slide>
    </Deck>,
  );
  expect(screen.getByText("Default content")).toBeTruthy();
});

test("center layout applies center alignment", () => {
  render(
    <Deck>
      <Slide layout="center">Centered</Slide>
    </Deck>,
  );
  const slide = screen.getByText("Centered").closest(".reslide-slide");
  expect(slide?.classList.contains("reslide-layout-center")).toBe(true);
  expect((slide as HTMLElement | null)?.style.textAlign).toBe("center");
});

test("two-cols layout splits children at SlotRight", () => {
  render(
    <Deck>
      <Slide layout="two-cols">
        <p>Left content</p>
        <SlotRight>
          <p>Right content</p>
        </SlotRight>
      </Slide>
    </Deck>,
  );
  expect(screen.getByText("Left content")).toBeTruthy();
  expect(screen.getByText("Right content")).toBeTruthy();

  const leftEl = screen.getByText("Left content").closest("div");
  const rightEl = screen.getByText("Right content").closest("div");
  expect(leftEl).not.toBe(rightEl);
});

test("section layout applies accent background", () => {
  render(
    <Deck>
      <Slide layout="section">Section Title</Slide>
    </Deck>,
  );
  const slide = screen.getByText("Section Title").closest(".reslide-slide");
  expect(slide?.classList.contains("reslide-layout-section")).toBe(true);
});

test("quote layout wraps in blockquote", () => {
  render(
    <Deck>
      <Slide layout="quote">A wise quote</Slide>
    </Deck>,
  );
  const blockquote = screen.getByText("A wise quote").closest("blockquote");
  expect(blockquote).toBeTruthy();
});

test("image-right layout renders image div", () => {
  render(
    <Deck>
      <Slide layout="image-right" image="/test.jpg">
        Content
      </Slide>
    </Deck>,
  );
  expect(screen.getByText("Content")).toBeTruthy();
  const slide = screen.getByText("Content").closest(".reslide-slide");
  expect(slide?.classList.contains("reslide-layout-image-right")).toBe(true);
});
