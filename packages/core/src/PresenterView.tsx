import { Children, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { DeckContext } from "./context.js";
import { SlideIndexContext } from "./slide-context.js";
import type { DeckContextValue } from "./types.js";
import type { PresenterMessage } from "./use-presenter.js";

export interface PresenterViewProps {
  children: ReactNode;
  /** Render function for notes content per slide */
  notes?: ReactNode[];
}

/**
 * Presenter view that syncs with the main presentation window.
 * Shows: current slide, next slide preview, notes, and timer.
 */
export function PresenterView({ children, notes }: PresenterViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [clickStep, setClickStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const slides = Children.toArray(children);
  const totalSlides = slides.length;

  // Listen for sync messages from main window
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel("reslide-presenter");
    channel.onmessage = (e: MessageEvent<PresenterMessage>) => {
      if (e.data.type === "sync") {
        setCurrentSlide(e.data.currentSlide);
        setClickStep(e.data.clickStep);
      }
    };

    return () => channel.close();
  }, []);

  // Timer
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Minimal context for child components that read useDeck
  const noop = useCallback(() => {}, []);
  const noopNum = useCallback((_n: number) => {}, []);
  const noopReg = useCallback((_i: number, _c: number) => {}, []);

  const contextValue: DeckContextValue = {
    currentSlide,
    totalSlides,
    clickStep,
    totalClickSteps: 0,
    isOverview: false,
    isFullscreen: false,
    next: noop,
    prev: noop,
    goTo: noopNum,
    toggleOverview: noop,
    toggleFullscreen: noop,
    registerClickSteps: noopReg,
  };

  return (
    <DeckContext.Provider value={contextValue}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gridTemplateRows: "1fr auto",
          width: "100%",
          height: "100%",
          gap: "0.75rem",
          padding: "0.75rem",
          backgroundColor: "#1a1a2e",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* Current slide */}
        <div
          style={{
            border: "2px solid #3b82f6",
            borderRadius: "0.5rem",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "var(--slide-bg, #fff)",
            color: "var(--slide-text, #1a1a1a)",
          }}
        >
          <SlideIndexContext.Provider value={currentSlide}>
            {slides[currentSlide]}
          </SlideIndexContext.Provider>
        </div>

        {/* Right panel: next slide + notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: 0 }}>
          {/* Next slide preview */}
          <div
            style={{
              flex: "0 0 40%",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
              overflow: "hidden",
              opacity: 0.8,
              backgroundColor: "var(--slide-bg, #fff)",
              color: "var(--slide-text, #1a1a1a)",
            }}
          >
            {currentSlide < totalSlides - 1 && (
              <SlideIndexContext.Provider value={currentSlide + 1}>
                <div
                  style={{
                    transform: "scale(0.5)",
                    transformOrigin: "top left",
                    width: "200%",
                    height: "200%",
                  }}
                >
                  {slides[currentSlide + 1]}
                </div>
              </SlideIndexContext.Provider>
            )}
          </div>

          {/* Notes */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "1rem",
              backgroundColor: "#0f172a",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#94a3b8" }}>Notes</div>
            {notes?.[currentSlide] ?? (
              <span style={{ color: "#64748b" }}>No notes for this slide</span>
            )}
          </div>
        </div>

        {/* Bottom bar: timer + slide counter */}
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem 1rem",
            backgroundColor: "#0f172a",
            borderRadius: "0.5rem",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
            {formatTime(elapsed)}
          </div>
          <div style={{ fontSize: "1.125rem", fontVariantNumeric: "tabular-nums" }}>
            {currentSlide + 1} / {totalSlides}
            {clickStep > 0 && <span style={{ color: "#94a3b8" }}> (click {clickStep})</span>}
          </div>
        </div>
      </div>
    </DeckContext.Provider>
  );
}
