import { useCallback, useState } from "react";

interface ClickNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}

/**
 * Invisible click zones on the left/right edges of the slide.
 * Clicking the left ~15% goes to the previous slide,
 * clicking the right ~15% goes to the next slide.
 * Shows a gradient overlay and arrow indicator on hover (docswell style).
 */
export function ClickNavigation({ onPrev, onNext, disabled }: ClickNavigationProps) {
  if (disabled) return null;

  return (
    <>
      <NavZone direction="prev" onClick={onPrev} />
      <NavZone direction="next" onClick={onNext} />
    </>
  );
}

function NavZone({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isPrev = direction === "prev";

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.currentTarget.blur();
      onClick();
    },
    [onClick],
  );

  const gradient = isPrev
    ? "linear-gradient(to right, rgba(0,0,0,0.08), transparent)"
    : "linear-gradient(to left, rgba(0,0,0,0.08), transparent)";

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isPrev ? "Previous slide" : "Next slide"}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [isPrev ? "left" : "right"]: 0,
        width: "15%",
        background: hovered ? gradient : "none",
        border: "none",
        outline: "none",
        cursor: "pointer",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: isPrev ? "flex-start" : "flex-end",
        padding: "0 1.5rem",
        transition: "background 0.25s ease",
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          color: "var(--slide-text, #1a1a1a)",
          opacity: hovered ? 0.6 : 0,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
          transform: isPrev ? "none" : "rotate(180deg)",
          transition: "opacity 0.25s ease",
        }}
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}
