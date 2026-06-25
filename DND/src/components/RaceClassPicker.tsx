import type { Character } from "../types/character";
import {
  SRD_CLASSES,
  SRD_RACES,
  SRD_SPELLS,
  applyClassToCharacter,
  applyRaceToCharacter,
  classByName,
  raceByName,
  resolveClassId,
  resolveRaceId,
} from "../data/srd";

type Props = {
  character: Character;
  onChange: (fn: (c: Character) => Character) => void;
};

export function RaceClassPicker({ character, onChange }: Props) {
  const currentRaceId = resolveRaceId(character) ?? "";
  const currentClassId = resolveClassId(character) ?? "";
  const race = currentRaceId ? SRD_RACES.find((r) => r.id === currentRaceId) : undefined;
  const cls = currentClassId ? SRD_CLASSES.find((c) => c.id === currentClassId) : undefined;
  const currentSubraceId =
    race?.subraces?.find((s) => s.name === character.heritage)?.id ?? "";
  const currentSubclassId =
    cls?.subclasses.find((s) => s.name === character.classes[0]?.subclass)?.id ?? "";

  return (
    <section className="panel">
      <h2>Raza y clase (SRD 5e)</h2>
      <div className="form-row">
        <div className="form-field">
          <label>Raza</label>
          <select
            value={currentRaceId}
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              onChange((c) => applyRaceToCharacter(c, id));
            }}
          >
            <option value="">— Seleccionar —</option>
            {SRD_RACES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.nameEn})
              </option>
            ))}
          </select>
        </div>
        {race?.subraces && race.subraces.length > 0 && (
          <div className="form-field">
            <label>Subraza / Herencia</label>
            <select
              value={currentSubraceId}
              onChange={(e) => {
                const subId = e.target.value;
                if (!currentRaceId) return;
                onChange((c) => applyRaceToCharacter(c, currentRaceId, subId || undefined));
              }}
            >
              <option value="">— Base —</option>
              {race.subraces!.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Clase</label>
          <select
            value={currentClassId}
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              onChange((c) => applyClassToCharacter(c, id));
            }}
          >
            <option value="">— Seleccionar —</option>
            {SRD_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (d{c.hitDie})
              </option>
            ))}
          </select>
        </div>
        {cls && cls.subclasses.length > 0 && (
          <div className="form-field">
            <label>Subclase</label>
            <select
              value={currentSubclassId}
              onChange={(e) => {
                const subId = e.target.value;
                if (!currentClassId) return;
                onChange((c) => applyClassToCharacter(c, currentClassId, subId || undefined));
              }}
            >
              <option value="">— Sin subclase —</option>
              {cls.subclasses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
        Base de datos: {SRD_RACES.length} razas · {SRD_CLASSES.length} clases · {SRD_SPELLS.length} hechizos
        (SRD + Xanathar + Tasha)
      </p>
    </section>
  );
}

/** Sincroniza ids si el personaje tiene nombres legacy del Excel */
export function syncLegacyNames(character: Character): Character {
  let c = character;
  const race = raceByName(character.race);
  if (race && character.race !== race.name) {
    c = applyRaceToCharacter(c, race.id);
  }
  const cls = classByName(character.classes[0]?.className ?? "");
  if (cls) {
    const sub = cls.subclasses.find(
      (s) =>
        character.classes[0]?.subclass?.toLowerCase().includes(s.id) ||
        character.classes[0]?.subclass?.toLowerCase().includes(s.nameEn.toLowerCase()),
    );
    c = applyClassToCharacter(c, cls.id, sub?.id);
  }
  return c;
}
