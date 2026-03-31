import { useDeck } from "./context.js";

/**
 * Renders the current slide index (1-based) as inline text.
 * Use for custom slide number designs.
 *
 * @example
 * ```tsx
 * <div style={{ position: "absolute", bottom: 40, right: 64 }}>
 *   <SlideIndex /> / <TotalSlides />
 * </div>
 * ```
 */
export function SlideIndex() {
  const { currentSlide } = useDeck();
  return <>{currentSlide + 1}</>;
}

/**
 * Renders the total number of slides as inline text.
 */
export function TotalSlides() {
  const { totalSlides } = useDeck();
  return <>{totalSlides}</>;
}
