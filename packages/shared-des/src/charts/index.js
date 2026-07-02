/**
 * Catálogo de visualización de datos DES.
 */
export const DES_CHART_TYPES = {
  mini: { variants: ["sparkline", "bar", "donut"], status: "planned" },
  area: { status: "planned", use: "tendencias temporales" },
  bar: { status: "planned", use: "comparativas categóricas" },
  line: { status: "planned", use: "series temporales" },
  donut: { status: "planned", use: "proporciones" },
  radar: { status: "planned", use: "multivariable" },
  financial: { status: "planned", use: "LifeFlow, Core finanzas" },
  heatmap: { status: "planned", use: "actividad por hora/día" },
  timeline: { status: "ready", module: "@dakinis/shared-ux/react/ActivityTimeline.jsx" },
  kpiCard: { status: "ready", module: "@dakinis/shared-ux/DashboardCard.jsx" },
};

export const DES_CHART_PACKAGE = "@dakinis/shared-charts";
