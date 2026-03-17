import { Children, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { SlideIndexContext } from "./slide-context.js";

export type TransitionType =
  | "none"
  | "fade"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down";

const DURATION = 300;

interface SlideTransitionProps {
  children: ReactNode;
  currentSlide: number;
  transition: TransitionType;
}

export function SlideTransition({ children, currentSlide, transition }: SlideTransitionProps) {
  const slides = Children.toArray(children);
  const [displaySlide, setDisplaySlide] = useState(currentSlide);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCurrentRef = useRef(currentSlide);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Only trigger on currentSlide changes (not displaySlide)
  useEffect(() => {
    if (currentSlide === prevCurrentRef.current) return;
    const from = prevCurrentRef.current;
    prevCurrentRef.current = currentSlide;

    if (transition === "none") {
      setDisplaySlide(currentSlide);
      return;
    }

    // Start transition
    setPrevSlide(from);
    setDisplaySlide(currentSlide);
    setIsAnimating(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsAnimating(false);
      setPrevSlide(null);
    }, DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, transition]);

  const resolvedTransition = resolveTransition(transition, prevSlide, displaySlide);

  if (transition === "none" || !isAnimating) {
    return (
      <div className="reslide-transition-container">
        <SlideIndexContext.Provider value={displaySlide}>
          <div className="reslide-transition-slide" style={{ position: "relative" }}>
            {slides[displaySlide]}
          </div>
        </SlideIndexContext.Provider>
      </div>
    );
  }

  return (
    <div className="reslide-transition-container">
      {/* Exiting slide */}
      {prevSlide != null && (
        <SlideIndexContext.Provider value={prevSlide}>
          <div className={`reslide-transition-slide reslide-transition-${resolvedTransition}-exit`}>
            {slides[prevSlide]}
          </div>
        </SlideIndexContext.Provider>
      )}
      {/* Entering slide */}
      <SlideIndexContext.Provider value={displaySlide}>
        <div className={`reslide-transition-slide reslide-transition-${resolvedTransition}-enter`}>
          {slides[displaySlide]}
        </div>
      </SlideIndexContext.Provider>
    </div>
  );
}

function resolveTransition(
  transition: TransitionType,
  from: number | null,
  to: number,
): TransitionType {
  if (transition !== "slide-left" && transition !== "slide-right") return transition;
  if (from == null) return transition;

  const goingForward = to > from;
  if (transition === "slide-left") {
    return goingForward ? "slide-left" : "slide-right";
  }
  return goingForward ? "slide-right" : "slide-left";
}
