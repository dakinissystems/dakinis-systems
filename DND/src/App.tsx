import { useState } from "react";
import type { Character } from "./types/character";
import { useCharacter } from "./hooks/useCharacter";
import { CharacterList } from "./components/creation/CharacterList";
import { CharacterWizard } from "./components/creation/CharacterWizard";
import { BottomNav, type NavTab } from "./components/layout/BottomNav";
import { MobileHeader } from "./components/layout/MobileHeader";
import { MoreSheet } from "./components/layout/MoreSheet";
import type { MorePanel } from "./components/layout/BottomNav";
import { CharacterSheet } from "./components/CharacterSheet";
import { CombatPanel } from "./components/CombatPanel";
import { SpellsPanel } from "./components/SpellsPanel";
import { ArsenalPanel } from "./components/ArsenalPanel";
import { ItemsPanel } from "./components/ItemsPanel";
import { CombosPanel } from "./components/CombosPanel";
import { CompendiumPanel } from "./components/CompendiumPanel";
import { createBlankCharacter } from "./data/character-factory";
import type { LegalDocKey } from "./legal/content";
import { LegalScreen } from "./components/LegalScreen";

type AppView = "list" | "wizard" | "play" | "legal";

export default function App() {
  const {
    character,
    characters,
    setActive,
    updateCharacter,
    addCharacter,
    removeCharacter,
    resetToExample,
  } = useCharacter();

  const [view, setView] = useState<AppView>("list");
  const [draft, setDraft] = useState<Character | null>(null);
  const [navTab, setNavTab] = useState<NavTab>("ficha");
  const [moreOpen, setMoreOpen] = useState(false);
  const [morePanel, setMorePanel] = useState<MorePanel | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocKey>("privacy");

  const openCharacter = (id: string) => {
    const c = characters.find((x) => x.id === id);
    if (!c) return;
    setActive(id);
    if (c.setupComplete === false) {
      setDraft(c);
      setView("wizard");
    } else {
      setView("play");
      setNavTab("ficha");
      setMorePanel(null);
    }
  };

  const startWizard = (existing?: Character) => {
    setDraft(existing ?? createBlankCharacter());
    setView("wizard");
  };

  const finishWizard = (char: Character) => {
    addCharacter(char);
    setDraft(null);
    setView("play");
    setNavTab("ficha");
  };

  const handleNav = (tab: NavTab) => {
    if (tab === "mas") {
      setMoreOpen(true);
      return;
    }
    setMorePanel(null);
    setNavTab(tab);
  };

  if (view === "legal") {
    return (
      <LegalScreen
        docKey={legalDoc}
        onBack={() => setView("list")}
        onSelect={setLegalDoc}
      />
    );
  }

  if (view === "list" || !character) {
    return (
      <CharacterList
        characters={characters}
        onSelect={openCharacter}
        onCreate={() => startWizard()}
        onDelete={characters.length > 1 ? removeCharacter : undefined}
        onLegal={() => {
          setLegalDoc("privacy");
          setView("legal");
        }}
      />
    );
  }

  if (view === "wizard" && draft) {
    return (
      <CharacterWizard
        draft={draft}
        onChange={setDraft}
        onComplete={finishWizard}
        onCancel={() => {
          setDraft(null);
          setView(characters.length ? "list" : "list");
        }}
      />
    );
  }

  if (!character) {
    return null;
  }

  return (
    <div className="app-shell">
      <MobileHeader
        character={character}
        onBack={() => setView("list")}
        onSwitch={() => setView("list")}
      />

      <main className="app-main">
        {morePanel === "inventario" && <ItemsPanel character={character} onChange={updateCharacter} />}
        {morePanel === "combos" && <CombosPanel character={character} />}
        {morePanel === "compendio" && <CompendiumPanel />}
        {!morePanel && navTab === "ficha" && <CharacterSheet character={character} onChange={updateCharacter} compact />}
        {!morePanel && navTab === "combate" && <CombatPanel character={character} onChange={updateCharacter} />}
        {!morePanel && navTab === "hechizos" && <SpellsPanel character={character} onChange={updateCharacter} />}
        {!morePanel && navTab === "arsenal" && <ArsenalPanel character={character} onChange={updateCharacter} />}
      </main>

      <BottomNav active={morePanel ? "mas" : navTab} onChange={handleNav} />

      <MoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onSelect={(panel) => {
          setMorePanel(panel);
          setNavTab("mas");
        }}
        onEditBuild={() => startWizard(structuredClone(character))}
        onLoadExample={() => {
          resetToExample();
          setView("play");
          setMorePanel(null);
          setNavTab("ficha");
        }}
        onLegal={() => {
          setLegalDoc("privacy");
          setView("legal");
        }}
      />
    </div>
  );
}
