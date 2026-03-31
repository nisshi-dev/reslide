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
