import { useDeck } from "./context.js";

/**
 * Displays the current slide number.
 * Positioned inside the scale wrapper so it scales with slide content.
 * Customizable via CSS variables:
 *   --slide-number-bottom, --slide-number-right,
 *   --slide-number-font-size, --slide-number-letter-spacing,
 *   --slide-number-color
 */
export function SlideNumber() {
  const { currentSlide, totalSlides } = useDeck();

  return (
    <div
      className="reslide-slide-number"
      style={{
        position: "absolute",
        bottom: "var(--slide-number-bottom, 36px)",
        right: "var(--slide-number-right, 64px)",
        fontSize: "var(--slide-number-font-size, 16px)",
        letterSpacing: "var(--slide-number-letter-spacing, .08em)",
        fontVariantNumeric: "tabular-nums",
        color: "var(--slide-number-color, #ccc)",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {currentSlide + 1} / {totalSlides}
    </div>
  );
}
