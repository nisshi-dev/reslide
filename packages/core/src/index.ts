export { Deck } from "./Deck.js";
export type { DeckProps } from "./Deck.js";

export { Slide } from "./Slide.js";
export type { SlideProps } from "./Slide.js";

export { Click, ClickSteps } from "./Click.js";
export type { ClickProps } from "./Click.js";

export { Mark } from "./Mark.js";
export type { MarkProps } from "./Mark.js";

export { Notes } from "./Notes.js";
export type { NotesProps } from "./Notes.js";

export { SlotRight } from "./Slot.js";

export type { TransitionType } from "./SlideTransition.js";

export { PresenterView } from "./PresenterView.js";
export type { PresenterViewProps } from "./PresenterView.js";
export { isPresenterView, openPresenterWindow } from "./use-presenter.js";

export { DrawingLayer } from "./DrawingLayer.js";
export type { DrawingLayerProps } from "./DrawingLayer.js";

export { useDeck } from "./context.js";
export { DeckContext } from "./context.js";
export { useSlideIndex, SlideIndexContext } from "./slide-context.js";
export type { DeckState, DeckActions, DeckContextValue } from "./types.js";
