import { jsPDF } from "jspdf";
import type { Character } from "../types/character";
import { DEFAULT_RULESET } from "../brand";
import { en } from "../locales/en";
import { es } from "../locales/es";
import {
  calculateAC,
  className,
  getAbilityMod,
  getAbilityScore,
  spellSaveDC,
} from "../engine/formulas";
import { formatModifier } from "../engine/dice";
import type { Ability } from "../types/character";

const ABILITIES: { key: Ability; label: string; abbr: string }[] = [
  { key: "str", label: "Fuerza", abbr: "FUE" },
  { key: "dex", label: "Destreza", abbr: "DES" },
  { key: "con", label: "Constitución", abbr: "CON" },
  { key: "int", label: "Inteligencia", abbr: "INT" },
  { key: "wis", label: "Sabiduría", abbr: "SAB" },
  { key: "cha", label: "Carisma", abbr: "CAR" },
];

const SKILLS = [
  { name: "Acrobacias", attr: "dex" as Ability },
  { name: "Atletismo", attr: "str" as Ability },
  { name: "Engaño", attr: "cha" as Ability },
  { name: "Historia", attr: "int" as Ability },
  { name: "Intimidación", attr: "cha" as Ability },
  { name: "Investigación", attr: "int" as Ability },
  { name: "Medicina", attr: "wis" as Ability },
  { name: "Naturaleza", attr: "int" as Ability },
  { name: "Percepción", attr: "wis" as Ability },
  { name: "Persuasión", attr: "cha" as Ability },
  { name: "Religión", attr: "int" as Ability },
  { name: "Sigilo", attr: "dex" as Ability },
  { name: "Supervivencia", attr: "wis" as Ability },
  { name: "Trato con animales", attr: "wis" as Ability },
  { name: "Arcanos", attr: "int" as Ability },
  { name: "Interpretación", attr: "cha" as Ability },
  { name: "Juego de manos", attr: "dex" as Ability },
  { name: "Perspicacia", attr: "wis" as Ability },
];

