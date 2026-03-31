import * as runtime from "react/jsx-runtime";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Fragment } from "react";
import type { ComponentType, ElementType } from "react";
import type { DeckProps } from "./Deck.js";

import { Click, ClickSteps } from "./Click.js";
import { CodeEditor } from "./CodeEditor.js";
import { Deck } from "./Deck.js";
import { Draggable } from "./Draggable.js";
import { GlobalLayer } from "./GlobalLayer.js";
import { Mark } from "./Mark.js";
import { Mermaid } from "./Mermaid.js";
import { Notes } from "./Notes.js";
import { Slide } from "./Slide.js";
import type { TransitionType } from "./SlideTransition.js";
import { SlideIndex, TotalSlides } from "./SlideInfo.js";
import { SlotRight } from "./Slot.js";
import { Toc } from "./Toc.js";

export interface ReslideEmbedProps {
  /** Compiled MDX code from compileMdxSlides() */
  code: string;
  /** Slide transition type */
  transition?: TransitionType;
  /** Additional MDX components to provide */
  components?: Record<string, ElementType>;
  /** Base URL for resolving relative imports in MDX (e.g. directory URL of the MDX file) */
  baseUrl?: string;
  /** Design width for scaling (default: 1920) */
  designWidth?: number;
  /** Design height for scaling (default: 1080) */
  designHeight?: number;
  /** Show slide numbers. true=all, false=none, "except-first"=hide on first slide */
  slideNumbers?: boolean | "except-first";
  /** Aspect ratio (default: 16/9). Set to 0 to disable and fill parent. */
  aspectRatio?: number;
  /** Wrapper around the Deck (for styling) */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /** CSS string extracted from MDX <style> tags and CSS imports */
  css?: string;
  /** Enable CSS scoping to prevent style leakage (default: true) */
  scopeCss?: boolean;
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
  Mermaid,
  Toc,
  CodeEditor,
  SlideIndex,
  TotalSlides,
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
  transition: _transition,
  components: userComponents,
  baseUrl,
  designWidth,
  designHeight,
  slideNumbers,
  aspectRatio,
  className,
  style,
  css,
  scopeCss: scopeCssEnabled = true,
}: ReslideEmbedProps) {
  const reslideId = useId();
  const scopeAttr = `data-reslide-id`;

  const scopedCss = useMemo(() => {
    if (!css) return undefined;
    if (!scopeCssEnabled) return css;
    // Use @scope for robust CSS scoping
    return `@scope ([${scopeAttr}="${reslideId}"]) {\n${css}\n}`;
  }, [css, scopeCssEnabled, reslideId, scopeAttr]);

  const [Content, setContent] = useState<ComponentType<{
    components?: Record<string, ElementType>;
  }> | null>(null);
  const [ready, setReady] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReady(false);
    async function evaluate() {
      const { run } = await import("@mdx-js/mdx");
      const mod = await run(code, {
        ...(runtime as Record<string, unknown>),
        Fragment,
        baseUrl: baseUrl ?? import.meta.url,
      });
      setContent(() => mod.default as ComponentType<{ components?: Record<string, ElementType> }>);
    }
    void evaluate();
  }, [code, baseUrl]);

  // After Content renders, wait for all images to load before showing
  const onContentRendered = useCallback(() => {
    const el = contentRef.current;
    if (!el) {
      setReady(true);
      return;
    }

    const images = el.querySelectorAll("img");
    if (images.length === 0) {
      requestAnimationFrame(() => setReady(true));
      return;
    }

    let loaded = 0;
    const total = images.length;
    const onLoad = () => {
      loaded++;
      if (loaded >= total) setReady(true);
    };

    for (const img of images) {
      if (img.complete) {
        onLoad();
      } else {
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onLoad, { once: true });
      }
    }
  }, []);

  // Trigger image check after Content is set
  useEffect(() => {
    if (Content) {
      requestAnimationFrame(onContentRendered);
    }
  }, [Content, onContentRendered]);

  const DeckWithDesign = useMemo(() => {
    if (designWidth == null && designHeight == null && slideNumbers == null && aspectRatio == null)
      return Deck;
    return function DeckWithOverrides(props: DeckProps) {
      return (
        <Deck
          {...props}
          designWidth={designWidth ?? props.designWidth}
          designHeight={designHeight ?? props.designHeight}
          slideNumbers={slideNumbers ?? props.slideNumbers}
          aspectRatio={aspectRatio ?? props.aspectRatio}
        />
      );
    };
  }, [designWidth, designHeight, slideNumbers, aspectRatio]);

  if (!Content) {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          height: "100%",
          ...style,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "var(--slide-bg, #fff)",
          }}
        />
      </div>
    );
  }

  const allComponents = { ...builtinComponents, Deck: DeckWithDesign, ...userComponents };

  // The MDX output from compileMdxSlides wraps everything in <Deck><Slide>...</Slide></Deck>
  // via remarkSlides. We render it directly — the Deck is inside the MDX.
  // CSS is injected via dangerouslySetInnerHTML because React does not support
  // rendering text children inside <style> elements. The CSS originates from the
  // author's own MDX source (compile-time extraction), not from untrusted user input.
  const containerProps = css ? { [scopeAttr]: reslideId } : undefined;

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
      {...containerProps}
    >
      <div
        ref={contentRef}
        style={{
          width: "100%",
          height: "100%",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.2s ease-in",
        }}
      >
        {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
        <Content components={allComponents as Record<string, ElementType>} />
      </div>
    </div>
  );
}
