/** Default design resolution — slides are authored at this size and scaled to fit */
export const DEFAULT_DESIGN_WIDTH = 1920;
export const DEFAULT_DESIGN_HEIGHT = 1080;

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
  /** Design width for scaling (default: 1920) */
  designWidth: number;
  /** Design height for scaling (default: 1080) */
  designHeight: number;
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
