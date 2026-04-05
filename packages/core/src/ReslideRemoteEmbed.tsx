"use client";

import { useEffect, useState } from "react";
import { ReslideEmbed } from "./ReslideEmbed.js";
import type { TransitionType } from "./SlideTransition.js";

type RemoteSlideData = {
  code: string;
  css?: string;
  transition?: string;
  baseUrl?: string;
  designWidth?: number;
  designHeight?: number;
};

export interface ReslideRemoteEmbedProps {
  /** URL that returns compiled slide data as JSON */
  url: string;
  /** Aspect ratio (default: 16/9) */
  aspectRatio?: number;
  /** Show slide numbers */
  slideNumbers?: boolean | "except-first";
  /** Wrapper className */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /** Custom loading UI */
  fallback?: React.ReactNode;
  /** Custom error UI */
  errorFallback?: React.ReactNode | ((error: Error) => React.ReactNode);
}

// Hardcoded CSS keyframe for the skeleton pulse animation.
// This is NOT user-supplied content — safe to inject via dangerouslySetInnerHTML,
// consistent with the existing SlideSkeleton in ReslideEmbed.tsx.
const skeletonKeyframes = `
@keyframes reslide-remote-skeleton-pulse {
  0%, 100% { opacity: 0.08; }
  50% { opacity: 0.15; }
}`;

function DefaultSkeleton({ aspectRatio }: { aspectRatio: number }) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: `${aspectRatio}`,
        backgroundColor: "var(--slide-bg, #f0f0f0)",
        borderRadius: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: skeletonKeyframes }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--slide-text, #1a1a1a)",
          animation: "reslide-remote-skeleton-pulse 1.8s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function DefaultError({ error }: { error: Error }) {
  return (
    <div
      style={{
        padding: "1rem",
        color: "#dc2626",
        backgroundColor: "#fef2f2",
        borderRadius: 8,
        border: "1px solid #fecaca",
        fontSize: "0.875rem",
      }}
    >
      Failed to load slides: {error.message}
    </div>
  );
}

/**
 * Fetches compiled slide data from a URL and renders it with ReslideEmbed.
 *
 * Usage:
 * ```tsx
 * <ReslideRemoteEmbed
 *   url="/api/slides/my-talk/embed"
 *   aspectRatio={16 / 9}
 *   slideNumbers="except-first"
 * />
 * ```
 */
export function ReslideRemoteEmbed({
  url,
  aspectRatio = 16 / 9,
  slideNumbers,
  className,
  style,
  fallback,
  errorFallback,
}: ReslideRemoteEmbedProps) {
  const [data, setData] = useState<RemoteSlideData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<RemoteSlideData>;
      })
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") setError(err);
      });

    return () => controller.abort();
  }, [url]);

  if (error) {
    if (errorFallback) {
      return typeof errorFallback === "function" ? errorFallback(error) : errorFallback;
    }
    return <DefaultError error={error} />;
  }

  if (!data) {
    return fallback ?? <DefaultSkeleton aspectRatio={aspectRatio} />;
  }

  return (
    <ReslideEmbed
      aspectRatio={aspectRatio}
      baseUrl={data.baseUrl}
      className={className}
      code={data.code}
      css={data.css}
      designHeight={data.designHeight}
      designWidth={data.designWidth}
      slideNumbers={slideNumbers}
      style={style}
      transition={data.transition as TransitionType}
    />
  );
}
