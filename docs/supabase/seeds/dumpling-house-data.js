/**
 * Dumpling House — menú (fotos WhatsApp) + alérgenos (PDF / allergen_page.png).
 * Fuente: C:\Users\Christian\Downloads\Dumplings
 */

/** Hongos que pueden incorporarse (declaración local, no alérgeno UE obligatorio). */
export const DUMPLING_HOUSE_MUSHROOMS = [
  "Shiitake",
  "Porcini",
  "Trufa",
  "Champiñon",
  "Matsutake",
  "Enoki",
  "Huitlacoche",
  "Gírgola"
];

/** Claves PDF de platos noodle donde pueden aparecer esos hongos. */
export const DUMPLING_NOODLE_PDF_KEYS = new Set([
  "PADTHAI CON POLLO Y VERDURAS",
  "UDON CON GAMBAS Y VERDURAS",
  "NOODLES VEGETAL"
]);

export function dumplingMushroomsLabel() {
  return DUMPLING_HOUSE_MUSHROOMS.join(", ");
}

export function dumplingNoodleMushroomNote(selected = DUMPLING_HOUSE_MUSHROOMS) {
  if (!selected?.length) return "";
  return `Hongos que pueden estar presentes: ${selected.join(", ")}. Aplica a UDON, Pad Thai y Noodles.`;
}

export function dumplingIsNoodlePdfKey(pdfKey) {
  return DUMPLING_NOODLE_PDF_KEYS.has(dumplingResolvePdfKey(pdfKey));
}

