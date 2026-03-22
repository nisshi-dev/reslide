import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  reslideComponents,
  PresenterView,
  PrintView,
  isPresenterView,
} from "@reslide-dev/core/mdx-components";
import { App } from "./App";
// @ts-expect-error MDX module has no type declarations
import Slides from "../slides.mdx";
import "katex/dist/katex.min.css";
import "@reslide-dev/core/themes/default.css";
import "@reslide-dev/core/transitions.css";
import "@reslide-dev/core/print.css";
import "./style.css";

const presenterComponents = {
  ...reslideComponents,
  Deck: PresenterView,
};

const printComponents = {
  ...reslideComponents,
  Deck: PrintView,
};

function getMode(): "presenter" | "play" | "print" | "landing" {
  if (typeof window === "undefined") return "landing";
  const params = new URLSearchParams(window.location.search);
  if (isPresenterView()) return "presenter";
  if (params.get("mode") === "print") return "print";
  if (params.get("mode") === "play") return "play";
  return "landing";
}

const mode = getMode();

// Auto-open print dialog on print page
if (mode === "print") {
  window.addEventListener("load", () => setTimeout(() => window.print(), 800), { once: true });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {mode === "presenter" ? (
      <div style={{ position: "fixed", inset: 0 }}>
        <Slides components={presenterComponents} />
      </div>
    ) : mode === "print" ? (
      <div className="reslide-print-page">
        <Slides components={printComponents} />
      </div>
    ) : mode === "play" ? (
      <div className="reslide-play-wrapper" style={{ position: "fixed", inset: 0 }}>
        <Slides components={reslideComponents} />
      </div>
    ) : (
      <App />
    )}
  </StrictMode>,
);
