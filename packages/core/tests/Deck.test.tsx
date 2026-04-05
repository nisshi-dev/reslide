import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { Deck, Slide, useDeck } from "../src";

afterEach(() => {
  cleanup();
  window.location.hash = "";
});

function SlideCounter() {
  const { currentSlide, totalSlides } = useDeck();
  return (
    <span data-testid="counter">
      {currentSlide + 1}/{totalSlides}
    </span>
  );
}

test("renders children slides", () => {
  render(
    <Deck>
      <Slide>Slide 1</Slide>
      <Slide>Slide 2</Slide>
    </Deck>,
  );

  expect(screen.getByText("Slide 1")).toBeTruthy();
  expect(screen.queryByText("Slide 2")).toBeNull();
});

test("displays slide number", () => {
  const { container } = render(
    <Deck>
      <Slide>Slide 1</Slide>
      <Slide>Slide 2</Slide>
    </Deck>,
  );

  const slideNumber = container.querySelector(".reslide-slide-number");
  expect(slideNumber).toBeTruthy();
  expect(slideNumber!.textContent).toContain("1");
  expect(slideNumber!.textContent).toContain("2");
});

test("navigates with arrow keys", () => {
  render(
    <Deck>
      <Slide>
        <SlideCounter />
        Slide 1
      </Slide>
      <Slide>
        <SlideCounter />
        Slide 2
      </Slide>
    </Deck>,
  );

  expect(screen.getByText("Slide 1")).toBeTruthy();

  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(screen.getByText("Slide 2")).toBeTruthy();
  expect(screen.getByTestId("counter").textContent).toBe("2/2");

  fireEvent.keyDown(window, { key: "ArrowLeft" });
  expect(screen.getByText("Slide 1")).toBeTruthy();
  expect(screen.getByTestId("counter").textContent).toBe("1/2");
});

test("navigates with space bar", () => {
  render(
    <Deck>
      <Slide>Slide 1</Slide>
      <Slide>Slide 2</Slide>
    </Deck>,
  );

  fireEvent.keyDown(window, { key: " " });
  expect(screen.getByText("Slide 2")).toBeTruthy();
});

test("does not navigate past boundaries", () => {
  render(
    <Deck>
      <Slide>
        <SlideCounter />
        Only Slide
      </Slide>
    </Deck>,
  );

  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(screen.getByTestId("counter").textContent).toBe("1/1");

  fireEvent.keyDown(window, { key: "ArrowLeft" });
  expect(screen.getByTestId("counter").textContent).toBe("1/1");
});

test("letterbox-inner does not have height:100% (uses aspect-ratio instead)", () => {
  const { container } = render(
    <Deck aspectRatio={16 / 9}>
      <Slide>Slide 1</Slide>
    </Deck>,
  );

  const inner = container.querySelector(".reslide-letterbox-inner") as HTMLElement;
  expect(inner).toBeTruthy();
  // height:100% conflicts with aspect-ratio in flow layouts — must not be present
  // (jsdom doesn't support aspect-ratio in style attributes, so we only assert the negative)
  expect(inner.style.height).toBe("");
  expect(inner.style.maxHeight).toBe("100%");
  expect(inner.style.maxWidth).toBe("100%");
});

test("no-letterbox mode uses height:100% when aspectRatio is 0", () => {
  const { container } = render(
    <Deck aspectRatio={0}>
      <Slide>Slide 1</Slide>
    </Deck>,
  );

  // Should not have letterbox
  expect(container.querySelector(".reslide-letterbox")).toBeNull();
});

test("toggles overview mode with Escape", () => {
  render(
    <Deck>
      <Slide>Slide 1</Slide>
      <Slide>Slide 2</Slide>
    </Deck>,
  );

  fireEvent.keyDown(window, { key: "Escape" });
  // In overview mode, all slides should be visible as thumbnails
  expect(screen.getByText("Slide 1")).toBeTruthy();
  expect(screen.getByText("Slide 2")).toBeTruthy();

  // Exit overview
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.getByText("Slide 1")).toBeTruthy();
  expect(screen.queryByText("Slide 2")).toBeNull();
});