/** @type {Record<string, string[]>} — nombre plato PDF → alérgenos (español, como en carta) */
export const DUMPLING_HOUSE_PDF_ALLERGENS = {
  "ENSALADA CHINA": ["Huevo"],
  EDAMAME: [],
  WAKAME: [],
  "ROLLITO VEGETAL 2UDS": ["Sésamo", "Soja", "Gluten"],
  "ROLLITO LANGOSTINO Y MANGO": ["Sésamo", "Soja", "Crustáceos", "Gluten"],
  "ROLLITO VIETNAMITA 2 UDS": ["Sésamo", "Soja", "Crustáceos", "Leche", "Gluten"],
  "TEMPURA LANGOSTINO 4 UDS": ["Soja", "Crustáceos", "Leche", "Gluten"],
  "GYOZA DE PATO CON BOLETUS 6UDS": ["Sésamo", "Soja", "Leche", "Gluten"],
  "GYOZA DE POLLO Y VERDURA 8UDS": ["Sésamo", "Soja", "Gluten"],
  "GYOZA DE CERDO Y VERDURAS 8UDS": ["Sésamo", "Soja", "Gluten"],
  "GYOZA DE TERNERA Y VERDURAS": ["Sésamo", "Soja", "Moluscos", "Gluten"],
  "GYOZA VEGETAL 8UDS": ["Sésamo", "Soja", "Gluten"],
  "GYOZA FRITO DE CERDO Y VERDURA": ["Sésamo", "Soja", "Moluscos", "Gluten"],
  "GYOZA FRITO DE POLLO Y VERDURAS": ["Sésamo", "Soja", "Moluscos", "Gluten"],
  "SIUMAI DE CARNE FRITO 4 UDS": ["Sésamo", "Soja", "Moluscos", "Gluten"],
  "MINI PAN CHINO FRITO 4 UDS": ["Leche", "Gluten"],
  "WANTUN FRITO 6UDS": ["Huevo", "Soja", "Crustáceos", "Leche", "Gluten"],
  "HAKAO LANGOSTINO 4UDS": ["Sulfitos", "Soja", "Crustáceos", "Gluten"],
  "SIUMAI DE CERDO 4 UDS": ["Sésamo", "Soja", "Crustáceos", "Gluten"],
  "MINI BAO SHANGHAI 4 UDS": ["Sésamo", "Soja", "Gluten"],
  "BAO DE CERDO Y VERDURA 1UDS": ["Apio", "Sésamo", "Soja", "Moluscos", "Gluten"],
  "BAO CREMA DE HUEVO 2UDS": ["Huevo", "Leche", "Gluten"],
  "GYOZA DE CARNE Y VERDURA AL VAPOR": ["Sésamo", "Soja", "Gluten"],
  "GYOZA DE POLLO Y VERDURA AL VAPO": ["Sésamo", "Soja", "Gluten"],
  "MINI PAN CHINO AL VAPOR 2UDS": ["Leche", "Gluten"],
  "PANBAO DE POLLO FRITO": ["Huevo", "Soja", "Leche", "Gluten"],
  "PANBAO DE TERNERA": ["Sésamo", "Soja", "Moluscos", "Gluten"],
  "PANBAO DE PATO": ["Sésamo", "Soja", "Moluscos", "Gluten"],
  "MO XIAN PRODUCTO TEMPORAL": ["Soja", "Moluscos", "Gluten"],
  "ARROZ BLANCO": [],
  "ARROZ SALTEADO CON HUEVO Y VERDURAS": ["Huevo", "Gluten"],
  "PADTHAI CON POLLO Y VERDURAS": ["Huevo", "Soja", "Moluscos", "Gluten"],
  "UDON CON GAMBAS Y VERDURAS": ["Huevo", "Soja", "Crustáceos", "Moluscos", "Gluten"],
  "NOODLES VEGETAL": ["Huevo", "Soja", "Moluscos", "Gluten"],
  "POLLO AL CURRY CON ARROZ BLANCO": ["Sulfitos", "Sésamo", "Soja", "Gluten"],
  "POLLO SALSA GONGBAO CON ARROZ BLANCO": ["Pescado", "Sésamo", "Soja", "Crustáceos", "Moluscos", "Gluten"],
  "POLLO AGRIDULCE CON ARROZ BLANCO": ["Soja", "Leche", "Gluten"],
  "POLLO FRITO CON ARROZ SALTEADO": ["Huevo", "Soja", "Gluten"],
  "TERNERA CON SALSA OSTRAS Y ARROZ BLANCO": ["Sésamo", "Soja", "Moluscos", "Gluten"],
  "TERNERA CON SALSA GONBAO Y ARROZ BLANCO": ["Pescado", "Sésamo", "Soja", "Crustáceos", "Moluscos", "Gluten"],
  "CERDO AGRIDULCE CON ARROZ BLANCO": ["Soja", "Leche", "Gluten"],
  "PATO ASADO CON ARROZ SALTEADO": ["Huevo", "Sésamo", "Soja", "Gluten"]
};

import { dakinisDumplingResolvePdfKey } from "../../../platform/core/shared/catalog/dumpling-pdf-aliases.js";
import {
  dakinisFormatPublicDishName,
  dakinisPreferPublicDishLabel
} from "../../../platform/core/shared/catalog/restaurant-allergens.js";

const PDF = DUMPLING_HOUSE_PDF_ALLERGENS;

