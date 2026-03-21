import { useCallback, useEffect, useRef } from "react";

const CHANNEL_NAME = "reslide-presenter";

interface SyncMessage {
  type: "sync";
  currentSlide: number;
  clickStep: number;
}

interface NavigateMessage {
  type: "navigate";
  action: "next" | "prev" | "goTo";
  slideIndex?: number;
}

type PresenterMessage = SyncMessage | NavigateMessage;

/**
 * Hook for syncing presentation state across windows via BroadcastChannel.
 * The main presentation window broadcasts state changes and listens for
 * navigation commands from the presenter window.
 */
export function usePresenterSync(
  currentSlide: number,
  clickStep: number,
  handlers?: {
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
  },
) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    if (handlers) {
      channel.onmessage = (e: MessageEvent<PresenterMessage>) => {
        if (e.data.type === "navigate") {
          switch (e.data.action) {
            case "next":
              handlers.next();
              break;
            case "prev":
              handlers.prev();
              break;
            case "goTo":
              if (e.data.slideIndex != null) {
                handlers.goTo(e.data.slideIndex);
              }
              break;
          }
        }
      };
    }

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [handlers]);

  // Broadcast state changes
  useEffect(() => {
    channelRef.current?.postMessage({
      type: "sync",
      currentSlide,
      clickStep,
    } satisfies SyncMessage);
  }, [currentSlide, clickStep]);
}

/**
 * Hook for the presenter window to listen for sync messages and send
 * navigation commands back to the main window.
 */
export function usePresenterChannel(onSync: (msg: SyncMessage) => void): {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
} {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (e: MessageEvent<PresenterMessage>) => {
      if (e.data.type === "sync") {
        onSyncRef.current(e.data);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const next = useCallback(() => {
    channelRef.current?.postMessage({
      type: "navigate",
      action: "next",
    } satisfies NavigateMessage);
  }, []);

  const prev = useCallback(() => {
    channelRef.current?.postMessage({
      type: "navigate",
      action: "prev",
    } satisfies NavigateMessage);
  }, []);

  const goTo = useCallback((index: number) => {
    channelRef.current?.postMessage({
      type: "navigate",
      action: "goTo",
      slideIndex: index,
    } satisfies NavigateMessage);
  }, []);

  return { next, prev, goTo };
}

/**
 * Opens the presenter window at the /presenter route.
 */
export function openPresenterWindow() {
  const url = new URL(window.location.href);
  url.searchParams.set("presenter", "true");
  window.open(url.toString(), "reslide-presenter", "width=1024,height=768,menubar=no,toolbar=no");
}

/**
 * Check if the current window is the presenter view.
 */
export function isPresenterView(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("presenter") === "true";
}

export type { PresenterMessage, SyncMessage, NavigateMessage };
