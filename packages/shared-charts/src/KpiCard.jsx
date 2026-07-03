export { DashboardCard as KpiCard, dashboardCardStyles } from "../../shared-ux/src/DashboardCard.jsx";

/** Paleta para series de gráficos DES. */
export const CHART_SERIES_COLORS = [
  "var(--dakinis-accent)",
  "var(--dakinis-ai)",
  "var(--dakinis-success)",
  "var(--dakinis-warning)",
  "var(--dakinis-info)",
];

/** Mini sparkline SVG (valores numéricos; se normalizan internamente). */
export function MiniSparkline({ values = [], width = 80, height = 24, className = "" }) {
  if (!values.length) return null;
  const max = Math.max(...values, 0.001);
  const step = width / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) => `${i * step},${height - (v / max) * height}`)
    .join(" ");
  return (
    <svg
      className={`dakinis-mini-sparkline ${className}`.trim()}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline fill="none" stroke="var(--dakinis-accent)" strokeWidth="2" points={points} />
    </svg>
  );
}