/** @type {Array<{ name: string, category: string, priceEur: number | null, pdfKey?: string, comboNumber?: number, comboIncludes?: string[] }>} */
export const DUMPLING_HOUSE_MENU_ITEMS = [
  { name: "Combo 1", category: "combo", priceEur: 10.95, comboNumber: 1, comboIncludes: ["2 ROLLITO VEGETAL", "8 GYOZAS DE POLLO", "REFRESCO/AGUA"] },
  { name: "Combo 2", category: "combo", priceEur: 9.5, comboNumber: 2, comboIncludes: ["ENSALADA CHINA", "MOXIAN DE CARNE", "REFRESCO/AGUA"] },
  { name: "Combo 3", category: "combo", priceEur: 11.95, comboNumber: 3, comboIncludes: ["NOODLES VEGETAL", "SHAOMAI", "REFRESCO/AGUA"] },
  { name: "Combo 4", category: "combo", priceEur: 13.95, comboNumber: 4, comboIncludes: ["ENSALADA CHINA", "POLLO CURRY CON ARROZ BLANCO", "REFRESCO/AGUA"] },
  { name: "Combo 5", category: "combo", priceEur: 13.95, comboNumber: 5, comboIncludes: ["2 ROLLITOS VEGETAL", "TERNERA SALSA GONBAO CON ARROZ BLANCO", "REFRESCO/AGUA"] },
  { name: "Combo 6", category: "combo", priceEur: 14.95, comboNumber: 6, comboIncludes: ["TEMPURA LANGOSTINO", "PATO ASADO CON ARROZ BLANCO", "REFRESCO/AGUA"] },
  { name: "TERNERA GONBAO", category: "plato", priceEur: 10.5, pdfKey: "TERNERA GONBAO" },
  { name: "POLLO GONBAO", category: "plato", priceEur: 10.5, pdfKey: "POLLO GONBAO" },
  { name: "PATO CON ARROZ FRITO", category: "plato", priceEur: 11.5, pdfKey: "PATO" },
  { name: "POLLO FRITO", category: "plato", priceEur: 9.95, pdfKey: "POLLO FRITO" },
  { name: "CERDO AGRIDULCE", category: "plato", priceEur: 10.5, pdfKey: "CERDO" },
  { name: "TERNERA SALSA OSTRAS", category: "plato", priceEur: 10.5, pdfKey: "TERNERA SALSA OSTRAS" },
  { name: "POLLO AGRIDULCE", category: "plato", priceEur: 10.5, pdfKey: "POLLO AGRIDULCE" },
  { name: "MO XIAN", category: "entrante", priceEur: 5.5, pdfKey: "MO XIAN" },
  { name: "PANBAO TERNERA", category: "entrante", priceEur: null, pdfKey: "PANBAO TERNERA" },
  { name: "PANBAO POLLO", category: "entrante", priceEur: null, pdfKey: "PANBAO POLLO" },
  { name: "PANBAO PATO", category: "entrante", priceEur: null, pdfKey: "PANBAO PATO" },
  { name: "UDON GAMBAS", category: "noodle", priceEur: 7.5, pdfKey: "UDON GAMBAS" },
  { name: "PAD THAI POLLO", category: "noodle", priceEur: 7.5, pdfKey: "PAD THAI POLLO" },
  { name: "NOODLES VEGETAL", category: "noodle", priceEur: 6.5, pdfKey: "NOODLES VEGETAL" },
  { name: "SHAOMAI CERDO", category: "entrante", priceEur: 5.5, pdfKey: "SHAOMAI CERDO" },
  { name: "BAO RELLENO CREMA HUEVO", category: "entrante", priceEur: 3.5, pdfKey: "BAO RELLENO CREMA HUEVO" },
  { name: "ARROZ BLANCO", category: "arroz", priceEur: 2.5, pdfKey: "ARROZ BLANCO" },
  { name: "ARROZ FRITO", category: "arroz", priceEur: 6.5, pdfKey: "ARROZ FRITO" },
  { name: "HAKAO LANGOSTINO", category: "entrante", priceEur: 6.5, pdfKey: "HAKAO LANGOSTINO" },
  { name: "BAO SHANGAI", category: "entrante", priceEur: 5.95, pdfKey: "BAO SHANGAI" },
  { name: "BAO CERDO Y VERDURAS", category: "entrante", priceEur: 2.95, pdfKey: "BAO CERDO Y VERDURAS" },
  { name: "GYOZAS TERNERA", category: "entrante", priceEur: 7.95, pdfKey: "DUMPLING TERNERA" },
  { name: "GYOZAS CERDO", category: "entrante", priceEur: 6.95, pdfKey: "CERDO ENTRANTE" },
  { name: "GYOZAS POLLO FRITAS", category: "entrante", priceEur: 7.5, pdfKey: "GYOZAS POLLO FRITAS" },
  { name: "SHA MAI", category: "entrante", priceEur: 5.5, pdfKey: "SHA MAI" },
  { name: "TEMPURA DE LANGOSTINOS", category: "entrante", priceEur: 6.5, pdfKey: "TEMPURA DE LANGOSTINOS" },
  { name: "GYOZAS CERDO FRITAS", category: "entrante", priceEur: 7.5, pdfKey: "GYOZAS CERDO FRITAS" },
  { name: "WAN TUM", category: "entrante", priceEur: 7.95, pdfKey: "WAN TUM" },
  { name: "MINIPAN CHINO FRITO", category: "entrante", priceEur: 3.5, pdfKey: "MINIPAN CHINO FRITO" },
  { name: "GYOZAS POLLO VAPOR", category: "entrante", priceEur: 6.95, pdfKey: "GYOZAS POLLO VAPOR" },
  { name: "GYOZAS CARNE VAPOR", category: "entrante", priceEur: 6.95, pdfKey: "GYOZAS CARNE VAPOR" },
  { name: "MINIPAN CHINO VAPOR", category: "entrante", priceEur: 1.5, pdfKey: "MINIPAN CHINO VAPOR" },
  { name: "GYOZAS VEGETAL", category: "entrante", priceEur: 6.95, pdfKey: "VEGETAL" },
  { name: "GYOZAS POLLO", category: "entrante", priceEur: 6.95, pdfKey: "GYOZA ENTRANTE POLLO" },
  { name: "PATO Y BOLETUS", category: "entrante", priceEur: 8.5, pdfKey: "PATO Y BOLETUS" },
  { name: "ROLLITO LANGOSTINO MANGO", category: "entrante", priceEur: 6.5, pdfKey: "ROLLITO LANGOSTINO MANGO" },
  { name: "ROLLITO VIETNAMITA POLLO", category: "entrante", priceEur: 3.95, pdfKey: "ROLLITO VIETNAMITA POLLO" },
  { name: "ROLLITO VEGETAL", category: "entrante", priceEur: 3.5, pdfKey: "ROLLITO VEGETAL" },
  { name: "ENSALADA CHINA", category: "entrante", priceEur: 2.95, pdfKey: "ENSALADA CHINA" },
  { name: "EDAMAME", category: "entrante", priceEur: 2.95, pdfKey: "EDAMAME" },
  { name: "WAKAME", category: "entrante", priceEur: 3.95, pdfKey: "WAKAME" }
];

