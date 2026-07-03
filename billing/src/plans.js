import { config } from "./config.js";

const BASE_PLANS = [
  {
    id: "starter",
    name: "Starter",
    currency: "EUR",
    priceMonthly: 0,
    features: ["1 usuario", "Core básico", "Soporte comunidad"],
  },
  {
    id: "growth",
    name: "Growth",
    currency: "EUR",
    priceMonthly: 29,
    features: ["5 usuarios", "Inventario + CRM", "LifeFlow básico"],
  },
  {
    id: "pro",
    name: "Pro",
    currency: "EUR",
    priceMonthly: 79,
    features: ["Usuarios ilimitados", "IA Copilot", "Integraciones SA"],
  },
  {
    id: "lifeflow-plus",
    name: "LifeFlow Plus",
    currency: "EUR",
    priceMonthly: 9,
    features: ["Coach IA", "Escenarios avanzados", "Export informes"],
  },
];

/** @param {string} planId */
export function getPlanById(planId) {
  return PUBLIC_PLANS.find((p) => p.id === planId) || null;
}

export const PUBLIC_PLANS = BASE_PLANS.map((plan) => ({
  ...plan,
  stripePriceId: config.stripePlanToPrice[plan.id] || null,
  paymentLink: config.stripePaymentLinks[plan.id] || null,
  checkoutAvailable: Boolean(
    config.stripeConfigured &&
      (config.stripePlanToPrice[plan.id] || config.stripePaymentLinks[plan.id])
  ),
}));
