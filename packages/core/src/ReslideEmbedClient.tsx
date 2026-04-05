"use client";

import { ReslideEmbed } from "./ReslideEmbed.js";
import type { ReslideEmbedProps } from "./ReslideEmbed.js";

/**
 * Thin "use client" wrapper around ReslideEmbed.
 * Used by ReslideServerEmbed to cross the RSC → Client boundary.
 */
export function ReslideEmbedClient(props: ReslideEmbedProps) {
  return <ReslideEmbed {...props} />;
}
