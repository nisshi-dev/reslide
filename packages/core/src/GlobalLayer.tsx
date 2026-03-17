import type { CSSProperties, ReactNode } from "react";

export interface GlobalLayerProps {
  children: ReactNode;
  /** z-index position: 'above' renders on top of slides, 'below' renders behind */
  position?: "above" | "below";
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * Global overlay layer that persists across all slides.
 * Use for headers, footers, logos, watermarks, or progress bars.
 *
 * Place inside <Deck> to render on every slide.
 *
 * @example
 * ```tsx
 * <Deck>
 *   <GlobalLayer position="above" style={{ bottom: 0 }}>
 *     <footer>My Company</footer>
 *   </GlobalLayer>
 *   <Slide>...</Slide>
 * </Deck>
 * ```
 */
export function GlobalLayer({ children, position = "above", style }: GlobalLayerProps) {
  return (
    <div
      className={`reslide-global-layer reslide-global-layer-${position}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: position === "above" ? 40 : 0,
        ...style,
      }}
    >
      <div style={{ pointerEvents: "auto" }}>{children}</div>
    </div>
  );
}

// Tag for Deck to identify GlobalLayer children
GlobalLayer.displayName = "GlobalLayer";
GlobalLayer.__reslideGlobalLayer = true as const;
