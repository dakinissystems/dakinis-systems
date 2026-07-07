import type { CharacterTab } from "../../types/character";
import type { TranslateFn } from "../../context/LocaleContext";

export type MorePanel = Extract<CharacterTab, "combos" | "compendio" | "inventario" | "sesion" | "dados" | "campana">;

export function getMoreOptions(t: TranslateFn): { id: MorePanel; label: string; desc: string }[] {
  return [
    { id: "campana", label: t("more.campaignTitle"), desc: t("more.campaignDesc") },
    { id: "dados", label: t("more.diceTitle"), desc: t("more.diceDesc") },
    { id: "sesion", label: t("more.sessionTitle"), desc: t("more.sessionDesc") },
    { id: "inventario", label: t("more.inventoryTitle"), desc: t("more.inventoryDesc") },
    { id: "combos", label: t("more.combosTitle"), desc: t("more.combosDesc") },
    { id: "compendio", label: t("more.compendiumTitle"), desc: t("more.compendiumDesc") },
  ];
}
