import { useDeck } from "./context.js";

export function ProgressBar() {
  const { currentSlide, totalSlides, clickStep, totalClickSteps } = useDeck();

  // Calculate progress including click steps within each slide.
  // Each slide is one unit, and click steps subdivide the current slide's unit.
  const slideProgress = totalSlides <= 1 ? 1 : currentSlide / (totalSlides - 1);
  const clickFraction =
    totalSlides <= 1
      ? 0
      : totalClickSteps > 0
        ? (clickStep / totalClickSteps) * (1 / (totalSlides - 1))
        : 0;
  const progress = Math.min(slideProgress + clickFraction, 1);

  return (
    <div
      className="reslide-progress-bar"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "var(--slide-progress-height, 6px)",
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          backgroundColor: "var(--slide-progress, #16a34a)",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}