export function exportCharacterPdf(char: Character): void {
  const locale = localStorage.getItem("dakinis-tabletop-locale") === "es" ? "es" : "en";
  const productName = locale === "es" ? es.brand.fullName : en.brand.fullName;
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;

  doc.text(productName, pageWidth / 2, 16, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Hoja de personaje · ${DEFAULT_RULESET}`, pageWidth / 2, 22, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);

  drawSection(doc, "INFORMACIÓN BÁSICA", margin, 35, 90, 42);
  let y = 48;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nombre: ${char.name}`, margin + 2, y);
  y += 5;
  doc.text(`Raza: ${char.race}${char.heritage ? ` (${char.heritage})` : ""}`, margin + 2, y);
  y += 5;
  doc.text(`Clase: ${className(char)}`, margin + 2, y);
  y += 5;
  if (char.background) {
    doc.text(`Trasfondo: ${char.background}`, margin + 2, y);
    y += 5;
  }
  doc.text(`Alineamiento: ${char.alignment}`, margin + 2, y);

  drawSection(doc, "ATRIBUTOS", 110, 35, 125, 42);
  ABILITIES.forEach((attr, index) => {
    const x = 112 + (index % 3) * 40;
    const rowY = 48 + Math.floor(index / 3) * 14;
    const score = getAbilityScore(char, attr.key);
    const mod = getAbilityMod(char, attr.key);
    doc.circle(x + 8, rowY, 6);
    doc.setFontSize(8);
    doc.text(String(score), x + 8, rowY + 1, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(attr.label, x + 16, rowY);
    doc.setFont("helvetica", "normal");
    doc.text(formatModifier(mod), x + 16, rowY + 4);
  });

  drawSection(doc, "COMBATE", 245, 35, 42, 42);
  doc.setFontSize(10);
  doc.text(`CA: ${calculateAC(char)}`, 247, 48);
  doc.text(`PV: ${char.resources.currentHP}/${char.resources.maxHP}`, 247, 53);
  doc.text(`PB: +${char.proficiencyBonus}`, 247, 58);
  doc.text(`CD: ${spellSaveDC(char)}`, 247, 63);
  doc.text(`Iniciativa: ${formatModifier(getAbilityMod(char, "dex"))}`, 247, 68);

  drawSection(doc, "HABILIDADES", margin, 82, 180, 38);
  SKILLS.forEach((skill, index) => {
    const x = margin + 2 + (index % 6) * 30;
    const rowY = 90 + Math.floor(index / 6) * 8;
    const proficient = char.skillProficiencies.some(
      (s) => s.toLowerCase() === skill.name.toLowerCase() || s.toLowerCase().includes(skill.attr),
    );
    doc.rect(x, rowY - 3, 2.5, 2.5);
    if (proficient) doc.text("•", x + 0.4, rowY - 1.2);
    doc.setFontSize(6);
    doc.text(skill.name.slice(0, 12), x + 4, rowY - 1);
    const mod = getAbilityMod(char, skill.attr) + (proficient ? char.proficiencyBonus : 0);
    doc.text(formatModifier(mod), x + 4, rowY + 2.5);
  });

  drawSection(doc, "EQUIPAMIENTO", margin, 125, 130, 45);
  y = 133;
  doc.setFontSize(9);
  if (char.weapons.length) {
    doc.setFont("helvetica", "bold");
    doc.text("Armas:", margin + 2, y);
    doc.setFont("helvetica", "normal");
    y += 4;
    char.weapons.forEach((w) => {
      doc.text(`• ${w.name} (${w.damageDice}+${w.damageBonus})`, margin + 4, y);
      y += 4;
    });
  }
  if (char.armors.length) {
    doc.setFont("helvetica", "bold");
    doc.text("Armadura:", margin + 2, y);
    doc.setFont("helvetica", "normal");
    y += 4;
    char.armors.forEach((a) => {
      doc.text(`• ${a.name} (CA ${a.baseAC})`, margin + 4, y);
      y += 4;
    });
  }
  if (char.inventory.length) {
    doc.setFont("helvetica", "bold");
    doc.text("Objetos:", margin + 2, y);
    doc.setFont("helvetica", "normal");
    y += 4;
    char.inventory.slice(0, 8).forEach((item) => {
      doc.text(`• ${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`, margin + 4, y);
      y += 4;
    });
  }

  drawSection(doc, "HECHIZOS", 150, 125, 137, 45);
  y = 133;
  doc.setFontSize(8);
  const byLevel = new Map<number, string[]>();
  char.spells.forEach((s) => {
    const list = byLevel.get(s.level) ?? [];
    list.push(s.name);
    byLevel.set(s.level, list);
  });
  [...byLevel.entries()]
    .sort(([a], [b]) => a - b)
    .forEach(([level, names]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`Nivel ${level}:`, 152, y);
      doc.setFont("helvetica", "normal");
      y += 4;
      names.slice(0, 6).forEach((name) => {
        doc.text(`• ${name}`, 154, y);
        y += 3.5;
      });
      y += 1;
    });

  doc.addPage("landscape");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("DETALLES DEL PERSONAJE", pageWidth / 2, 20, { align: "center" });

  drawSection(doc, "RASGOS", margin, 35, pageWidth - margin * 2, 55);
  y = 43;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  char.traits.slice(0, 12).forEach((t) => {
    const lines = doc.splitTextToSize(`• ${t.name}: ${t.description}`, pageWidth - margin * 2 - 6);
    doc.text(lines, margin + 2, y);
    y += lines.length * 3.5 + 1;
  });

  drawSection(doc, "NOTAS", margin, 95, pageWidth - margin * 2, 35);
  doc.setFontSize(9);
  const notes = char.notes ?? "—";
  doc.text(doc.splitTextToSize(notes, pageWidth - margin * 2 - 6), margin + 2, 103);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    doc.text(`Generado ${new Date().toLocaleDateString("es-ES")}`, margin, pageHeight - 8);
  }

  const safeName = (char.name || "personaje").replace(/[^\w\s-]/g, "").trim() || "personaje";
  doc.save(`${safeName}_DnD5e_Ficha.pdf`);
}

function drawSection(doc: jsPDF, title: string, x: number, y: number, w: number, h: number): void {
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.rect(x, y, w, h);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title, x + 2, y + 5);
}
