import * as runtime from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Fragment } from "react";
import type { ComponentType } from "react";

import { Click, ClickSteps } from "./Click.js";
import { Deck } from "./Deck.js";
import { Draggable } from "./Draggable.js";
import { GlobalLayer } from "./GlobalLayer.js";
import { Mark } from "./Mark.js";
import { Notes } from "./Notes.js";
import { Slide } from "./Slide.js";
import type { TransitionType } from "./SlideTransition.js";
import { SlotRight } from "./Slot.js";

export interface ReslideEmbedProps {
  /** Compiled MDX code from compileMdxSlides() */
  code: string;
  /** Slide transition type */
  transition?: TransitionType;
  /** Additional MDX components to provide */
  components?: Record<string, ComponentType<any>>;
  /** Wrapper around the Deck (for styling) */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
}

/** Built-in reslide components available in MDX */
const builtinComponents = {
  Deck,
  Slide,
  Click,
  ClickSteps,
  Mark,
  Notes,
  SlotRight,
  GlobalLayer,
  Draggable,
};

/**
 * Renders compiled MDX slides as a full reslide presentation.
 *
 * Usage:
 * ```tsx
 * // Server component
 * import { compileMdxSlides } from '@reslide/mdx'
 * const { code } = await compileMdxSlides(mdxSource)
 *
 * // Client component
 * import { ReslideEmbed } from '@reslide/core'
 * <ReslideEmbed code={code} transition="fade" />
 * ```
 */
export function ReslideEmbed({
  code,
  transition,
  components: userComponents,
  className,
  style,
}: ReslideEmbedProps) {
  const [Content, setContent] = useState<ComponentType<{
    components?: Record<string, ComponentType<any>>;
  }> | null>(null);

  useEffect(() => {
    async function evaluate() {
      const { run } = await import("@mdx-js/mdx");
      const mod = await run(code, {
        ...(runtime as Record<string, unknown>),
        Fragment,
        baseUrl: import.meta.url,
      });
      setContent(
        () => mod.default as ComponentType<{ components?: Record<string, ComponentType<any>> }>,
      );
    }
    void evaluate();
  }, [code]);

  if (!Content) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          ...style,
        }}
      >
        <div style={{ opacity: 0.5 }}>Loading slides...</div>
      </div>
    );
  }

  const allComponents = { ...builtinComponents, ...userComponents };

  // The MDX output from compileMdxSlides wraps everything in <Deck><Slide>...</Slide></Deck>
  // via remarkSlides. We render it directly — the Deck is inside the MDX.
  return (
    <div className={className} style={{ width: "100%", height: "100%", ...style }}>
      <Content components={allComponents as unknown as Record<string, ComponentType<any>>} />
    </div>
  );
}
