import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Click, ClickSteps, Deck, Mark, Notes, Slide, SlotRight } from "@reslide-dev/core";
import "@reslide-dev/core/themes/default.css";
// @ts-expect-error MDX module
import Slides from "../slides.mdx";

const components = { Deck, Slide, Click, ClickSteps, Mark, Notes, SlotRight };

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Slides components={components} />
  </StrictMode>,
);
