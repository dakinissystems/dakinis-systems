import type { RefObject } from "react";
import { useLocale } from "../../context/LocaleContext";

type Props = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImportFile: (file: File) => void;
};

export function HiddenImportInput({ fileInputRef, onImportFile }: Props) {
  const { t } = useLocale();

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept="application/json,.json"
      hidden
      aria-label={t("more.importJsonTitle")}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) void onImportFile(file);
        e.target.value = "";
      }}
    />
  );
}
