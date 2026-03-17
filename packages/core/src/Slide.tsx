import type { CSSProperties, ReactNode } from "react";

export interface SlideProps {
  children: ReactNode;
  /** Layout variant for the slide */
  layout?: string;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

export function Slide({ children, layout = "default", className, style }: SlideProps) {
  return (
    <div
      className={`reslide-slide reslide-layout-${layout}${className ? ` ${className}` : ""}`}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: layout === "center" ? "center" : "flex-start",
        alignItems: layout === "center" ? "center" : "stretch",
        padding: "3rem 4rem",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
