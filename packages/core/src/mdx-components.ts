import { Click, ClickSteps } from "./Click.js";
import { Deck } from "./Deck.js";
import { Draggable } from "./Draggable.js";
import { GlobalLayer } from "./GlobalLayer.js";
import { Mark } from "./Mark.js";
import { Mermaid } from "./Mermaid.js";
import { Notes } from "./Notes.js";
import { Slide } from "./Slide.js";
import { SlotRight } from "./Slot.js";
import { Toc } from "./Toc.js";

/**
 * All reslide components for use in MDX.
 *
 * Usage:
 * ```tsx
 * import { reslideComponents } from '@reslide-dev/core/mdx-components'
 * <MDXContent components={reslideComponents} />
 * ```
 */
export const reslideComponents = {
  Deck,
  Slide,
  Click,
  ClickSteps,
  Mark,
  Notes,
  SlotRight,
  GlobalLayer,
  Draggable,
  Toc,
  Mermaid,
};
