import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { DeckContext } from "./context.js";
import { SlideIndexContext } from "./slide-context.js";
import type { DeckContextValue } from "./types.js";
import { usePresenterChannel } from "./use-presenter.js";

const DESIGN_WIDTH = 960;
const DESIGN_HEIGHT = 540;

export interface PresenterViewProps {
  children: ReactNode;
  /** Render function for notes content per slide */
  notes?: ReactNode[];
}

/**
 * Scaled slide preview — renders at design size and scales to fit container.
 * Maintains 16:9 aspect ratio.
 */
function ScaledSlide({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setScale(Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT));
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--slide-bg, #fff)",
        color: "var(--slide-text, #1a1a1a)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Presenter view that syncs with the main presentation window.
 * Shows: current slide, next slide preview, notes, and timer.
 * Supports bidirectional control — navigate from this window to
 * drive the main presentation.
 */
export function PresenterView({ children, notes }: PresenterViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [clickStep, setClickStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const slides = Children.toArray(children);
  const totalSlides = slides.length;

  // Bidirectional channel: listen for sync, send navigation commands
  const { next, prev, goTo } = usePresenterChannel((msg) => {
    setCurrentSlide(msg.currentSlide);
    setClickStep(msg.clickStep);
  });

  // Keyboard navigation in presenter window
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

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
  const noopReg = useCallback((_i: number, _c: number) => {}, []);
  const noop = useCallback(() => {}, []);

  const contextValue = useMemo<DeckContextValue>(
    () => ({
      currentSlide,
      totalSlides,
      clickStep,
      totalClickSteps: 0,
      isOverview: false,
      isFullscreen: false,
      next,
      prev,
      goTo,
      toggleOverview: noop,
      toggleFullscreen: noop,
      registerClickSteps: noopReg,
    }),
    [currentSlide, totalSlides, clickStep, next, prev, goTo, noop, noopReg],
  );

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
            border: "2px solid #16a34a",
            borderRadius: "0.5rem",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
          }}
        >
          <SlideIndexContext.Provider value={currentSlide}>
            <ScaledSlide>{slides[currentSlide]}</ScaledSlide>
          </SlideIndexContext.Provider>
        </div>

        {/* Right panel: next slide + notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: 0 }}>
          {/* Next slide preview */}
          <div
            style={{
              border: "1px solid #334155",
              borderRadius: "0.5rem",
              overflow: "hidden",
              opacity: 0.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000",
            }}
          >
            {currentSlide < totalSlides - 1 ? (
              <SlideIndexContext.Provider value={currentSlide + 1}>
                <ScaledSlide>{slides[currentSlide + 1]}</ScaledSlide>
              </SlideIndexContext.Provider>
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  fontSize: "0.875rem",
                }}
              >
                End of slides
              </div>
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

        {/* Bottom bar: navigation + timer + slide counter */}
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

          {/* Navigation controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PresenterNavButton onClick={prev} title="Previous (←)">
              ◀
            </PresenterNavButton>
            <span style={{ fontSize: "1.125rem", fontVariantNumeric: "tabular-nums" }}>
              {currentSlide + 1} / {totalSlides}
              {clickStep > 0 && <span style={{ color: "#94a3b8" }}> (click {clickStep})</span>}
            </span>
            <PresenterNavButton onClick={next} title="Next (→ / Space)">
              ▶
            </PresenterNavButton>
          </div>

          <div style={{ width: "5rem" }} />
        </div>
      </div>
    </DeckContext.Provider>
  );
}

function PresenterNavButton({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2.25rem",
        height: "2.25rem",
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "0.375rem",
        cursor: "pointer",
        color: "#e2e8f0",
        fontSize: "0.875rem",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
      }}
    >
      {children}
    </button>
  );
}
