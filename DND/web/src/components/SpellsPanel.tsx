import { useMemo, useState } from "react";
import type { Character, Spell } from "../types/character";
import { SRD_SPELLS, resolveClassId, srdSpellToCharacterSpell, spellsByClass } from "../data/srd";
import type { SpellBook } from "../data/srd/types";
import { maxPreparedSpells } from "../engine/formulas";
import { SpellsCatalog, SpellsMyList } from "./spells/SpellsSections";
import { SpellCustomModal } from "./spells/SpellCustomModal";

type Props = {
  character: Character;
  onChange: (fn: (c: Character) => Character) => void;
};

export function SpellsPanel({ character, onChange }: Props) {
  const [draft, setDraft] = useState<Spell | null>(null);
  const [filter, setFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [showClassOnly, setShowClassOnly] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<SpellBook | "">("");

  const closeModal = () => setDraft(null);

  const classId = resolveClassId(character);
  const prepared = character.spells.filter((s) => s.isPrepared);
  const maxPrep = maxPreparedSpells(character);
  const knownNames = new Set(character.spells.map((s) => s.name.toLowerCase()));

  const catalog = useMemo(() => {
    let list = classId && showClassOnly ? spellsByClass(classId, 9) : SRD_SPELLS;
    if (sourceFilter) list = list.filter((s) => s.source === sourceFilter);
    if (levelFilter !== "") list = list.filter((s) => s.level === +levelFilter);
    if (filter.trim()) {
      const q = filter.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [classId, showClassOnly, levelFilter, filter, sourceFilter]);

  const openCustom = () => {
    setDraft({
      id: crypto.randomUUID(),
      name: "",
      level: 1,
      school: "Evocation",
      castingTime: "1 Action",
      range: "Self",
      components: "V, S",
      duration: "Instantaneous",
      description: "",
      isPrepared: false,
      source: "custom",
    });
  };

  const addFromSrd = (spellId: string) => {
    const spell = SRD_SPELLS.find((s) => s.id === spellId);
    if (!spell || knownNames.has(spell.name.toLowerCase())) return;
    onChange((c) => ({ ...c, spells: [...c.spells, srdSpellToCharacterSpell(spell)] }));
  };

  const addAllClassSpells = () => {
    if (!classId) return;
    const maxLevel =
      character.level >= 17 ? 5 : character.level >= 13 ? 4 : character.level >= 7 ? 3 : character.level >= 3 ? 2 : 1;
    const toAdd: Spell[] = [];
    for (const spell of spellsByClass(classId, maxLevel)) {
      if (!knownNames.has(spell.name.toLowerCase())) {
        toAdd.push(srdSpellToCharacterSpell(spell));
      }
    }
    if (toAdd.length === 0) return;
    onChange((c) => ({ ...c, spells: [...c.spells, ...toAdd] }));
  };

  const saveSpell = () => {
    if (!draft?.name.trim()) return;
    onChange((c) => {
      const exists = c.spells.some((s) => s.id === draft.id);
      return {
        ...c,
        spells: exists ? c.spells.map((s) => (s.id === draft.id ? draft : s)) : [...c.spells, draft],
      };
    });
    closeModal();
  };

  const filterLower = filter.toLowerCase();
  const characterSpells = filterLower
    ? character.spells.filter(
        (s) =>
          s.name.toLowerCase().includes(filterLower) ||
          s.school.toLowerCase().includes(filterLower),
      )
    : character.spells;

  return (
    <div className="grid-2">
      <SpellsMyList
        character={character}
        characterSpells={characterSpells}
        preparedCount={prepared.length}
        maxPrep={maxPrep}
        onChange={onChange}
        onEdit={setDraft}
        onOpenCustom={openCustom}
      />

      <SpellsCatalog
        catalog={catalog}
        knownNames={knownNames}
        filter={filter}
        levelFilter={levelFilter}
        sourceFilter={sourceFilter}
        showClassOnly={showClassOnly}
        classId={classId}
        onFilterChange={setFilter}
        onLevelFilterChange={setLevelFilter}
        onSourceFilterChange={setSourceFilter}
        onShowClassOnlyChange={setShowClassOnly}
        onAddFromSrd={addFromSrd}
        onAddAllClassSpells={addAllClassSpells}
      />

      {draft && (
        <SpellCustomModal
          draft={draft}
          onChange={setDraft}
          onClose={closeModal}
          onSave={saveSpell}
        />
      )}
    </div>
  );
}
