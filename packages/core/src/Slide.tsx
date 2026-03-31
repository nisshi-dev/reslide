import { Children, isValidElement } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

export interface SlideProps {
  children: ReactNode;
  /** Layout variant for the slide */
  layout?: string;
  /** Image URL for image-right / image-left layouts */
  image?: string;
  /** Image width for image-right / image-left (e.g. "40%", "600px"). Default: "50%" */
  imageWidth?: string;
  /** Column ratio for two-cols layout (e.g. "6/4", "7/3"). Default: "1/1" */
  cols?: string;
  /** Background style (color, gradient, or image URL) */
  background?: string;
  /** CSS string from frontmatter (e.g. "background: red; color: white;") — parsed to CSSProperties */
  cssStyle?: string;
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

function parseCols(cols?: string): [number, number] {
  if (!cols) return [1, 1];
  const parts = cols.split("/").map(Number);
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) return [parts[0], parts[1]];
  return [1, 1];
}

function parseCssString(css?: string): CSSProperties | undefined {
  if (!css) return undefined;
  const result: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = decl.slice(0, colonIdx).trim();
    const value = decl.slice(colonIdx + 1).trim();
    if (!prop || !value) continue;
    const camelProp = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    result[camelProp] = value;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export function Slide({
  children,
  layout = "default",
  image,
  imageWidth,
  cols,
  background,
  cssStyle,
  className,
  style,
}: SlideProps) {
  const cls = `reslide-slide reslide-layout-${layout}${className ? ` ${className}` : ""}`;
  const parsedCssStyle = parseCssString(cssStyle);
  const mergedStyle: CSSProperties | undefined =
    parsedCssStyle || style ? { ...parsedCssStyle, ...style } : style;

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
            ...mergedStyle,
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
            ...mergedStyle,
          }}
        >
          {children}
        </div>
      );

    case "two-cols": {
      const { left, right } = splitChildren(children);
      const [leftFlex, rightFlex] = parseCols(cols);
      return (
        <div
          className={cls}
          style={{
            ...baseStyle,
            flexDirection: "row",
            gap: "80px",
            padding: "72px 100px",
            ...bgStyle,
            ...mergedStyle,
          }}
        >
          <div style={{ flex: leftFlex, minWidth: 0 }}>{left}</div>
          <div style={{ flex: rightFlex, minWidth: 0 }}>{right}</div>
        </div>
      );
    }

    case "image-right":
      return (
        <div
          className={cls}
          style={{ ...baseStyle, flexDirection: "row", ...bgStyle, ...mergedStyle }}
        >
          <div style={{ flex: 1, padding: "72px 40px 72px 100px", overflow: "auto" }}>
            {children}
          </div>
          {image && (
            <div
              style={{
                width: imageWidth ?? "50%",
                flexShrink: 0,
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
        <div
          className={cls}
          style={{ ...baseStyle, flexDirection: "row", ...bgStyle, ...mergedStyle }}
        >
          {image && (
            <div
              style={{
                width: imageWidth ?? "50%",
                flexShrink: 0,
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
            ...mergedStyle,
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
            ...mergedStyle,
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
            ...mergedStyle,
          }}
        >
          {children}
        </div>
      );
  }
}
