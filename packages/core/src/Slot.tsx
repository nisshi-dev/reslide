import type { ReactNode } from "react";

export interface SlotProps {
  children: ReactNode;
}

/**
 * Marks content as belonging to the right column in a two-cols layout.
 * Used by remarkSlides to separate `::right` content.
 */
export function SlotRight({ children }: SlotProps) {
  return <>{children}</>;
}

// Tag for runtime identification
SlotRight.displayName = "SlotRight";
SlotRight.__reslideSlot = "right" as const;
