import { useCallback, useEffect, useRef, useState } from "react";

export interface PointerProps {
  /** Whether pointer mode is active */
  active: boolean;
  /** Pointer color (default: uses --slide-accent or #16a34a) */
  color?: string;
  /** Pointer diameter in pixels */
  size?: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

let rippleId = 0;

/**
 * Presentation pointer — a large colored circle that follows the cursor.
 * Clicking creates an expanding ripple effect to highlight a point.
 * Toggle with `q` key (handled in Deck).
 */
export function Pointer({ active, color, size = 24 }: PointerProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPos = useCallback((e: MouseEvent) => {
    const container = containerRef.current?.parentElement;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!active) return;
      setPos(getPos(e));
    },
    [active, getPos],
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!active) return;
      const p = getPos(e);
      if (!p) return;
      const id = ++rippleId;
      setRipples((prev) => [...prev, { id, x: p.x, y: p.y }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500);
    },
    [active, getPos],
  );

  const handleMouseLeave = useCallback(() => setPos(null), []);

  useEffect(() => {
    if (!active) {
      setPos(null);
      setRipples([]);
      return;
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick, true);
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [active, handleMouseMove, handleClick, handleMouseLeave]);

  const resolvedColor = color ?? "var(--slide-accent, #16a34a)";

  return (
    <>
      <style>{`
        @keyframes reslide-pointer-ripple {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 45,
          overflow: "hidden",
        }}
      >
        {active && pos && (
          <div
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: resolvedColor,
              opacity: 0.7,
              transform: "translate(-50%, -50%)",
              willChange: "left, top",
            }}
          />
        )}
        {ripples.map((r) => (
          <div
            key={r.id}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: size * 3,
              height: size * 3,
              borderRadius: "50%",
              border: `2px solid ${resolvedColor}`,
              animation: "reslide-pointer-ripple 0.5s ease-out forwards",
            }}
          />
        ))}
      </div>
    </>
  );
}
