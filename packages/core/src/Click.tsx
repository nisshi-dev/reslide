import { useContext, useEffect } from "react";
import type { ReactNode } from "react";

import { useDeck } from "./context.js";
import { SlideIndexContext } from "./slide-context.js";

export interface ClickProps {
  children: ReactNode;
  /** The click step at which this content becomes visible (1-based) */
  at?: number;
}

export function Click({ children, at }: ClickProps) {
  const { clickStep } = useDeck();
  const targetStep = at ?? 1;
  const visible = clickStep >= targetStep;

  return (
    <div
      className="reslide-click"
      style={{
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.3s ease, visibility 0.3s ease",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Register click steps for the current slide.
 * Automatically reads the slide index from SlideIndexContext.
 * If slideIndex prop is provided, it takes precedence (for backwards compatibility).
 */
export function ClickSteps({ count, slideIndex }: { count: number; slideIndex?: number }) {
  const { registerClickSteps } = useDeck();
  const contextIndex = useContext(SlideIndexContext);
  const resolvedIndex = slideIndex ?? contextIndex;

  useEffect(() => {
    if (resolvedIndex != null) {
      registerClickSteps(resolvedIndex, count);
    }
  }, [resolvedIndex, count, registerClickSteps]);

  return null;
}
