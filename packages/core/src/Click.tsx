import { useEffect } from "react";
import type { ReactNode } from "react";

import { useDeck } from "./context.js";

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
        transition: "opacity 0.3s ease",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Register click steps for the current slide.
 * Place this inside a <Slide> to declare how many click steps it has.
 */
export function ClickSteps({ count, slideIndex }: { count: number; slideIndex: number }) {
  const { registerClickSteps } = useDeck();

  useEffect(() => {
    registerClickSteps(slideIndex, count);
  }, [slideIndex, count, registerClickSteps]);

  return null;
}
