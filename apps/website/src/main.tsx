import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  reslideComponents,
  PresenterView,
  isPresenterView,
} from "@reslide-dev/core/mdx-components";
import { App } from "./App";
// @ts-expect-error MDX module has no type declarations
import Slides from "../slides.mdx";
import "katex/dist/katex.min.css";
import "@reslide-dev/core/themes/default.css";
import "@reslide-dev/core/transitions.css";
import "./style.css";

const presenterComponents = {
  ...reslideComponents,
  Deck: PresenterView,
};

function getMode(): "presenter" | "play" | "landing" {
  if (typeof window === "undefined") return "landing";
  const params = new URLSearchParams(window.location.search);
  if (isPresenterView()) return "presenter";
  if (params.get("mode") === "play") return "play";
  return "landing";
}

const mode = getMode();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {mode === "presenter" ? (
      <div style={{ width: "100vw", height: "100dvh" }}>
        <Slides components={presenterComponents} />
      </div>
    ) : mode === "play" ? (
      <div style={{ width: "100vw", height: "100dvh" }}>
        <Slides components={reslideComponents} />
      </div>
    ) : (
      <App />
    )}
  </StrictMode>,
);
