import { useDeck } from "./context.js";

/**
 * Displays the current slide number in the bottom-right corner.
 * Automatically reads state from DeckContext.
 */
export function SlideNumber() {
  const { currentSlide, totalSlides } = useDeck();

  return (
    <div
      className="reslide-slide-number"
      style={{
        position: "absolute",
        bottom: "0.75rem",
        right: "1rem",
        fontSize: "0.75rem",
        fontFamily: "system-ui, sans-serif",
        fontVariantNumeric: "tabular-nums",
        color: "var(--slide-text, #1a1a1a)",
        opacity: 0.4,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {currentSlide + 1} / {totalSlides}
    </div>
  );
}
