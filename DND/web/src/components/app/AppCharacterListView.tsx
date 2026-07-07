import type { RefObject } from "react";
import type { Character } from "../../types/character";
import type { TabletopUser } from "../../types/campaign";
import type { LegalDocKey } from "../../legal/content";
import { CharacterList } from "../creation/CharacterList";
import { HiddenImportInput } from "./HiddenImportInput";

type Props = {
  characters: Character[];
  importMessage: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImportFile: (file: File) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onExportAll: () => void;
  onImport: () => void;
  onLegal: (doc: LegalDocKey) => void;
  user: TabletopUser | null;
  onLogout?: () => void;
  onSignIn?: () => void;
};

export function AppCharacterListView({
  characters,
  importMessage,
  fileInputRef,
  onImportFile,
  onSelect,
  onCreate,
  onDelete,
  onExport,
  onExportAll,
  onImport,
  onLegal,
  user,
  onLogout,
  onSignIn,
}: Props) {
  return (
    <>
      <HiddenImportInput fileInputRef={fileInputRef} onImportFile={onImportFile} />
      {importMessage && <div className="toast toast--info">{importMessage}</div>}
      <CharacterList
        characters={characters}
        onSelect={onSelect}
        onCreate={onCreate}
        onDelete={onDelete}
        onExport={onExport}
        onExportAll={onExportAll}
        onImport={onImport}
        onLegal={() => onLegal("privacy")}
        user={user}
        onLogout={onLogout}
        onSignIn={onSignIn}
      />
    </>
  );
}
