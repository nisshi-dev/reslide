import { Children, isValidElement } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

export interface SlideProps {
  children: ReactNode;
  /** Layout variant for the slide */
  layout?: string;
  /** Image URL for image-right / image-left layouts */
  image?: string;
  /** Background style (color, gradient, or image URL) */
  background?: string;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

const baseStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  boxSizing: "border-box",
  overflow: "hidden",
  position: "relative",
};

function isSlotRight(child: ReactNode): child is ReactElement {
  return (
    isValidElement(child) &&
    typeof child.type === "function" &&
    "__reslideSlot" in child.type &&
    child.type.__reslideSlot === "right"
  );
}

function splitChildren(children: ReactNode): { left: ReactNode[]; right: ReactNode[] } {
  const left: ReactNode[] = [];
  const right: ReactNode[] = [];
  let inRight = false;

  Children.forEach(children, (child) => {
    if (isSlotRight(child)) {
      inRight = true;
      right.push((child.props as { children?: ReactNode }).children);
      return;
    }
    if (inRight) {
      right.push(child);
    } else {
      left.push(child);
    }
  });

  return { left, right };
}

export function Slide({
  children,
  layout = "default",
  image,
  background,
  className,
  style,
}: SlideProps) {
  const cls = `reslide-slide reslide-layout-${layout}${className ? ` ${className}` : ""}`;

  const bgStyle: CSSProperties | undefined = background
    ? background.startsWith("url(")
      ? { background: `${background} no-repeat center/cover` }
      : { backgroundColor: background }
    : undefined;

  switch (layout) {
    case "none":
      return (
        <div
          className={cls}
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
            ...bgStyle,
            ...style,
          }}
        >
          {children}
        </div>
      );

    case "center":
      return (
        <div
          className={cls}
          style={{
            ...baseStyle,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "72px 100px",
            ...bgStyle,
            ...style,
          }}
        >
          {children}
        </div>
      );

    case "two-cols": {
      const { left, right } = splitChildren(children);
      return (
        <div
          className={cls}
          style={{
            ...baseStyle,
            flexDirection: "row",
            gap: "80px",
            padding: "72px 100px",
            ...bgStyle,
            ...style,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>{left}</div>
          <div style={{ flex: 1, minWidth: 0 }}>{right}</div>
        </div>
      );
    }

    case "image-right":
      return (
        <div className={cls} style={{ ...baseStyle, flexDirection: "row", ...bgStyle, ...style }}>
          <div style={{ flex: 1, padding: "72px 40px 72px 100px", overflow: "auto" }}>
            {children}
          </div>
          {image && (
            <div
              style={{
                flex: 1,
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
        </div>
      );

    case "image-left":
      return (
        <div className={cls} style={{ ...baseStyle, flexDirection: "row", ...bgStyle, ...style }}>
          {image && (
            <div
              style={{
                flex: 1,
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div style={{ flex: 1, padding: "72px 100px 72px 40px", overflow: "auto" }}>
            {children}
          </div>
        </div>
      );

    case "section":
      return (
        <div
          className={cls}
          style={{
            ...baseStyle,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "72px 100px",
            backgroundColor: "var(--slide-accent, #16a34a)",
            color: "var(--slide-section-text, #fff)",
            ...bgStyle,
            ...style,
          }}
        >
          {children}
        </div>
      );

    case "quote":
      return (
        <div
          className={cls}
          style={{
            ...baseStyle,
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 150px",
            ...bgStyle,
            ...style,
          }}
        >
          <blockquote
            style={{
              fontSize: "1.5em",
              fontStyle: "italic",
              borderLeft: "4px solid var(--slide-accent, #16a34a)",
              paddingLeft: "1.5rem",
              margin: 0,
            }}
          >
            {children}
          </blockquote>
        </div>
      );

    default:
      return (
        <div
          className={cls}
          style={{
            ...baseStyle,
            flexDirection: "column",
            padding: "72px 100px",
            ...bgStyle,
            ...style,
          }}
        >
          {children}
        </div>
      );
  }
}