/** Español (PDF) → catalogId UE */
export const DUMPLING_ALLERGEN_ES_TO_CATALOG = {
  Huevo: "eggs",
  Cacahuete: "peanuts",
  Apio: "celery",
  Pescado: "fish",
  Sulfitos: "sulphites",
  Sésamo: "sesame",
  Altramuz: "lupin",
  Soja: "soy",
  "Crustáceos": "crustaceans",
  Leche: "milk",
  "Frutos secos": "nuts",
  Moluscos: "molluscs",
  Mostaza: "mustard",
  Gluten: "gluten"
};

export const DUMPLING_HOUSE_TENANT = {
  businessId: "biz_dumpling_house",
  slug: "dumpling-house",
  name: "Dumpling House",
  type: "restaurante",
  plan: "starter",
  userId: "usr_dumpling_house_1",
  email: "admin@dumpling-house.local",
  password: "demo123",
  publicToken: "dumplinghouseqr2026",
  venueName: "Dumpling House"
};

export function dumplingResolvePdfKey(menuNameOrKey) {
  return dakinisDumplingResolvePdfKey(menuNameOrKey);
}

function dumplingCatLabel(c) {
  return { combo: "Combo", entrante: "Entrante", plato: "Plato principal", arroz: "Arroz", noodle: "Noodles" }[
    c
  ] || c;
}

/**
 * Platos únicos para allergies_json (una fila por ficha PDF, sin duplicar combo + carta + PDF).
 * @param {typeof DUMPLING_ALLERGEN_ES_TO_CATALOG} allergenMap
 */
