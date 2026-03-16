import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(document.fullscreenElement != null);
    }
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggle = useCallback(() => {
    if (!ref.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void ref.current.requestFullscreen();
    }
  }, [ref]);

  return { isFullscreen, toggleFullscreen: toggle };
}
