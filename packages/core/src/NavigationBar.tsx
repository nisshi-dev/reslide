import { useCallback, useEffect, useRef, useState } from "react";

import { useDeck } from "./context.js";
import { openPresenterWindow } from "./use-presenter.js";

/**
 * Slidev-style navigation bar that appears on hover at the bottom of the presentation.
 * Provides buttons for prev/next, overview, fullscreen, presenter, and drawing modes.
 */
export function NavigationBar({
  isDrawing,
  onToggleDrawing,
}: {
  isDrawing: boolean;
  onToggleDrawing: () => void;
}) {
  const {
    currentSlide,
    totalSlides,
    clickStep,
    totalClickSteps,
    isOverview,
    isFullscreen,
    next,
    prev,
    toggleOverview,
    toggleFullscreen,
  } = useDeck();

  const handlePrint = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "print");
    window.open(url.toString(), "_blank");
  }, []);

  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const showBar = useCallback(() => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  // Show bar when mouse moves near the bottom
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const threshold = window.innerHeight - 80;
      if (e.clientY > threshold) {
        showBar();
      }
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [showBar]);

  // Keep visible while hovering over the bar itself
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
  };
  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setVisible(false), 1500);
  };

  return (
    <div
      ref={barRef}
      className="reslide-navbar"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "100%"})`,
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.375rem 0.75rem",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
        borderRadius: "0.5rem 0.5rem 0 0",
        transition: "transform 0.25s ease, opacity 0.25s ease",
        opacity: visible ? 1 : 0,
        zIndex: 200,
        color: "#e2e8f0",
        fontSize: "0.8125rem",
        fontFamily: "system-ui, sans-serif",
        fontVariantNumeric: "tabular-nums",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Prev */}
      <NavButton onClick={prev} title="Previous (←)" disabled={isOverview}>
        <ArrowIcon direction="left" />
      </NavButton>

      {/* Slide counter */}
      <span style={{ padding: "0 0.5rem", userSelect: "none", whiteSpace: "nowrap" }}>
        {currentSlide + 1} / {totalSlides}
        {clickStep > 0 && totalClickSteps > 0 && (
          <span style={{ opacity: 0.6, marginLeft: "0.25rem" }}>
            ({clickStep}/{totalClickSteps})
          </span>
        )}
      </span>

      {/* Next */}
      <NavButton onClick={next} title="Next (→ / Space)" disabled={isOverview}>
        <ArrowIcon direction="right" />
      </NavButton>

      <Divider />

      {/* Overview */}
      <NavButton onClick={toggleOverview} title="Overview (Esc)" active={isOverview}>
        <GridIcon />
      </NavButton>

      {/* Fullscreen */}
      <NavButton onClick={toggleFullscreen} title="Fullscreen (f)" active={isFullscreen}>
        <FullscreenIcon expanded={isFullscreen} />
      </NavButton>

      {/* Presenter */}
      <NavButton onClick={openPresenterWindow} title="Presenter (p)">
        <PresenterIcon />
      </NavButton>

      {/* Drawing */}
      <NavButton onClick={onToggleDrawing} title="Drawing (d)" active={isDrawing}>
        <PenIcon />
      </NavButton>

      <Divider />

      {/* Print / PDF */}
      <NavButton onClick={handlePrint} title="Print / PDF (Cmd+P)">
        <PrintIcon />
      </NavButton>
    </div>
  );
}

function NavButton({
  children,
  onClick,
  title,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2rem",
        height: "2rem",
        background: active ? "rgba(255,255,255,0.2)" : "none",
        border: "none",
        borderRadius: "0.25rem",
        cursor: disabled ? "default" : "pointer",
        color: active ? "#fff" : "#cbd5e1",
        opacity: disabled ? 0.4 : 1,
        transition: "background 0.15s, color 0.15s",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active ? "rgba(255,255,255,0.2)" : "none";
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: "1.25rem",
        backgroundColor: "rgba(255,255,255,0.2)",
        margin: "0 0.25rem",
      }}
    />
  );
}

// --- SVG Icons ---

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function FullscreenIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {expanded ? (
        <>
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="14" y1="10" x2="21" y2="3" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </>
      ) : (
        <>
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </>
      )}
    </svg>
  );
}

function PresenterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
