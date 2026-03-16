import type { ReactNode } from "react";

import { useDeck } from "./context.js";

export interface NotesProps {
  children: ReactNode;
}

/**
 * Speaker notes. Hidden during normal presentation,
 * visible in overview mode.
 */
export function Notes({ children }: NotesProps) {
  const { isOverview } = useDeck();

  if (!isOverview) return null;

  return (
    <div
      className="reslide-notes"
      style={{
        marginTop: "auto",
        padding: "0.75rem",
        fontSize: "0.75rem",
        color: "var(--slide-text, #1a1a1a)",
        opacity: 0.7,
        borderTop: "1px solid currentColor",
      }}
    >
      {children}
    </div>
  );
}
