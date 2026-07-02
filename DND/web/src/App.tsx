import { useEffect, useRef, useState } from "react";

import type { Character } from "./types/character";

import type { TabletopUser } from "./types/campaign";

import { useCharacter } from "./hooks/useCharacter";

import { useAuth } from "./context/AuthContext";
import { useLocale } from "./context/LocaleContext";

import { AuthScreen } from "./components/AuthScreen";

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

import { SessionNotesPanel } from "./components/SessionNotesPanel";

import { DiceRollerPanel } from "./components/DiceRollerPanel";

import { CampaignPanel } from "./components/CampaignPanel";

import { createBlankCharacter } from "./data/character-factory";

import type { LegalDocKey } from "./legal/content";

import { LegalScreen } from "./components/LegalScreen";

import { exportCharacter, exportAllCharacters, parseImportFile } from "./lib/io";

import { exportCharacterPdf } from "./lib/export-pdf";



const OFFLINE_KEY = "dnd_offline";



type AppView = "list" | "wizard" | "play" | "legal";



type MainProps = {

  user: TabletopUser | null;

  onLogout: () => void;

  onSignIn: () => void;

};



function AppMain({ user, onLogout, onSignIn }: MainProps) {
  const { t } = useLocale();

  const {

    character,

    characters,

    setActive,

    updateCharacter,

    addCharacter,

    removeCharacter,

    resetToExample,

    importCharacters,

  } = useCharacter();



  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importMessage, setImportMessage] = useState<string | null>(null);



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



  const handleImportFile = async (file: File) => {

    try {

      const imported = await parseImportFile(file);

      importCharacters(imported, "merge");

      setImportMessage(

        imported.length === 1

          ? t("import.one", { name: imported[0].name })

          : t("import.many", { count: imported.length }),

      );

      if (imported.length === 1) {

        setActive(imported[0].id);

        setView("play");

        setNavTab("ficha");

      } else {

        setView("list");

      }

    } catch (err) {

      setImportMessage(err instanceof Error ? err.message : t("import.error"));

    }

    setTimeout(() => setImportMessage(null), 4000);

  };



  const triggerImport = () => fileInputRef.current?.click();



  const exportOne = (id: string) => {

    const c = characters.find((x) => x.id === id);

    if (c) exportCharacter(c);

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

  if (view === "wizard" && draft) {
    return (
      <CharacterWizard
        draft={draft}
        onChange={setDraft}
        onComplete={finishWizard}
        onCancel={() => {
          setDraft(null);
          setView("list");
        }}
      />
    );
  }

  if (view === "list" || !character) {

    return (

      <>

        <input

          ref={fileInputRef}

          type="file"

          accept="application/json,.json"

          hidden

          onChange={(e) => {

            const file = e.target.files?.[0];

            if (file) void handleImportFile(file);

            e.target.value = "";

          }}

        />

        {importMessage && <div className="toast toast--info">{importMessage}</div>}

        <CharacterList

          characters={characters}

          onSelect={openCharacter}

          onCreate={() => startWizard()}

          onDelete={removeCharacter}

          onExport={exportOne}

          onExportAll={() => exportAllCharacters(characters)}

          onImport={triggerImport}

          onLegal={() => {

            setLegalDoc("privacy");

            setView("legal");

          }}

          user={user}

          onLogout={user ? onLogout : undefined}

          onSignIn={!user ? onSignIn : undefined}

        />

      </>

    );

  }

  if (!character) {
    return null;
  }

  return (

    <div className="app-shell">

      <input

        ref={fileInputRef}

        type="file"

        accept="application/json,.json"

        hidden

        onChange={(e) => {

          const file = e.target.files?.[0];

          if (file) void handleImportFile(file);

          e.target.value = "";

        }}

      />

      {importMessage && <div className="toast toast--info">{importMessage}</div>}

      <MobileHeader

        character={character}

        onBack={() => setView("list")}

        onSwitch={() => setView("list")}

        onDice={() => {

          setMorePanel("dados");

          setNavTab("mas");

          setMoreOpen(false);

        }}

      />



      <main className="app-main">

        {morePanel === "campana" && <CampaignPanel onSignIn={onSignIn} />}

        {morePanel === "inventario" && <ItemsPanel character={character} onChange={updateCharacter} />}

        {morePanel === "combos" && <CombosPanel character={character} />}

        {morePanel === "compendio" && <CompendiumPanel />}

        {morePanel === "sesion" && <SessionNotesPanel character={character} onChange={updateCharacter} />}

        {morePanel === "dados" && <DiceRollerPanel character={character} />}

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

        onExportPdf={() => exportCharacterPdf(character)}

        onExportJson={() => exportCharacter(character)}

        onExportAllJson={() => exportAllCharacters(characters)}

        onImportJson={triggerImport}

      />

    </div>

  );

}



export default function App() {

  const { user, loading, logout } = useAuth();
  const { t } = useLocale();

  const [offline, setOffline] = useState(() => localStorage.getItem(OFFLINE_KEY) === "1");



  useEffect(() => {

    if (user) localStorage.removeItem(OFFLINE_KEY);

  }, [user]);



  const enterOffline = () => {

    localStorage.setItem(OFFLINE_KEY, "1");

    setOffline(true);

  };



  const showAuth = () => {

    localStorage.removeItem(OFFLINE_KEY);

    setOffline(false);

  };



  const handleLogout = () => {

    logout();

    showAuth();

  };



  if (loading) {

    return (

      <div className="screen screen--loading">

        <p>{t("app.loading")}</p>

      </div>

    );

  }



  if (!user && !offline) {

    return <AuthScreen onContinueOffline={enterOffline} />;

  }



  return <AppMain user={user} onLogout={handleLogout} onSignIn={showAuth} />;

}


