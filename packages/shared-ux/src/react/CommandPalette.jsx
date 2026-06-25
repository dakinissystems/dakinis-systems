import { useCallback, useEffect, useMemo, useState } from "react";
import { filterCommands, SEARCH_SCOPES, DAKINIS_COMMANDS } from "../command-palette.js";
import { COMMAND_PALETTE_SHORTCUT } from "../hub-nav.js";

/**
 * Command Palette global — Ctrl+K / Cmd+K.
 * @param {{ open: boolean; onClose: () => void; onRun: (cmd: { id: string; label: string }) => void; extraCommands?: object[]; t?: (k: string) => string }} props
 */
export default function CommandPalette({ open, onClose, onRun, extraCommands = [], t = (k) => k }) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");

  const commands = useMemo(() => filterCommands(query, extraCommands), [query, extraCommands]);

  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setScope("all");
      return undefined;
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div className="dakinis-cmdk-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dakinis-cmdk"
        role="dialog"
        aria-modal="true"
        aria-label={t("cmdk.title")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dakinis-cmdk__search-row">
          <span className="dakinis-cmdk__kbd" aria-hidden="true">
            ⌘K
          </span>
          <input
            autoFocus
            className="dakinis-cmdk__input"
            placeholder={t("cmdk.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && commands[0]) {
                onRun(commands[0]);
                onClose();
              }
            }}
          />
        </div>
        <div className="dakinis-cmdk__scopes" role="tablist">
          {SEARCH_SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={scope === s.id}
              className={`dakinis-cmdk__scope${scope === s.id ? " is-active" : ""}`}
              onClick={() => setScope(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <ul className="dakinis-cmdk__list" role="listbox">
          {commands.length === 0 ? (
            <li className="dakinis-cmdk__empty">{t("cmdk.noResults")}</li>
          ) : (
            commands.slice(0, 12).map((cmd) => (
              <li key={cmd.id}>
                <button
                  type="button"
                  className="dakinis-cmdk__item"
                  role="option"
                  onClick={() => {
                    onRun(cmd);
                    onClose();
                  }}
                >
                  <span>{cmd.label}</span>
                  <span className="dakinis-cmdk__group">{cmd.group}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <footer className="dakinis-cmdk__footer">
          <span>{t("cmdk.hintNavigate")}</span>
          <span>{t("cmdk.hintAi")}</span>
        </footer>
      </div>
    </div>
  );
}

/** Hook atajo global Ctrl/Cmd+K */
export function useCommandPaletteShortcut(onOpen) {
  useEffect(() => {
    function onKeyDown(e) {
      const isK = e.key?.toLowerCase() === COMMAND_PALETTE_SHORTCUT.key;
      const mod = e.ctrlKey || e.metaKey;
      if (isK && mod) {
        e.preventDefault();
        onOpen();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpen]);
}

export { DAKINIS_COMMANDS };
