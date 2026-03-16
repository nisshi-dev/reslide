import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { DeckContext } from "./context.js";
import { useFullscreen } from "./use-fullscreen.js";
import type { DeckContextValue } from "./types.js";

export interface DeckProps {
  children: ReactNode;
}

export function Deck({ children }: DeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [clickStep, setClickStep] = useState(0);
  const [isOverview, setIsOverview] = useState(false);
  const [clickStepsMap, setClickStepsMap] = useState<Record<number, number>>({});

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  const totalSlides = Children.count(children);
  const totalClickSteps = clickStepsMap[currentSlide] ?? 0;

  const registerClickSteps = useCallback((slideIndex: number, count: number) => {
    setClickStepsMap((prev) => {
      if (prev[slideIndex] === count) return prev;
      return { ...prev, [slideIndex]: count };
    });
  }, []);

  const next = useCallback(() => {
    if (isOverview) return;
    if (clickStep < totalClickSteps) {
      setClickStep((s) => s + 1);
    } else if (currentSlide < totalSlides - 1) {
      setCurrentSlide((s) => s + 1);
      setClickStep(0);
    }
  }, [isOverview, clickStep, totalClickSteps, currentSlide, totalSlides]);

  const prev = useCallback(() => {
    if (isOverview) return;
    if (clickStep > 0) {
      setClickStep((s) => s - 1);
    } else if (currentSlide > 0) {
      setCurrentSlide((s) => s - 1);
      // When going to previous slide, show all click steps revealed
      setClickStep(clickStepsMap[currentSlide - 1] ?? 0);
    }
  }, [isOverview, clickStep, currentSlide, clickStepsMap]);

  const goTo = useCallback(
    (slideIndex: number) => {
      if (slideIndex >= 0 && slideIndex < totalSlides) {
        setCurrentSlide(slideIndex);
        setClickStep(0);
        if (isOverview) setIsOverview(false);
      }
    },
    [totalSlides, isOverview],
  );

  const toggleOverview = useCallback(() => {
    setIsOverview((v) => !v);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

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
        case "Escape":
          e.preventDefault();
          toggleOverview();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, toggleOverview, toggleFullscreen]);

  const contextValue = useMemo<DeckContextValue>(
    () => ({
      currentSlide,
      totalSlides,
      clickStep,
      totalClickSteps,
      isOverview,
      isFullscreen,
      next,
      prev,
      goTo,
      toggleOverview,
      toggleFullscreen,
      registerClickSteps,
    }),
    [
      currentSlide,
      totalSlides,
      clickStep,
      totalClickSteps,
      isOverview,
      isFullscreen,
      next,
      prev,
      goTo,
      toggleOverview,
      toggleFullscreen,
      registerClickSteps,
    ],
  );

  return (
    <DeckContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="reslide-deck"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "var(--slide-bg, #fff)",
          color: "var(--slide-text, #1a1a1a)",
        }}
      >
        {isOverview ? (
          <OverviewGrid totalSlides={totalSlides} goTo={goTo}>
            {children}
          </OverviewGrid>
        ) : (
          <PresentationView currentSlide={currentSlide}>{children}</PresentationView>
        )}
        {!isOverview && <SlideNumber current={currentSlide + 1} total={totalSlides} />}
      </div>
    </DeckContext.Provider>
  );
}

function PresentationView({
  children,
  currentSlide,
}: {
  children: ReactNode;
  currentSlide: number;
}) {
  const slides = Children.toArray(children);
  return <>{slides[currentSlide]}</>;
}

function OverviewGrid({
  children,
  totalSlides,
  goTo,
}: {
  children: ReactNode;
  totalSlides: number;
  goTo: (index: number) => void;
}) {
  const slides = Children.toArray(children);
  const cols = Math.ceil(Math.sqrt(totalSlides));

  return (
    <div
      className="reslide-overview"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "1rem",
        padding: "1rem",
        width: "100%",
        height: "100%",
        overflow: "auto",
      }}
    >
      {slides.map((slide, i) => (
        <button
          key={i}
          type="button"
          onClick={() => goTo(i)}
          style={{
            border: "1px solid var(--slide-accent, #3b82f6)",
            borderRadius: "0.5rem",
            overflow: "hidden",
            cursor: "pointer",
            background: "var(--slide-bg, #fff)",
            aspectRatio: "16 / 9",
            padding: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              transform: "scale(0.25)",
              transformOrigin: "top left",
              width: "400%",
              height: "400%",
              pointerEvents: "none",
            }}
          >
            {slide}
          </div>
        </button>
      ))}
    </div>
  );
}

function SlideNumber({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="reslide-slide-number"
      style={{
        position: "absolute",
        bottom: "1rem",
        right: "1rem",
        fontSize: "0.875rem",
        opacity: 0.6,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {current} / {total}
    </div>
  );
}
