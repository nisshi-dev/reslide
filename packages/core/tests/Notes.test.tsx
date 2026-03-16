import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { Deck, Notes, Slide } from "../src";

afterEach(cleanup);

test("Notes are hidden in presentation mode", () => {
  render(
    <Deck>
      <Slide>
        Content
        <Notes>Speaker note</Notes>
      </Slide>
    </Deck>,
  );
  expect(screen.queryByText("Speaker note")).toBeNull();
});

test("Notes are visible in overview mode", () => {
  render(
    <Deck>
      <Slide>
        Content
        <Notes>Speaker note</Notes>
      </Slide>
    </Deck>,
  );

  // Enter overview mode
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.getByText("Speaker note")).toBeTruthy();
});
