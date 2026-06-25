/** Variantes skeleton — importar skeleton.css en apps web. */

export const SKELETON_VARIANTS = ["card", "table", "chart", "avatar", "list", "text", "title", "value"];

export const skeletonStylesheet = `
@keyframes dakinis-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.dakinis-skeleton {
  border-radius: var(--dakinis-radius-sm, 8px);
  background: linear-gradient(90deg, var(--dakinis-surface, #122840) 25%, var(--dakinis-panel, #17344e) 50%, var(--dakinis-surface, #122840) 75%);
  background-size: 200% 100%;
  animation: dakinis-shimmer 1.2s ease-in-out infinite;
}
.dakinis-skeleton--title { height: 0.85rem; width: 55%; margin-bottom: 0.5rem; }
.dakinis-skeleton--value { height: 1.75rem; width: 40%; margin-bottom: 0.65rem; }
.dakinis-skeleton--line { height: 0.65rem; width: 85%; }
.dakinis-skeleton--avatar { width: 2.5rem; height: 2.5rem; border-radius: 999px; }
.dakinis-skeleton--chart { height: 4rem; width: 100%; border-radius: var(--dakinis-radius-md, 12px); }
.dakinis-skeleton-card { padding: 1rem; border-radius: var(--dakinis-radius-card, 16px); border: 1px solid var(--dakinis-line, #23415f); }
.dakinis-skeleton-list { display: flex; flex-direction: column; gap: 0.5rem; }
.dakinis-skeleton-list__row { display: flex; gap: 0.65rem; align-items: center; }
.dakinis-skeleton-table { display: grid; gap: 0.45rem; }
.dakinis-skeleton-table__row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; }
@media (prefers-reduced-motion: reduce) {
  .dakinis-skeleton { animation: none; opacity: 0.6; }
}
`;

/**
 * @param {'card'|'table'|'chart'|'avatar'|'list'} variant
 */
export function skeletonClass(variant) {
  const map = {
    card: "dakinis-skeleton-card",
    table: "dakinis-skeleton-table",
    chart: "dakinis-skeleton--chart",
    avatar: "dakinis-skeleton--avatar",
    list: "dakinis-skeleton-list",
  };
  return map[variant] || "dakinis-skeleton";
}
