import type { CSSProperties, ReactNode } from "react";

export interface MarkProps {
  children: ReactNode;
  /** Mark style type */
  type?: "highlight" | "underline" | "circle";
  /** Color name (maps to CSS variable or direct color) */
  color?: string;
}

const markStyles: Record<string, (color: string) => CSSProperties> = {
  highlight: (color) => ({
    backgroundColor: `var(--mark-${color}, ${color})`,
    padding: "0.1em 0.2em",
    borderRadius: "0.2em",
  }),
  underline: (color) => ({
    textDecoration: "underline",
    textDecorationColor: `var(--mark-${color}, ${color})`,
    textDecorationThickness: "0.15em",
    textUnderlineOffset: "0.15em",
  }),
  circle: (color) => ({
    border: `0.15em solid var(--mark-${color}, ${color})`,
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
    <span className={`reslide-mark reslide-mark-${type}`} style={styleFn(resolvedColor)}>
      {children}
    </span>
  );
}
