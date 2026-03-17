import { Children } from "react";
import type { ReactNode } from "react";

import { SlideIndexContext } from "./slide-context.js";

/**
 * Renders all slides vertically for print/PDF export.
 * Use with @media print CSS to generate PDFs via browser print.
 */
export function PrintView({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children);

  return (
    <div className="reslide-print-view">
      {slides.map((slide, i) => (
        <SlideIndexContext.Provider key={i} value={i}>
          {slide}
        </SlideIndexContext.Provider>
      ))}
    </div>
  );
}
