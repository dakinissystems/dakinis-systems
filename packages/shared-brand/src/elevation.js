import { DAKINIS_SURFACE_STACK } from "./surfaces.js";
import { DAKINIS_SHADOW } from "./shadow.js";

/** Elevación por nivel de superficie — sombra + z-index sugerido. */
export const DAKINIS_ELEVATION = {
  0: { shadow: "none", zIndex: 0 },
  1: { shadow: DAKINIS_SHADOW.card, zIndex: 1 },
  2: { shadow: DAKINIS_SHADOW.lg, zIndex: 40 },
  3: { shadow: DAKINIS_SHADOW.md, zIndex: 50 },
  4: { shadow: DAKINIS_SHADOW.lg, zIndex: 60 },
};

/** Mapeo superficie → token CSS de fondo. */
export const DAKINIS_SURFACE_CSS = Object.fromEntries(
  Object.keys(DAKINIS_SURFACE_STACK).map((level) => [
    level,
    `var(--dakinis-surface-${level})`,
  ])
);
