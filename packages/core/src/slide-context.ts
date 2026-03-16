import { createContext, useContext } from "react";

export const SlideIndexContext = createContext<number | null>(null);

export function useSlideIndex(): number {
  const index = useContext(SlideIndexContext);
  if (index == null) {
    throw new Error("useSlideIndex must be used within a <Slide> component");
  }
  return index;
}
