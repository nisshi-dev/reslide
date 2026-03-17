import { useCallback, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export interface DraggableProps {
  children: ReactNode;
  /** Initial x position (px or %) */
  x?: number | string;
  /** Initial y position (px or %) */
  y?: number | string;
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * A draggable element within a slide.
 * Click and drag to reposition during presentation.
 */
export function Draggable({ children, x = 0, y = 0, style }: DraggableProps) {
  const [pos, setPos] = useState({
    x: typeof x === "number" ? x : 0,
    y: typeof y === "number" ? y : 0,
  });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
      };

      function onMouseMove(me: MouseEvent) {
        if (!dragRef.current) return;
        setPos({
          x: dragRef.current.origX + (me.clientX - dragRef.current.startX),
          y: dragRef.current.origY + (me.clientY - dragRef.current.startY),
        });
      }

      function onMouseUp() {
        dragRef.current = null;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      }

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [pos.x, pos.y],
  );

  return (
    <div
      className="reslide-draggable"
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: typeof x === "string" ? x : undefined,
        top: typeof y === "string" ? y : undefined,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        cursor: "grab",
        userSelect: "none",
        zIndex: 30,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
