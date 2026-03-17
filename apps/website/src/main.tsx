import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { reslideComponents } from "@reslide-dev/core/mdx-components";
import "katex/dist/katex.min.css";
import "@reslide-dev/core/themes/default.css";
import "@reslide-dev/core/transitions.css";
import "./style.css";
// @ts-expect-error MDX module has no type declarations
import Slides from "../slides.mdx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Slides components={reslideComponents} />
  </StrictMode>,
);
