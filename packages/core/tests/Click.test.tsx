import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { Click, ClickSteps, Deck, Slide } from "../src";

afterEach(cleanup);

test("Click content is hidden initially and shown after click step", () => {
  render(
    <Deck>
      <Slide>
        <ClickSteps slideIndex={0} count={1} />
        <span>Always visible</span>
        <Click>
          <span>Revealed</span>
        </Click>
      </Slide>
    </Deck>,
  );

  expect(screen.getByText("Always visible")).toBeTruthy();
  // Click content should be hidden (opacity 0)
  const revealed = screen.getByText("Revealed");
  expect(revealed.parentElement?.style.opacity).toBe("0");

  // Advance click step
  fireEvent.keyDown(window, { key: " " });
  expect(revealed.parentElement?.style.opacity).toBe("1");
});

test("Click with at prop respects step number", () => {
  render(
    <Deck>
      <Slide>
        <ClickSteps slideIndex={0} count={2} />
        <Click at={1}>
          <span>First</span>
        </Click>
        <Click at={2}>
          <span>Second</span>
        </Click>
      </Slide>
    </Deck>,
  );

  const first = screen.getByText("First");
  const second = screen.getByText("Second");

  expect(first.parentElement?.style.opacity).toBe("0");
  expect(second.parentElement?.style.opacity).toBe("0");

  fireEvent.keyDown(window, { key: " " });
  expect(first.parentElement?.style.opacity).toBe("1");
  expect(second.parentElement?.style.opacity).toBe("0");

  fireEvent.keyDown(window, { key: " " });
  expect(first.parentElement?.style.opacity).toBe("1");
  expect(second.parentElement?.style.opacity).toBe("1");
});
