/** Token surface contract — canonical source remains shared-brand / shared-des foundations. */
export const DES_TOKENS_META = Object.freeze({
  package: "@dakinis/design-system",
  version: "1.0.0",
  surfaces: [0, 1, 2, 3, 4],
  spacing: [4, 8, 12, 16, 24, 32, 48, 64],
  fonts: { sans: "Inter", mono: "JetBrains Mono" },
  themeAttr: "data-theme",
  productAttr: "data-product",
  note: "Prefer CSS vars from shared-brand; avoid per-app --nexora-* / --dc-* forks",
});
