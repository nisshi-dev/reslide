import { useDeck } from "./context.js";

/**
 * Minimal control bar for embedded slide viewers.
 * Always visible at the bottom — inspired by SpeakerDeck/Canva embeds.
 *
 * Shows: prev/next arrows, slide counter, and an optional link to the source presentation.
 */
export function EmbeddedBar({ sourceUrl, scale = 1 }: { sourceUrl?: string; scale?: number }) {
  const { currentSlide, totalSlides, clickStep, totalClickSteps, next, prev } = useDeck();

  return (
    <div
      className="reslide-embedded-bar"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 0.5rem",
        height: "2.25rem",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        color: "#e2e8f0",
        fontSize: "0.8125rem",
        fontFamily: "system-ui, sans-serif",
        fontVariantNumeric: "tabular-nums",
        zIndex: 200,
        transform: `scale(${1 / scale})`,
        transformOrigin: "bottom left",
        width: `${scale * 100}%`,
      }}
    >
      {/* Left section: navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.125rem" }}>
        <EmbeddedButton onClick={prev} title="Previous">
          <ArrowIcon direction="left" />
        </EmbeddedButton>

        <span style={{ padding: "0 0.375rem", userSelect: "none", whiteSpace: "nowrap" }}>
          {currentSlide + 1} / {totalSlides}
          {clickStep > 0 && totalClickSteps > 0 && (
            <span style={{ opacity: 0.6, marginLeft: "0.25rem" }}>
              ({clickStep}/{totalClickSteps})
            </span>
          )}
        </span>

        <EmbeddedButton onClick={next} title="Next">
          <ArrowIcon direction="right" />
        </EmbeddedButton>
      </div>

      {/* Right section: source link */}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open presentation"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "1.75rem",
            height: "1.75rem",
            color: "#cbd5e1",
            borderRadius: "0.25rem",
            transition: "color 0.15s",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#cbd5e1";
          }}
        >
          <ExternalLinkIcon />
        </a>
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
        width: "1.75rem",
        height: "1.75rem",
        background: "none",
        border: "none",
        borderRadius: "0.25rem",
        cursor: "pointer",
        color: "#cbd5e1",
        transition: "background 0.15s, color 0.15s",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
      }}
    >
      {children}
    </button>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
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

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
