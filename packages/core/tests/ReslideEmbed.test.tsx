import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { ReslideEmbed } from "../src";

afterEach(() => {
  cleanup();
});

// ReslideEmbed shows a skeleton while MDX is being evaluated.
// We test the container style on the skeleton (initial render).
// jsdom doesn't support aspect-ratio as a style property, so we assert
// its absence/presence indirectly through height behavior.

test("container does NOT have height:100% when aspectRatio is set", () => {
  const { container } = render(<ReslideEmbed code="" aspectRatio={16 / 9} />);

  const outer = container.firstElementChild as HTMLElement;
  // When aspectRatio is set, height should NOT be 100% (aspect-ratio is used instead)
  expect(outer.style.height).toBe("");
  expect(outer.style.width).toBe("100%");
});

test("container uses height:100% when aspectRatio is 0", () => {
  const { container } = render(<ReslideEmbed code="" aspectRatio={0} />);

  const outer = container.firstElementChild as HTMLElement;
  expect(outer.style.height).toBe("100%");
});

test("container uses height:100% when aspectRatio is undefined", () => {
  const { container } = render(<ReslideEmbed code="" />);

  const outer = container.firstElementChild as HTMLElement;
  expect(outer.style.height).toBe("100%");
});

test("user style overrides are applied", () => {
  const { container } = render(
    <ReslideEmbed code="" aspectRatio={16 / 9} style={{ borderRadius: "0.5rem", width: "80%" }} />,
  );

  const outer = container.firstElementChild as HTMLElement;
  expect(outer.style.borderRadius).toBe("0.5rem");
  expect(outer.style.width).toBe("80%");
});
