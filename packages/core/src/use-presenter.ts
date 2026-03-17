import { useEffect, useRef } from "react";

const CHANNEL_NAME = "reslide-presenter";

interface PresenterMessage {
  type: "sync";
  currentSlide: number;
  clickStep: number;
}

/**
 * Hook for syncing presentation state across windows via BroadcastChannel.
 * The main presentation window broadcasts state changes.
 */
export function usePresenterSync(
  currentSlide: number,
  clickStep: number,
  onReceive?: (msg: PresenterMessage) => void,
) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    if (onReceive) {
      channel.onmessage = (e: MessageEvent<PresenterMessage>) => {
        onReceive(e.data);
      };
    }

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [onReceive]);

  // Broadcast state changes
  useEffect(() => {
    channelRef.current?.postMessage({
      type: "sync",
      currentSlide,
      clickStep,
    } satisfies PresenterMessage);
  }, [currentSlide, clickStep]);
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

export type { PresenterMessage };
