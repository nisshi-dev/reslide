import { Children, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { DeckContext } from "./context.js";
import { SlideIndexContext } from "./slide-context.js";
import { DEFAULT_DESIGN_WIDTH, DEFAULT_DESIGN_HEIGHT } from "./types.js";
import type { DeckContextValue } from "./types.js";

function ScaledSlideCard({ children, index }: { children: ReactNode; index: number }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const ctx = useContext(DeckContext);
  const dw = ctx?.designWidth ?? DEFAULT_DESIGN_WIDTH;
  const dh = ctx?.designHeight ?? DEFAULT_DESIGN_HEIGHT;

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setScale(width / dw);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [dw]);

  return (
    <div className="reslide-print-slide-card">
      <div ref={frameRef} className="reslide-print-slide-frame">
        <SlideIndexContext.Provider value={index}>
          <div
            className="reslide-print-slide-content"
            style={{
              width: dw,
              height: dh,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </SlideIndexContext.Provider>
      </div>
      <div className="reslide-print-slide-label">{index + 1}</div>
    </div>
  );
}

/**
 * Renders all slides in a printable handout layout.
 * 6 slides per page (2 columns × 3 rows), each maintaining 16:9 ratio.
 */
export function PrintView({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children);
  const parentCtx = useContext(DeckContext);
  const dw = parentCtx?.designWidth ?? DEFAULT_DESIGN_WIDTH;
  const dh = parentCtx?.designHeight ?? DEFAULT_DESIGN_HEIGHT;
  const noop = useCallback(() => {}, []);
  const noopNum = useCallback((_n: number) => {}, []);
  const noopReg = useCallback((_i: number, _c: number) => {}, []);

  const contextValue = useMemo<DeckContextValue>(
    () => ({
      currentSlide: 0,
      totalSlides: slides.length,
      clickStep: 999,
      totalClickSteps: 0,
      isOverview: false,
      isFullscreen: false,
      designWidth: dw,
      designHeight: dh,
      next: noop,
      prev: noop,
      goTo: noopNum,
      toggleOverview: noop,
      toggleFullscreen: noop,
      registerClickSteps: noopReg,
    }),
    [slides.length, dw, dh, noop, noopNum, noopReg],
  );

  return (
    <DeckContext.Provider value={contextValue}>
      <div className="reslide-print-view">
        {slides.map((slide, i) => (
          <ScaledSlideCard key={i} index={i}>
            {slide}
          </ScaledSlideCard>
        ))}
      </div>
    </DeckContext.Provider>
  );
}
