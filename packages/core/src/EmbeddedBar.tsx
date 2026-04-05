import { useCallback, useEffect, useRef, useState } from "react";

import { useDeck } from "./context.js";

/**
 * Minimal control bar for embedded slide viewers.
 * Hidden by default — appears on hover/touch with a slide-up animation.
 * Positioned at the bottom-center as a compact pill-shaped bar.
 */
export function EmbeddedBar({ sourceUrl, scale = 1 }: { sourceUrl?: string; scale?: number }) {
  const { currentSlide, totalSlides, clickStep, totalClickSteps, next, prev } = useDeck();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2500);
  }, []);

  // Show on mouse enter over the deck area (parent has position: relative)
  useEffect(() => {
    const deck = barRef.current?.closest(".reslide-deck");
    if (!deck) return;

    const handleEnter = () => show();
    const handleLeave = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 800);
    };

    deck.addEventListener("mouseenter", handleEnter);
    deck.addEventListener("mouseleave", handleLeave);
    // Show briefly on touch
    deck.addEventListener("touchstart", handleEnter, { passive: true });

    return () => {
      deck.removeEventListener("mouseenter", handleEnter);
      deck.removeEventListener("mouseleave", handleLeave);
      deck.removeEventListener("touchstart", handleEnter);
    };
  }, [show]);

  // Keep visible while hovering over the bar itself
  const handleBarEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
  };
  const handleBarLeave = () => {
    timerRef.current = setTimeout(() => setVisible(false), 1200);
  };

  return (
    <div
      ref={barRef}
      className="reslide-embedded-bar"
      onMouseEnter={handleBarEnter}
      onMouseLeave={handleBarLeave}
      style={{
        position: "absolute",
        bottom: 8 / scale,
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "0.5rem"}) scale(${1 / scale})`,
        transformOrigin: "bottom center",
        display: "flex",
        alignItems: "center",
        gap: "0.125rem",
        padding: "0.25rem 0.5rem",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "1.5rem",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        zIndex: 200,
        color: "#e2e8f0",
        fontSize: "0.75rem",
        fontFamily: "system-ui, sans-serif",
        fontVariantNumeric: "tabular-nums",
        userSelect: "none",
      }}
    >
      <EmbeddedButton onClick={prev} title="Previous">
        <ArrowIcon direction="left" />
      </EmbeddedButton>

      <span
        style={{
          padding: "0 0.375rem",
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        }}
      >
        {currentSlide + 1}
        <span style={{ opacity: 0.4, margin: "0 0.125rem" }}>/</span>
        {totalSlides}
        {clickStep > 0 && totalClickSteps > 0 && (
          <span style={{ opacity: 0.4, marginLeft: "0.25rem", fontSize: "0.625rem" }}>
            {clickStep}/{totalClickSteps}
          </span>
        )}
      </span>

      <EmbeddedButton onClick={next} title="Next">
        <ArrowIcon direction="right" />
      </EmbeddedButton>

      {sourceUrl && (
        <>
          <div
            style={{
              width: 1,
              height: "0.875rem",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              margin: "0 0.125rem",
            }}
          />
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open presentation"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "1.5rem",
              height: "1.5rem",
              color: "rgba(203, 213, 225, 0.7)",
              borderRadius: "50%",
              transition: "color 0.15s, background 0.15s",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(203, 213, 225, 0.7)";
              e.currentTarget.style.background = "none";
            }}
          >
            <ExternalLinkIcon />
          </a>
        </>
      )}
    </div>
  );
}

function EmbeddedButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1.5rem",
        height: "1.5rem",
        background: "none",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        color: "rgba(203, 213, 225, 0.8)",
        transition: "background 0.15s, color 0.15s",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
        e.currentTarget.style.color = "rgba(203, 213, 225, 0.8)";
      }}
    >
      {children}
    </button>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 6 15 12 9 18" />
      )}
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
