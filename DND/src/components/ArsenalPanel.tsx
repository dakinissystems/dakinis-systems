import { useState } from "react";
import type { Character } from "../types/character";
import { WeaponsPanel } from "./WeaponsPanel";
import { ItemsPanel } from "./ItemsPanel";

type Props = {
  character: Character;
  onChange: (fn: (c: Character) => Character) => void;
};

type SubTab = "armas" | "inventario";

export function ArsenalPanel({ character, onChange }: Props) {
  const [sub, setSub] = useState<SubTab>("armas");

  return (
    <div className="arsenal">
      <div className="segmented" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={sub === "armas"}
          className={`segmented__btn ${sub === "armas" ? "segmented__btn--on" : ""}`}
          onClick={() => setSub("armas")}
        >
          Armas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sub === "inventario"}
          className={`segmented__btn ${sub === "inventario" ? "segmented__btn--on" : ""}`}
          onClick={() => setSub("inventario")}
        >
          Inventario
        </button>
      </div>
      {sub === "armas" ? (
        <WeaponsPanel character={character} onChange={onChange} />
      ) : (
        <ItemsPanel character={character} onChange={onChange} />
      )}
    </div>
  );
}
