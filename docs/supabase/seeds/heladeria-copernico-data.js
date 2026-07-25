/**
 * Heladería Copérnico — cliente piloto fijo (menú desde cartas reales jul 2026).
 * Seed: platform/core/api/scripts/seed-heladeria-copernico.mjs
 * Hub: docs/supabase/scripts/provision_heladeria_copernico.sql
 */

export const COPERNICO_MENU_ITEMS = [
  // Montaditos — 2,99 €
  {
    id: "montadito-serranito",
    name: "Serranito",
    nameEs: "Serranito",
    category: "Montaditos",
    priceEur: 2.99,
    description: "Pan rústico, filete de lomo, pimiento frito y jamón serrano",
  },
  {
    id: "montadito-choripan",
    name: "Choripan argentino",
    nameEs: "Choripan argentino",
    category: "Montaditos",
    priceEur: 2.99,
    description: "Pan rústico, chorizo y salsa chimichurri",
  },
  {
    id: "montadito-piripi",
    name: "Piripi",
    nameEs: "Piripi",
    category: "Montaditos",
    priceEur: 2.99,
    description: "Pan rústico, lomo adobado, bacon y alioli",
  },
  {
    id: "montadito-york-queso",
    name: "York y queso",
    nameEs: "York y queso",
    category: "Montaditos",
    priceEur: 2.99,
    description: "Pan rústico, jamón york y queso",
  },
  // Pizzas — 3,50 €
  {
    id: "pizza-mozzarella",
    name: "Mozzarella",
    nameEs: "Mozzarella",
    category: "Pizzas",
    priceEur: 3.5,
    description: "Pizza mozzarella",
  },
  {
    id: "pizza-jamon-queso",
    name: "Jamón y queso",
    nameEs: "Jamón y queso",
    category: "Pizzas",
    priceEur: 3.5,
    description: "Pizza jamón y queso",
  },
  {
    id: "pizza-argentina",
    name: "Argentina",
    nameEs: "Argentina",
    category: "Pizzas",
    priceEur: 3.5,
    description: "Pizza sencilla y sabrosa, queso derretido, ajo y perejil fresco",
  },
  // Empanadas — 2,50 €
  {
    id: "empanada-carne",
    name: "Empanada de carne",
    nameEs: "Empanada de carne",
    category: "Empanadas",
    priceEur: 2.5,
    description: "Relleno de carne sabroso y suave, toque casero",
  },
  {
    id: "empanada-pollo",
    name: "Empanada de pollo",
    nameEs: "Empanada de pollo",
    category: "Empanadas",
    priceEur: 2.5,
    description: "Pollo desmenuzado con especias y un toque suave de picante",
  },
  // Heladería / verano
  {
    id: "helados-artesanales",
    name: "Helados artesanales",
    nameEs: "Helados artesanales",
    category: "Helados",
    priceEur: 0,
    description: "Elaborados diariamente con ingredientes seleccionados y recetas artesanales (consultar precios por bola/copa)",
  },
  {
    id: "smoothie-base",
    name: "Smoothie",
    nameEs: "Smoothie",
    category: "Bebidas",
    priceEur: 4.5,
    description: "Fruta 100% natural mezclada al momento",
  },
  {
    id: "batido-helado",
    name: "Batido de helado",
    nameEs: "Batido de helado",
    category: "Bebidas",
    priceEur: 5.0,
    description: "Mezcla cremosa y refrescante de helado y leche",
  },
  {
    id: "blanco-y-negro",
    name: "Blanco y Negro",
    nameEs: "Blanco y Negro",
    category: "Bebidas",
    priceEur: 5.0,
    description: "Granizado de café con nata, helado y salsa de chocolate",
  },
  {
    id: "frapuccino",
    name: "Frapuccino",
    nameEs: "Frapuccino",
    category: "Bebidas",
    priceEur: 3.5,
    description: "Café frío cremoso batido con hielo",
  },
  {
    id: "affogato",
    name: "Affogato",
    nameEs: "Affogato",
    category: "Bebidas",
    priceEur: 4.0,
    description: "Helado de vainilla con café espresso caliente",
  },
  {
    id: "mojito",
    name: "Mojito",
    nameEs: "Mojito",
    category: "Bebidas",
    priceEur: 6.0,
    description: "Lima fresca, hierbabuena y Ron Bacardí",
  },
  // Smoothies carta (precio smoothie base 4,50 €)
  {
    id: "smoothie-melon-magic",
    name: "Melon Magic",
    nameEs: "Melon Magic",
    category: "Smoothies",
    priceEur: 4.5,
    description: "Mango, melón amarillo, melón verde, piña, kiwi · Vitalizante",
  },
  {
    id: "smoothie-pina-colada",
    name: "Piña Colada",
    nameEs: "Piña Colada",
    category: "Smoothies",
    priceEur: 4.5,
    description: "Piña, leche de coco, plátano · Caribeño",
  },
  {
    id: "smoothie-nube",
    name: "Nube",
    nameEs: "Nube",
    category: "Smoothies",
    priceEur: 4.5,
    description: "Fresa, plátano · Nutritivo",
  },
  {
    id: "smoothie-veggy-kale",
    name: "Veggy Kale",
    nameEs: "Veggy Kale",
    category: "Smoothies",
    priceEur: 4.5,
    description: "Piña, mango, kale, espinaca, jengibre · Desintoxicante",
  },
  {
    id: "smoothie-forest-plus",
    name: "Forest Plus",
    nameEs: "Forest Plus",
    category: "Smoothies",
    priceEur: 4.5,
    description: "Mora, fresa, plátano · Antioxidante",
  },
  {
    id: "smoothie-fresa-melocoton",
    name: "Fresa Melocotón Delight",
    nameEs: "Fresa Melocotón Delight",
    category: "Smoothies",
    priceEur: 4.5,
    description: "Fresa, plátano, melocotón · Energético",
  },
  {
    id: "smoothie-mango-pina",
    name: "Mango Piña",
    nameEs: "Mango Piña",
    category: "Smoothies",
    priceEur: 4.5,
    description: "Mango, piña, fresa · Refrescante",
  },
  {
    id: "smoothie-passion",
    name: "Passion",
    nameEs: "Passion",
    category: "Smoothies",
    priceEur: 4.5,
    description: "Mango, piña, maracuyá · Exuberante",
  },
];

export const COPERNICO_HOUSE_TENANT = {
  businessId: "biz_heladeria_copernico",
  slug: "heladeria-copernico",
  name: "Heladería Copérnico",
  type: "restaurante",
  plan: "pro",
  userId: "usr_heladeria_copernico_1",
  email: "admin@heladeria-copernico.local",
  password: "Copernico2026!",
  publicToken: "copernicoqr2026",
  venueName: "Heladería Copérnico",
  brand: {
    tagline: "El verano ya llegó a COPÉRNICO",
    primaryColor: "#1a5f4a",
    accentColor: "#f4c430",
  },
  hubProducts: ["core", "lifeflow", "streamautomator", "akoenet", "tabletop"],
};

export function copernicoBuildConfigJson() {
  return {
    brand: COPERNICO_HOUSE_TENANT.brand,
    hubProducts: COPERNICO_HOUSE_TENANT.hubProducts,
    menu: {
      venue: COPERNICO_HOUSE_TENANT.venueName,
      currency: "EUR",
      note: "¿Buscas algo más? pregunta por nuestras SUGERENCIAS del DÍA",
      items: COPERNICO_MENU_ITEMS,
    },
  };
}
