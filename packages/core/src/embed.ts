"use client";

/**
 * Lightweight entry point for embedding slides.
 *
 * Import from `@reslide-dev/core/embed` instead of `@reslide-dev/core`
 * to avoid bundling Deck, PresenterView, DrawingLayer, and other
 * components that are not needed for embedded viewers.
 */
export { ReslideEmbed } from "./ReslideEmbed.js";
export type { ReslideEmbedProps } from "./ReslideEmbed.js";

export { ReslideRemoteEmbed } from "./ReslideRemoteEmbed.js";
export type { ReslideRemoteEmbedProps } from "./ReslideRemoteEmbed.js";
