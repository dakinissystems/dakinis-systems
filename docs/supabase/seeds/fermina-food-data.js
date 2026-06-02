/**
 * Fermina Food — comida argentina (demo tenant).
 * Logo: platform/core/web/public/assets/fermina-logo.png
 *
 * NO ejecutar este archivo en Supabase SQL Editor (es JavaScript, no SQL).
 * En Supabase usar: 04-tenant-fermina-food.sql (tenant completo)
 *   o 05-fermina-food-allergies-update.sql (solo cartel alérgenos).
 * Desde Node: platform/core/api/scripts/seed-fermina-food.mjs
 */

export const FERMINA_MENU_ITEMS = [
  {
    id: "cheddar-jalapeno-bites",
    name: "Cheddar and jalapeños bites",
    nameEs: "Bites cheddar y jalapeños",
    category: "Entrante",
    priceEur: 8.5,
    packSize: 50,
    portionQty: 9,
    stockSlug: "bites-cheddar"
  },
  {
    id: "chicken-bites",
    name: "Chicken bites",
    nameEs: "Chicken bites",
    category: "Entrante",
    priceEur: 9.5,
    packSize: 120,
    portionQty: 11,
    stockSlug: "bites-pollo"
  },
  {
    id: "choripan",
    name: "Choripán",
    nameEs: "Choripán",
    category: "Clásico",
    priceEur: 7.5,
    stockSlug: "choripan"
  }
];

export const FERMINA_STOCK_ITEMS = [
  { slug: "bites-cheddar", name: "Bites cheddar y jalapeños (bolsa)", unit: "u", quantity: 250, minQuantity: 90 },
  { slug: "bites-pollo", name: "Chicken bites (bolsa)", unit: "u", quantity: 480, minQuantity: 120 },
  { slug: "pan-choripan", name: "Pan de choripán", unit: "u", quantity: 40, minQuantity: 10 },
  { slug: "chorizo", name: "Chorizo", unit: "u", quantity: 45, minQuantity: 12 },
  { slug: "chimichurri", name: "Chimichurri", unit: "L", quantity: 2, minQuantity: 0.5 },
  { slug: "pan-burger", name: "Pan (otros)", unit: "u", quantity: 20, minQuantity: 5 }
];

export const FERMINA_RECIPES = [
  {
    slug: "porcion-cheddar-bites",
    name: "Porción bites cheddar y jalapeños",
    outputLabel: "Porciones",
    outputQuantity: 1,
    outputUnit: "u",
    lines: [{ itemSlug: "bites-cheddar", quantity: 9, unit: "u" }]
  },
  {
    slug: "porcion-chicken-bites",
    name: "Porción chicken bites",
    outputLabel: "Porciones",
    outputQuantity: 1,
    outputUnit: "u",
    lines: [{ itemSlug: "bites-pollo", quantity: 11, unit: "u" }]
  },
  {
    slug: "choripan-unidad",
    name: "Choripán",
    outputLabel: "Choripanes",
    outputQuantity: 1,
    outputUnit: "u",
    lines: [
      { itemSlug: "pan-choripan", quantity: 1, unit: "u" },
      { itemSlug: "chorizo", quantity: 1, unit: "u" },
      { itemSlug: "chimichurri", quantity: 0.02, unit: "L" }
    ]
  }
];

export const FERMINA_DEMO_PURCHASE = [
  { itemSlug: "bites-cheddar", quantity: 100 },
  { itemSlug: "bites-pollo", quantity: 120 },
  { itemSlug: "pan-choripan", quantity: 20 },
  { itemSlug: "chorizo", quantity: 24 },
  { itemSlug: "chimichurri", quantity: 1 }
];

export const FERMINA_DEMO_PRODUCTION = [
  { recipeSlug: "porcion-cheddar-bites", batches: 8 },
  { recipeSlug: "porcion-chicken-bites", batches: 6 },
  { recipeSlug: "choripan-unidad", batches: 10 }
];

export const FERMINA_HOUSE_TENANT = {
  businessId: "biz_fermina_food",
  slug: "fermina-food",
  name: "Fermina Food",
  type: "restaurante",
  plan: "starter",
  userId: "usr_fermina_food_1",
  email: "admin@fermina-food.local",
  password: "demo123",
  publicToken: "ferminafoodqr2026",
  venueName: "Fermina Food",
  brand: {
    tagline: "foods, drinks & coffee",
    primaryColor: "#8a9a7b",
    accentColor: "#1a1a1a"
  }
};

export function ferminaBuildConfigJson() {
  return {
    brand: FERMINA_HOUSE_TENANT.brand,
    menu: {
      venue: "Fermina Food",
      currency: "EUR",
      items: FERMINA_MENU_ITEMS
    }
  };
}

/** Resumen UE (checklist) para el local. */
export function ferminaBuildAllergenProfile() {
  return [
    {
      catalogId: "gluten",
      name: "Gluten",
      category: "Cereales",
      present: true,
      severity: "alta",
      notes: "Pan choripán, rebozados"
    },
    {
      catalogId: "milk",
      name: "Leche",
      category: "Lácteos",
      present: true,
      severity: "alta",
      notes: "Bites cheddar"
    }
  ];
}