export function dumplingBuildDedupedDishRows(allergenMap = DUMPLING_ALLERGEN_ES_TO_CATALOG) {
  const dishByPdf = new Map();
  const catalogHits = new Map();

  function addDish(displayName, category, pdfKeyInput) {
    const canonicalKey = dumplingResolvePdfKey(pdfKeyInput);
    const allergens = dumplingAllergensForPdfKey(canonicalKey);
    const notes = dumplingDishAllergenNotes(canonicalKey);
    const entry = {
      id: `dish_${canonicalKey.replace(/\s+/g, "_").toLowerCase().slice(0, 48)}`,
      name: displayName,
      canonicalKey,
      category: dumplingCatLabel(category),
      present: true,
      severity: allergens.length ? "alta" : "info",
      notes
    };

    const prev = dishByPdf.get(canonicalKey);
    if (!prev || dakinisPreferPublicDishLabel(displayName, prev.name)) {
      dishByPdf.set(canonicalKey, entry);
    }

    const label = dishByPdf.get(canonicalKey).name;
    for (const es of allergens) {
      const catalogId = allergenMap[es];
      if (!catalogId) continue;
      const list = catalogHits.get(catalogId) || new Set();
      list.add(label);
      catalogHits.set(catalogId, list);
    }
  }

  for (const item of DUMPLING_HOUSE_MENU_ITEMS) {
    if (item.category === "combo") {
      for (const part of item.comboIncludes || []) {
        if (/REFRESCO|AGUA/i.test(part)) continue;
        addDish(part, "combo", part);
      }
      continue;
    }
    addDish(item.name, item.category, item.pdfKey || item.name);
  }

  for (const pdfName of Object.keys(DUMPLING_HOUSE_PDF_ALLERGENS)) {
    const canonicalKey = dumplingResolvePdfKey(pdfName);
    if (dishByPdf.has(canonicalKey)) continue;
    if (!DUMPLING_HOUSE_PDF_ALLERGENS[pdfName].length) continue;
    addDish(dakinisFormatPublicDishName(pdfName), "entrante", pdfName);
  }

  return { dishRows: [...dishByPdf.values()], catalogHits };
}

export function dumplingAllergensForPdfKey(pdfKey) {
  const key = dumplingResolvePdfKey(pdfKey);
  return PDF[key] ?? [];
}

/** Notas de carta por plato (alérgenos PDF + hongos en noodles). */
export function dumplingDishAllergenNotes(pdfKey) {
  const resolved = dumplingResolvePdfKey(pdfKey);
  const allergens = PDF[resolved] ?? [];
  const parts = [];
  if (allergens.length) parts.push(allergens.join(", "));
  else if (!DUMPLING_NOODLE_PDF_KEYS.has(resolved)) {
    parts.push("Sin alérgenos declarados en carta");
  }
  if (DUMPLING_NOODLE_PDF_KEYS.has(resolved)) {
    parts.push(dumplingNoodleMushroomNote());
  }
  return parts.join(". ");
}

export function dumplingBuildConfigJson() {
  return {
    menu: {
      venue: "Dumpling House",
      currency: "EUR",
      source: "C:\\Users\\Christian\\Downloads\\Dumplings (May 2026)",
      mushrooms: DUMPLING_HOUSE_MUSHROOMS,
      mushroomsMayAppearIn: ["UDON GAMBAS", "PAD THAI POLLO", "NOODLES VEGETAL"],
      combos: DUMPLING_HOUSE_MENU_ITEMS.filter((i) => i.category === "combo"),
      items: DUMPLING_HOUSE_MENU_ITEMS.filter((i) => i.category !== "combo")
    }
  };
}

/** Fila extra en perfil QR (cartel). */
export function dumplingMushroomCustomAllergenRow(selected = DUMPLING_HOUSE_MUSHROOMS) {
  return {
    id: "custom_hongos_noodles",
    name: "Hongos",
    category: "Ingredientes",
    present: selected.length > 0,
    severity: "info",
    mushroomTypes: [...selected],
    notes: selected.length
      ? `${selected.join(", ")}. Pueden estar presentes en UDON, Pad Thai y Noodles.`
      : ""
  };
}
