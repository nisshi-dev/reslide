export interface DeckState {
  /** Current slide index (0-based) */
  currentSlide: number;
  /** Total number of slides */
  totalSlides: number;
  /** Current click step within the slide (0 = initial state) */
  clickStep: number;
  /** Total click steps in the current slide */
  totalClickSteps: number;
  /** Whether overview mode is active */
  isOverview: boolean;
  /** Whether fullscreen is active */
  isFullscreen: boolean;
}

export interface DeckActions {
  /** Go to next slide or click step */
  next: () => void;
  /** Go to previous slide or click step */
  prev: () => void;
  /** Go to a specific slide */
  goTo: (slideIndex: number) => void;
  /** Toggle overview mode */
  toggleOverview: () => void;
  /** Toggle fullscreen */
  toggleFullscreen: () => void;
  /** Register click steps for a slide */
  registerClickSteps: (slideIndex: number, count: number) => void;
}

export type DeckContextValue = DeckState & DeckActions;
