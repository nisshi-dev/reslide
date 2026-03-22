import { Children, isValidElement } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

import { useDeck } from "./context.js";

export interface TocProps {
  /** The slide elements to extract headings from */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Extract heading text (h1/h2) from a React element tree.
 * Traverses children recursively to find the first h1 or h2.
 */
function extractHeading(node: ReactNode): string | null {
  if (!isValidElement(node)) return null;

  const el = node as ReactElement<{ children?: ReactNode }>;
  const type = el.type;

  // Check if this element is an h1 or h2
  if (type === "h1" || type === "h2") {
    return extractText(el.props.children);
  }

  // Recurse into children
  const children = el.props.children;
  if (children == null) return null;

  let result: string | null = null;
  Children.forEach(children, (child) => {
    if (result) return; // already found
    const found = extractHeading(child);
    if (found) result = found;
  });

  return result;
}

/** Extract plain text from a React node tree */
function extractText(node: ReactNode): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

/**
 * Table of Contents component that renders a clickable list of slides
 * with their heading text extracted from h1/h2 elements.
 *
 * Must be rendered inside a `<Deck>` component.
 *
 * ```tsx
 * <Toc>
 *   <Slide><h1>Introduction</h1></Slide>
 *   <Slide><h2>Agenda</h2></Slide>
 * </Toc>
 * ```
 */
export function Toc({ children, className, style }: TocProps) {
  const { currentSlide, goTo } = useDeck();
  const slides = Children.toArray(children);

  const items = slides.map((slide, index) => {
    const heading = extractHeading(slide);
    return { index, title: heading || `Slide ${index + 1}` };
  });

  return (
    <nav
      className={`reslide-toc${className ? ` ${className}` : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        padding: "0.5rem 0",
        ...style,
      }}
    >
      {items.map((item) => {
        const isActive = item.index === currentSlide;
        return (
          <button
            key={item.index}
            type="button"
            onClick={() => goTo(item.index)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "0.875rem",
              lineHeight: 1.4,
              fontFamily: "inherit",
              color: isActive
                ? "var(--toc-active-text, var(--slide-accent, #16a34a))"
                : "var(--toc-text, var(--slide-text, #1a1a1a))",
              backgroundColor: isActive
                ? "var(--toc-active-bg, rgba(59, 130, 246, 0.1))"
                : "transparent",
              fontWeight: isActive ? 600 : 400,
              transition: "background-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "var(--toc-hover-bg, rgba(0, 0, 0, 0.05))";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isActive
                ? "var(--toc-active-bg, rgba(59, 130, 246, 0.1))"
                : "transparent";
            }}
          >
            <span
              style={{
                minWidth: "1.5rem",
                textAlign: "right",
                opacity: 0.5,
                fontSize: "0.75rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {item.index + 1}
            </span>
            <span>{item.title}</span>
          </button>
        );
      })}
    </nav>
  );
}
