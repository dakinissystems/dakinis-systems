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

const STREAMAUTOMATOR_PLANS = [
  {
    id: "sa-creator-monthly",
    name: "StreamAutomator Creator",
    currency: "USD",
    priceMonthly: 6.99,
    productKey: "streamautomator",
    saLicenseType: "monthly",
    checkoutMode: "subscription",
    features: ["Schedule streams", "Director", "Overlays"],
  },
  {
    id: "sa-pro-monthly",
    name: "StreamAutomator Pro",
    currency: "USD",
    priceMonthly: 14.99,
    productKey: "streamautomator",
    saLicenseType: "quarterly",
    checkoutMode: "subscription",
    features: ["Todo Creator", "Automation avanzada", "Analytics"],
  },
  {
    id: "sa-lifetime",
    name: "StreamAutomator Lifetime",
    currency: "USD",
    priceMonthly: 99,
    productKey: "streamautomator",
    saLicenseType: "lifetime",
    checkoutMode: "payment",
    features: ["Acceso de por vida", "Todas las funciones Pro"],
  },
];

const ALL_PLANS = [...BASE_PLANS, ...STREAMAUTOMATOR_PLANS];

/** @param {string} planId */
export function getPlanById(planId) {
  return PUBLIC_PLANS.find((p) => p.id === planId) || null;
}

export const PUBLIC_PLANS = ALL_PLANS.map((plan) => ({
  ...plan,
  stripePriceId: config.stripePlanToPrice[plan.id] || null,
  paymentLink: config.stripePaymentLinks[plan.id] || null,
  checkoutAvailable: Boolean(
    config.stripeConfigured &&
      (config.stripePlanToPrice[plan.id] || config.stripePaymentLinks[plan.id])
  ),
}));
