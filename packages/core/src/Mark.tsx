import type { CSSProperties, ReactNode } from "react";

export interface MarkProps {
  children: ReactNode;
  /** Mark style type */
  type?: "highlight" | "underline" | "circle";
  /** Color name (maps to CSS variable or direct color) */
  color?: string;
}

const markStyles: Record<string, (colorName: string, resolvedColor: string) => CSSProperties> = {
  highlight: (colorName, resolvedColor) => ({
    backgroundColor: `var(--mark-${colorName}, ${resolvedColor})`,
    padding: "0.1em 0.2em",
    borderRadius: "0.2em",
  }),
  underline: (colorName, resolvedColor) => ({
    textDecoration: "underline",
    textDecorationColor: `var(--mark-${colorName}, ${resolvedColor})`,
    textDecorationThickness: "0.15em",
    textUnderlineOffset: "0.15em",
  }),
  circle: (colorName, resolvedColor) => ({
    border: `0.15em solid var(--mark-${colorName}, ${resolvedColor})`,
    borderRadius: "50%",
    padding: "0.1em 0.3em",
  }),
};

const defaultColors: Record<string, string> = {
  orange: "#fb923c",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#facc15",
  purple: "#a855f7",
};

export function Mark({ children, type = "highlight", color = "yellow" }: MarkProps) {
  const resolvedColor = defaultColors[color] ?? color;
  const styleFn = markStyles[type] ?? markStyles.highlight;

  return (
    <span className={`reslide-mark reslide-mark-${type}`} style={styleFn(color, resolvedColor)}>
      {children}
    </span>
  );
}
