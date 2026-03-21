import { useCallback, useEffect, useRef, useState } from "react";

export interface DrawingLayerProps {
  /** Whether drawing mode is active */
  active: boolean;
  /** Current slide index — drawings are stored per slide */
  currentSlide: number;
  /** Pen color */
  color?: string;
  /** Pen width */
  width?: number;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Canvas-based freehand drawing overlay for presentations.
 * Drawings are stored per slide and persist across navigation.
 * Toggle with `d` key, clear current slide with `c` key.
 */
export function DrawingLayer({
  active,
  currentSlide,
  color = "#ef4444",
  width = 3,
}: DrawingLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef<Point | null>(null);

  // Per-slide drawing storage: slide index → ImageData
  const drawingsRef = useRef<Map<number, ImageData>>(new Map());
  const prevSlideRef = useRef(currentSlide);

  const getCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { w: 0, h: 0 };
    return { w: canvas.width, h: canvas.height };
  }, []);

  const saveCurrentSlide = useCallback(
    (slideIndex: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      const { w, h } = getCanvasSize();
      if (w === 0 || h === 0) return;

      const imageData = ctx.getImageData(0, 0, w, h);
      // Only save if there's actual drawing data (not all transparent)
      const hasContent = imageData.data.some((_, i) => i % 4 === 3 && imageData.data[i] > 0);
      if (hasContent) {
        drawingsRef.current.set(slideIndex, imageData);
      } else {
        drawingsRef.current.delete(slideIndex);
      }
    },
    [getCanvasSize],
  );

  const restoreSlide = useCallback(
    (slideIndex: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      const { w, h } = getCanvasSize();
      ctx.clearRect(0, 0, w, h);

      const saved = drawingsRef.current.get(slideIndex);
      if (saved && saved.width === w && saved.height === h) {
        ctx.putImageData(saved, 0, 0);
      }
    },
    [getCanvasSize],
  );

  // Save/restore on slide change
  useEffect(() => {
    if (prevSlideRef.current !== currentSlide) {
      saveCurrentSlide(prevSlideRef.current);
      restoreSlide(currentSlide);
      prevSlideRef.current = currentSlide;
    }
  }, [currentSlide, saveCurrentSlide, restoreSlide]);

  const getPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const startDraw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!active) return;
      setIsDrawing(true);
      lastPoint.current = getPoint(e);
    },
    [active, getPoint],
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !active) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !lastPoint.current) return;

      const point = getPoint(e);

      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      lastPoint.current = point;
    },
    [isDrawing, active, color, width, getPoint],
  );

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;

      const newWidth = rect.width * window.devicePixelRatio;
      const newHeight = rect.height * window.devicePixelRatio;

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        // Save before resize (dimensions will change, invalidating stored ImageData)
        saveCurrentSlide(currentSlide);
        // Clear stored data since dimensions changed
        drawingsRef.current.clear();

        canvas.width = newWidth;
        canvas.height = newHeight;
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [currentSlide, saveCurrentSlide]);

  // Clear current slide on 'c' key when drawing is active
  useEffect(() => {
    if (!active) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "c") {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawingsRef.current.delete(currentSlide);
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active, currentSlide]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDraw}
      onMouseMove={draw}
      onMouseUp={stopDraw}
      onMouseLeave={stopDraw}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        cursor: active ? "crosshair" : "default",
        pointerEvents: active ? "auto" : "none",
        zIndex: 50,
      }}
    />
  );
}
