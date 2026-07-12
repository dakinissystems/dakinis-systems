import { useEffect, useRef, useState } from "react";

import type { Character } from "./types/character";

import type { TabletopUser } from "./types/campaign";

import { useCharacter } from "./hooks/useCharacter";

import { useAuth } from "./context/AuthContext";
import { useLocale } from "./context/LocaleContext";

import { tabletopApi, tabletopSetToken } from "./api/client";
import { AUTH_TOKEN_KEY } from "./lib/auth-storage";
import { clearPlatformTokenFromUrl, readPlatformTokenFromLocation } from "./lib/platform-auth";
import { AuthScreen } from "./components/AuthScreen";
import { ForgotPasswordScreen } from "./components/ForgotPasswordScreen";
import { PasswordResetScreen } from "./components/PasswordResetScreen";
import { RegisterCompleteScreen } from "./components/RegisterCompleteScreen";

import { CharacterWizard } from "./components/creation/CharacterWizard";

import type { NavTab } from "./components/layout/BottomNav";

import type { MorePanel } from "./components/layout/more-options";

import { createBlankCharacter } from "./data/character-factory";

import type { LegalDocKey } from "./legal/content";

import { LegalScreen } from "./components/LegalScreen";

import { exportCharacter, exportAllCharacters, parseImportFile } from "./lib/io";

import { AppCharacterListView } from "./components/app/AppCharacterListView";
import { AppPlayShell } from "./components/app/AppPlayShell";

const OFFLINE_KEY = "dnd_offline";

type AuthRoute = "default" | "forgot-password" | "password-reset" | "register-complete";

function resolveAuthRoute(): AuthRoute {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/login/reset") return "password-reset";
  if (path === "/register/complete") return "register-complete";
  if (path === "/login/forgot") return "forgot-password";
  return "default";
}

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
      <AppCharacterListView
        characters={characters}
        importMessage={importMessage}
        fileInputRef={fileInputRef}
        onImportFile={handleImportFile}
        onSelect={openCharacter}
        onCreate={() => startWizard()}
        onDelete={removeCharacter}
        onExport={exportOne}
        onExportAll={() => exportAllCharacters(characters)}
        onImport={triggerImport}
        onLegal={(doc) => {
          setLegalDoc(doc);
          setView("legal");
        }}
        user={user}
        onLogout={user ? onLogout : undefined}
        onSignIn={!user ? onSignIn : undefined}
      />
    );
  }

  return (
    <AppPlayShell
      character={character}
      characters={characters}
      importMessage={importMessage}
      fileInputRef={fileInputRef}
      onImportFile={handleImportFile}
      navTab={navTab}
      morePanel={morePanel}
      moreOpen={moreOpen}
      onBackToList={() => setView("list")}
      onNav={handleNav}
      onMoreClose={() => setMoreOpen(false)}
      onMoreSelect={(panel) => {
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
      onLegal={(doc) => {
        setLegalDoc(doc);
        setView("legal");
      }}
      onImportJson={triggerImport}
      onSignIn={onSignIn}
      onUpdateCharacter={updateCharacter}
      onOpenDice={() => {
        setMorePanel("dados");
        setNavTab("mas");
        setMoreOpen(false);
      }}
    />
  );
}

export default function App() {
  const { user, loading, logout } = useAuth();
  const { t } = useLocale();

  const [offline, setOffline] = useState(() => localStorage.getItem(OFFLINE_KEY) === "1");
  const [authRoute, setAuthRoute] = useState<AuthRoute>(() => resolveAuthRoute());
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    const platformToken = readPlatformTokenFromLocation();
    if (!platformToken || user) return;
    setGoogleBusy(true);
    void tabletopApi
      .platformExchange(platformToken)
      .then(({ user: u, token }) => {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        tabletopSetToken(token);
        clearPlatformTokenFromUrl();
        window.location.reload();
        void u;
      })
      .catch(() => {
        clearPlatformTokenFromUrl();
      })
      .finally(() => setGoogleBusy(false));
  }, [user]);

  useEffect(() => {
    setAuthRoute(resolveAuthRoute());
    const onPop = () => setAuthRoute(resolveAuthRoute());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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

  if (loading || googleBusy) {
    return (
      <div className="screen screen--loading">
        <p>{t("app.loading")}</p>
      </div>
    );
  }

  if (!user && !offline) {
    if (authRoute === "password-reset") {
      return <PasswordResetScreen />;
    }
    if (authRoute === "register-complete") {
      return <RegisterCompleteScreen />;
    }
    if (authRoute === "forgot-password") {
      return (
        <ForgotPasswordScreen
          onBack={() => {
            window.history.replaceState({}, "", "/");
            setAuthRoute("default");
          }}
        />
      );
    }
    return (
      <AuthScreen
        onContinueOffline={enterOffline}
        onForgotPassword={() => {
          window.history.pushState({}, "", "/login/forgot");
          setAuthRoute("forgot-password");
        }}
      />
    );
  }

  return <AppMain user={user} onLogout={handleLogout} onSignIn={showAuth} />;
}
