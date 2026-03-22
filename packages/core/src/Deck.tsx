import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { ClickNavigation } from "./ClickNavigation.js";
import { DeckContext } from "./context.js";
import { DrawingLayer } from "./DrawingLayer.js";
import { NavigationBar } from "./NavigationBar.js";
import { Pointer } from "./Pointer.js";
import { PrintView } from "./PrintView.js";
import { ProgressBar } from "./ProgressBar.js";
import { SlideNumber } from "./SlideNumber.js";
import { SlideIndexContext } from "./slide-context.js";
import type { TransitionType } from "./SlideTransition.js";
import { SlideTransition } from "./SlideTransition.js";
import { useFullscreen } from "./use-fullscreen.js";
import { openPresenterWindow, usePresenterSync } from "./use-presenter.js";
import type { DeckContextValue } from "./types.js";

/** Design resolution — slides are authored at this size and scaled to fit */
const DESIGN_WIDTH = 960;
const DESIGN_HEIGHT = 540;

export interface DeckProps {
  children: ReactNode;
  /** Slide transition type */
  transition?: TransitionType;
  /** Aspect ratio (default: 16/9). Set to 0 to disable and fill parent. */
  aspectRatio?: number;
}

export function Deck({ children, transition = "none", aspectRatio = 16 / 9 }: DeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [clickStep, setClickStep] = useState(0);
  const [isOverview, setIsOverview] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [clickStepsMap, setClickStepsMap] = useState<Record<number, number>>({});
  const [scale, setScale] = useState(1);

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
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      setClickStep(clickStepsMap[prevSlide] ?? 0);
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

  // Sync state to presenter window & listen for navigation commands
  const presenterHandlers = useMemo(() => ({ next, prev, goTo }), [next, prev, goTo]);
  usePresenterSync(currentSlide, clickStep, presenterHandlers);

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
          // Don't toggle overview when exiting fullscreen — the browser
          // handles fullscreen exit natively before JS events fire
          if (!document.fullscreenElement) {
            e.preventDefault();
            toggleOverview();
          }
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "p":
          e.preventDefault();
          openPresenterWindow();
          break;
        case "d":
          e.preventDefault();
          setIsDrawing((v) => !v);
          setIsPointer(false);
          break;
        case "q":
          e.preventDefault();
          setIsPointer((v) => !v);
          setIsDrawing(false);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, toggleOverview, toggleFullscreen]);

  // Touch swipe navigation
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;

    function handleTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    }

    function handleTouchEnd(e: TouchEvent) {
      if (isOverview || isDrawing) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      // Only trigger if horizontal swipe is dominant and exceeds threshold
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) next();
        else prev();
      }
    }

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [next, prev, isOverview, isDrawing]);

  // Print mode: show all slides when printing
  useEffect(() => {
    function onBeforePrint() {
      setIsPrinting(true);
    }
    function onAfterPrint() {
      setIsPrinting(false);
    }
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  // Scale slide content to fit container
  useEffect(() => {
    const el = deckRef.current;
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

  const useLetterbox = aspectRatio > 0;

  const slideArea = (
    <div
      ref={deckRef}
      className="reslide-deck"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "var(--slide-bg, #fff)",
        color: "var(--slide-text, #1a1a1a)",
        cursor: isPointer ? "none" : undefined,
      }}
    >
      {/* Scaled content layer — renders at fixed design size, scaled to fit */}
      <div
        className="reslide-scale-wrapper"
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
        {isPrinting ? (
          <PrintView>{children}</PrintView>
        ) : isOverview ? (
          <OverviewGrid totalSlides={totalSlides} goTo={goTo}>
            {children}
          </OverviewGrid>
        ) : (
          <SlideTransition currentSlide={currentSlide} transition={transition}>
            {children}
          </SlideTransition>
        )}
      </div>
      {/* UI overlays — not scaled, stay at actual viewport size */}
      {!isOverview && !isPrinting && (
        <ClickNavigation onPrev={prev} onNext={next} disabled={isDrawing} />
      )}
      {!isOverview && !isPrinting && <ProgressBar />}
      {!isOverview && !isPrinting && <SlideNumber />}
      {!isOverview && !isPrinting && (
        <DrawingLayer active={isDrawing} currentSlide={currentSlide} />
      )}
      {!isOverview && !isPrinting && <Pointer active={isPointer} />}
      {!isPrinting && (
        <NavigationBar isDrawing={isDrawing} onToggleDrawing={() => setIsDrawing((v) => !v)} />
      )}
    </div>
  );

  if (!useLetterbox) {
    return (
      <DeckContext.Provider value={contextValue}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
          {slideArea}
        </div>
      </DeckContext.Provider>
    );
  }

  return (
    <DeckContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="reslide-letterbox"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          overflow: "hidden",
        }}
      >
        <div
          className="reslide-letterbox-inner"
          style={{
            width: "100%",
            maxHeight: "100%",
            aspectRatio: String(aspectRatio),
          }}
        >
          {slideArea}
        </div>
      </div>
    </DeckContext.Provider>
  );
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
            border: "1px solid var(--slide-accent, #16a34a)",
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
            <SlideIndexContext.Provider value={i}>{slide}</SlideIndexContext.Provider>
          </div>
        </button>
      ))}
    </div>
  );
}
