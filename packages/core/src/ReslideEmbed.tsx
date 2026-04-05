import * as runtime from "react/jsx-runtime";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Fragment } from "react";
import type { ComponentType, ElementType } from "react";
import type { DeckProps, EmbeddedOptions } from "./Deck.js";

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
  /** Enable embedded mode with minimal control bar. Pass an object with sourceUrl to link to the original presentation. */
  embedded?: boolean | EmbeddedOptions;
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
  embedded,
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

  // Wait for two animation frames to ensure layout + paint are complete
  const waitForPaint = useCallback((fn: () => void) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(fn);
    });
  }, []);

  // After Content renders, wait for all images to load before showing
  const onContentRendered = useCallback(() => {
    const el = contentRef.current;
    if (!el) {
      waitForPaint(() => setReady(true));
      return;
    }

    const images = el.querySelectorAll("img");
    if (images.length === 0) {
      waitForPaint(() => setReady(true));
      return;
    }

    let loaded = 0;
    const total = images.length;
    let settled = false;

    const settle = () => {
      if (settled) return;
      settled = true;
      waitForPaint(() => setReady(true));
    };

    const onLoad = () => {
      loaded++;
      if (loaded >= total) settle();
    };

    // Fallback timeout — don't block rendering forever if images stall
    const timeout = setTimeout(settle, 5000);

    const onAllLoaded = () => {
      clearTimeout(timeout);
      settle();
    };

    for (const img of images) {
      if (img.complete) {
        onLoad();
      } else {
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onLoad, { once: true });
      }
    }

    // If all images were already complete, clear the timeout
    if (loaded >= total) onAllLoaded();
  }, [waitForPaint]);

  // Trigger image check after Content is set
  useEffect(() => {
    if (Content) {
      requestAnimationFrame(onContentRendered);
    }
  }, [Content, onContentRendered]);

  const DeckWithDesign = useMemo(() => {
    if (
      designWidth == null &&
      designHeight == null &&
      slideNumbers == null &&
      aspectRatio == null &&
      embedded == null
    )
      return Deck;
    return function DeckWithOverrides(props: DeckProps) {
      return (
        <Deck
          {...props}
          designWidth={designWidth ?? props.designWidth}
          designHeight={designHeight ?? props.designHeight}
          slideNumbers={slideNumbers ?? props.slideNumbers}
          aspectRatio={aspectRatio ?? props.aspectRatio}
          embedded={embedded ?? props.embedded}
        />
      );
    };
  }, [designWidth, designHeight, slideNumbers, aspectRatio, embedded]);

  // When aspectRatio is set, use it on the outermost container so the component
  // has an intrinsic height in flow layouts (e.g. blog articles).
  // When aspectRatio is 0 (fill parent), use height: 100% for the legacy behavior.
  const containerStyle: React.CSSProperties = {
    width: "100%",
    ...(aspectRatio != null && aspectRatio > 0
      ? { aspectRatio: String(aspectRatio) }
      : { height: "100%" }),
    ...style,
  };

  if (!Content) {
    return (
      <div className={className} style={containerStyle}>
        <SlideSkeleton />
      </div>
    );
  }

  const allComponents = { ...builtinComponents, Deck: DeckWithDesign, ...userComponents };

  const containerProps = css ? { [scopeAttr]: reslideId } : undefined;

  return (
    <div className={className} style={containerStyle} {...containerProps}>
      {/* Inject CSS before content so styles are parsed before first paint */}
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div
        ref={contentRef}
        style={{
          width: "100%",
          height: "100%",
          opacity: ready ? 1 : 0,
          visibility: ready ? "visible" : "hidden",
          transition: "opacity 0.2s ease-in, visibility 0.2s",
        }}
      >
        <Content components={allComponents as Record<string, ElementType>} />
      </div>
    </div>
  );
}

const skeletonKeyframes = `
@keyframes reslide-skeleton-pulse {
  0%, 100% { opacity: 0.08; }
  50% { opacity: 0.15; }
}`;

const skeletonBarStyle: React.CSSProperties = {
  backgroundColor: "var(--slide-text, #1a1a1a)",
  borderRadius: 6,
  animation: "reslide-skeleton-pulse 1.8s ease-in-out infinite",
};

/**
 * Skeleton placeholder displayed while MDX content is being evaluated.
 * Mimics a typical slide layout with a subtle pulse animation:
 * title bar, body text lines, and a page number indicator.
 */
function SlideSkeleton() {
  return (
    <div
      className="reslide-skeleton"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "var(--slide-bg, #fff)",
        position: "relative",
        padding: "7% 5%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: skeletonKeyframes }} />
      {/* Title bar — wide and tall */}
      <div style={{ ...skeletonBarStyle, width: "50%", height: "4.5%", marginBottom: "5%" }} />
      {/* Body lines — varying widths */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.2%" }}>
        <div style={{ ...skeletonBarStyle, width: "85%", height: "2%", animationDelay: "0.1s" }} />
        <div style={{ ...skeletonBarStyle, width: "60%", height: "2%", animationDelay: "0.2s" }} />
        <div style={{ ...skeletonBarStyle, width: "75%", height: "2%", animationDelay: "0.3s" }} />
        <div style={{ ...skeletonBarStyle, width: "55%", height: "2%", animationDelay: "0.4s" }} />
      </div>
      {/* Spacer */}
      <div style={{ flex: 1 }} />
      {/* Page number indicator — bottom right */}
      <div
        style={{
          ...skeletonBarStyle,
          width: "6%",
          height: "1.5%",
          alignSelf: "flex-end",
          animationDelay: "0.5s",
        }}
      />
    </div>
  );
}
