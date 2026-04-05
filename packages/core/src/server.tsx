import type { ElementType, ReactNode } from "react";
import type { EmbeddedOptions } from "./Deck.js";
import { ReslideEmbedClient } from "./ReslideEmbedClient.js";
import type { TransitionType } from "./SlideTransition.js";

/**
 * Data accepted by ReslideServerEmbed.
 *
 * This matches both `CompileResult` from `@reslide-dev/mdx` and
 * `ReslideEmbedData` (from `toEmbedData`). The component detects
 * the shape and extracts the necessary fields automatically.
 */
export type ServerEmbedData = {
  code: string;
  css?: string;
  transition?: string;
  baseUrl?: string;
  designWidth?: number;
  designHeight?: number;
  metadata?: {
    transition?: string;
    designWidth?: unknown;
    designHeight?: unknown;
    [key: string]: unknown;
  };
};

export interface ReslideServerEmbedProps {
  /** Compiled slide data from `compileMdxSlides()` or `toEmbedData()`. When null/undefined, the fallback UI is shown. */
  data: ServerEmbedData | null | undefined;
  /** URL to the original slide page. Renders a link in the embedded bar and in the fallback. */
  sourceUrl?: string;
  /** Show slide numbers. true=all, false=none, "except-first"=hide on first slide */
  slideNumbers?: boolean | "except-first";
  /** Aspect ratio (default: 16/9). Set to 0 to disable and fill parent. */
  aspectRatio?: number;
  /** Additional MDX components to provide */
  components?: Record<string, ElementType>;
  /** Wrapper around the Deck (for styling) */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /** Custom fallback UI when data is null/undefined. Overrides the default placeholder. */
  fallback?: ReactNode;
  /** Show/hide the embedded toolbar (default: true) */
  toolbar?: boolean;
  /** Show/hide the progress bar in embedded mode (default: true) */
  progressBar?: boolean;
  /** Show/hide click navigation zones in embedded mode (default: true) */
  clickNavigation?: boolean;
}

/**
 * Normalise incoming data: if it looks like a CompileResult (has `metadata`),
 * pull transition / designWidth / designHeight from metadata.
 */
function resolveEmbedData(data: ServerEmbedData) {
  const meta = data.metadata;
  return {
    code: data.code,
    css: data.css,
    transition: (data.transition ?? meta?.transition) as TransitionType | undefined,
    baseUrl: data.baseUrl,
    designWidth:
      data.designWidth ?? (meta?.designWidth != null ? Number(meta.designWidth) : undefined),
    designHeight:
      data.designHeight ?? (meta?.designHeight != null ? Number(meta.designHeight) : undefined),
  };
}

/**
 * Server Component that renders compiled reslide slides.
 *
 * Accepts a `CompileResult` (from `compileMdxSlides`) or `ReslideEmbedData`
 * (from `toEmbedData`) as `data`, and internally delegates to the client-side
 * `ReslideEmbed`. This eliminates the need for users to manually create
 * separate Server and Client components.
 *
 * ```tsx
 * // app/blog/[slug]/page.tsx  (Server Component)
 * import { compileMdxSlides } from "@reslide-dev/mdx";
 * import { ReslideServerEmbed } from "@reslide-dev/core/server";
 *
 * export default async function Page() {
 *   const result = await compileMdxSlides(source, { baseUrl });
 *   return (
 *     <ReslideServerEmbed
 *       data={result}
 *       sourceUrl="/slides/my-talk"
 *       slideNumbers="except-first"
 *     />
 *   );
 * }
 * ```
 */
export function ReslideServerEmbed({
  data,
  sourceUrl,
  slideNumbers,
  aspectRatio = 16 / 9,
  components,
  className,
  style,
  fallback,
  toolbar,
  progressBar,
  clickNavigation,
}: ReslideServerEmbedProps) {
  if (!data) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return <DefaultFallback sourceUrl={sourceUrl} />;
  }

  const resolved = resolveEmbedData(data);
  const embeddedOpts: EmbeddedOptions = {
    ...(sourceUrl != null && { sourceUrl }),
    ...(toolbar !== undefined && { toolbar }),
    ...(progressBar !== undefined && { progressBar }),
    ...(clickNavigation !== undefined && { clickNavigation }),
  };
  const embedded: boolean | EmbeddedOptions =
    Object.keys(embeddedOpts).length > 0 ? embeddedOpts : true;

  return (
    <ReslideEmbedClient
      code={resolved.code}
      css={resolved.css}
      transition={resolved.transition}
      baseUrl={resolved.baseUrl}
      designWidth={resolved.designWidth}
      designHeight={resolved.designHeight}
      slideNumbers={slideNumbers}
      aspectRatio={aspectRatio}
      components={components}
      className={className}
      style={style}
      embedded={embedded}
    />
  );
}

function DefaultFallback({ sourceUrl }: { sourceUrl?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backgroundColor: "#f8fafc",
        borderRadius: "0.5rem",
        border: "1px solid #e2e8f0",
        color: "#475569",
        fontSize: "0.875rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {sourceUrl ? (
        <a
          href={sourceUrl}
          style={{
            color: "#2563eb",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
          }}
        >
          スライドを別ページで見る
        </a>
      ) : (
        <span>スライドを読み込めませんでした</span>
      )}
    </div>
  );
}
