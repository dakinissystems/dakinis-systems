/**
 * Fundamentos de accesibilidad DES — no solo WCAG como pendiente.
 */
export const DAKINIS_A11Y = {
  focusRingWidth: 3,
  minContrastRatio: {
    body: 4.5,
    largeText: 3,
    ui: 3,
  },
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
  keyboard: {
    skipLinkId: "dakinis-skip-to-content",
    trapSelector: '[data-dakinis-focus-trap="true"]',
  },
  aria: {
    livePolite: "polite",
    liveAssertive: "assertive",
  },
};

/** Checklist para revisión de pantallas. */
export const DAKINIS_A11Y_CHECKLIST = [
  "keyboard",
  "focus",
  "contrast",
  "reduced-motion",
  "aria",
  "screen-readers",
];
