import type { RefObject } from "react";
import type { Character } from "../../types/character";
import type { LegalDocKey } from "../../legal/content";
import { BottomNav, type NavTab } from "../layout/BottomNav";
import { MobileHeader } from "../layout/MobileHeader";
import { MoreSheet } from "../layout/MoreSheet";
import type { MorePanel } from "../layout/more-options";
import { CharacterSheet } from "../CharacterSheet";
import { CombatPanel } from "../CombatPanel";
import { SpellsPanel } from "../SpellsPanel";
import { ArsenalPanel } from "../ArsenalPanel";
import { ItemsPanel } from "../ItemsPanel";
import { CombosPanel } from "../CombosPanel";
import { CompendiumPanel } from "../CompendiumPanel";
import { SessionNotesPanel } from "../SessionNotesPanel";
import { DiceRollerPanel } from "../DiceRollerPanel";
import { CampaignPanel } from "../CampaignPanel";
import { exportCharacter, exportAllCharacters } from "../../lib/io";
import { exportCharacterPdf } from "../../lib/export-pdf";
import { HiddenImportInput } from "./HiddenImportInput";

type Props = {
  character: Character;
  characters: Character[];
  importMessage: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImportFile: (file: File) => void;
  navTab: NavTab;
  morePanel: MorePanel | null;
  moreOpen: boolean;
  onBackToList: () => void;
  onNav: (tab: NavTab) => void;
  onMoreClose: () => void;
  onMoreSelect: (panel: MorePanel) => void;
  onEditBuild: () => void;
  onLoadExample: () => void;
  onLegal: (doc: LegalDocKey) => void;
  onImportJson: () => void;
  onSignIn: () => void;
  onUpdateCharacter: (fn: (c: Character) => Character) => void;
  onOpenDice: () => void;
};

export function AppPlayShell({
  character,
  characters,
  importMessage,
  fileInputRef,
  onImportFile,
  navTab,
  morePanel,
  moreOpen,
  onBackToList,
  onNav,
  onMoreClose,
  onMoreSelect,
  onEditBuild,
  onLoadExample,
  onLegal,
  onImportJson,
  onSignIn,
  onUpdateCharacter,
  onOpenDice,
}: Props) {
  return (
    <div className="app-shell">
      <HiddenImportInput fileInputRef={fileInputRef} onImportFile={onImportFile} />
      {importMessage && <div className="toast toast--info">{importMessage}</div>}

      <MobileHeader
        character={character}
        onBack={onBackToList}
        onSwitch={onBackToList}
        onDice={onOpenDice}
      />

      <main className="app-main">
        {morePanel === "campana" && <CampaignPanel onSignIn={onSignIn} />}
        {morePanel === "inventario" && <ItemsPanel character={character} onChange={onUpdateCharacter} />}
        {morePanel === "combos" && <CombosPanel character={character} />}
        {morePanel === "compendio" && <CompendiumPanel />}
        {morePanel === "sesion" && <SessionNotesPanel character={character} onChange={onUpdateCharacter} />}
        {morePanel === "dados" && <DiceRollerPanel character={character} />}
        {!morePanel && navTab === "ficha" && (
          <CharacterSheet character={character} onChange={onUpdateCharacter} compact />
        )}
        {!morePanel && navTab === "combate" && (
          <CombatPanel character={character} onChange={onUpdateCharacter} />
        )}
        {!morePanel && navTab === "hechizos" && (
          <SpellsPanel character={character} onChange={onUpdateCharacter} />
        )}
        {!morePanel && navTab === "arsenal" && (
          <ArsenalPanel character={character} onChange={onUpdateCharacter} />
        )}
      </main>

      <BottomNav active={morePanel ? "mas" : navTab} onChange={onNav} />

      <MoreSheet
        open={moreOpen}
        onClose={onMoreClose}
        onSelect={onMoreSelect}
        onEditBuild={onEditBuild}
        onLoadExample={onLoadExample}
        onLegal={() => onLegal("privacy")}
        onExportPdf={() => exportCharacterPdf(character)}
        onExportJson={() => exportCharacter(character)}
        onExportAllJson={() => exportAllCharacters(characters)}
        onImportJson={onImportJson}
      />
    </div>
  );
}
