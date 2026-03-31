import { useContext, useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";

import { useDeck } from "./context.js";
import { SlideIndexContext } from "./slide-context.js";

export type ClickAnimation = "fade" | "slide-up" | "slide-left" | "scale" | "none";

export interface ClickProps {
  children: ReactNode;
  /** The click step at which this content becomes visible (1-based) */
  at?: number;
  /** Animation type for revealing content (default: "fade") */
  animation?: ClickAnimation;
}

const hiddenStyles: Record<ClickAnimation, CSSProperties> = {
  fade: { opacity: 0 },
  "slide-up": { opacity: 0, transform: "translateY(40px)" },
  "slide-left": { opacity: 0, transform: "translateX(-40px)" },
  scale: { opacity: 0, transform: "scale(0.8)" },
  none: { opacity: 0 },
};

const visibleStyles: Record<ClickAnimation, CSSProperties> = {
  fade: { opacity: 1 },
  "slide-up": { opacity: 1, transform: "translateY(0)" },
  "slide-left": { opacity: 1, transform: "translateX(0)" },
  scale: { opacity: 1, transform: "scale(1)" },
  none: { opacity: 1 },
};

export function Click({ children, at, animation = "fade" }: ClickProps) {
  const { clickStep } = useDeck();
  const targetStep = at ?? 1;
  const visible = clickStep >= targetStep;
  const animStyle = visible ? visibleStyles[animation] : hiddenStyles[animation];
  const transition =
    animation === "none" ? "none" : "opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease";

  return (
    <div
      className="reslide-click"
      style={{
        ...animStyle,
        visibility: visible ? "visible" : "hidden",
        pointerEvents: visible ? "auto" : "none",
        transition,
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
