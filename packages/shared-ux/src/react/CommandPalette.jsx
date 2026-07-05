import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  filterCommands,
  SEARCH_SCOPES,
  DAKINIS_COMMANDS,
  searchHitGroupLabel,
} from "../command-palette.js";
import { COMMAND_PALETTE_SHORTCUT } from "../hub-nav.js";

const DEFAULT_MIN_SEARCH = 2;
const SEARCH_DEBOUNCE_MS = 280;

/**
 * Command Palette global — Ctrl+K / Cmd+K.
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   onRun: (cmd: { id: string; label: string }) => void;
 *   extraCommands?: object[];
 *   t?: (k: string) => string;
 *   fetchSearchHits?: (query: string, scope: string, signal: AbortSignal) => Promise<object[]>;
 *   onSelectSearchHit?: (hit: object) => void;
 *   minSearchLength?: number;
 * }} props
 */
export default function CommandPalette({
  open,
  onClose,
  onRun,
  extraCommands = [],
  t = (k) => k,
  fetchSearchHits,
  onSelectSearchHit,
  minSearchLength = DEFAULT_MIN_SEARCH,
}) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [searchHits, setSearchHits] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchSeq = useRef(0);

  const commands = useMemo(() => filterCommands(query, extraCommands), [query, extraCommands]);

  const listItems = useMemo(() => {
    const hits = searchHits.map((hit) => ({
      kind: "search",
      key: `search:${hit.scope}:${hit.id}`,
      hit,
      label: hit.title || hit.id || t("cmdk.searchResult"),
      group: searchHitGroupLabel(hit.scope),
      snippet: hit.snippet || "",
    }));
    const cmds = commands.map((cmd) => ({
      kind: "command",
      key: `cmd:${cmd.id}`,
      cmd,
      label: cmd.label,
      group: cmd.group,
      snippet: "",
    }));
    return [...hits, ...cmds];
  }, [searchHits, commands, t]);

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
      setSearchHits([]);
      setSearchLoading(false);
      return undefined;
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  useEffect(() => {
    if (!open || !fetchSearchHits) {
      setSearchHits([]);
      setSearchLoading(false);
      return undefined;
    }

    const trimmed = String(query || "").trim();
    if (trimmed.length < minSearchLength) {
      setSearchHits([]);
      setSearchLoading(false);
      return undefined;
    }

    const seq = ++searchSeq.current;
    const controller = new AbortController();
    setSearchLoading(true);

    const timer = setTimeout(() => {
      fetchSearchHits(trimmed, scope, controller.signal)
        .then((hits) => {
          if (seq !== searchSeq.current) return;
          setSearchHits(Array.isArray(hits) ? hits : []);
        })
        .catch(() => {
          if (seq !== searchSeq.current) return;
          setSearchHits([]);
        })
        .finally(() => {
          if (seq !== searchSeq.current) return;
          setSearchLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, query, scope, fetchSearchHits, minSearchLength]);

  function activateItem(item) {
    if (!item) return;
    if (item.kind === "search") {
      onSelectSearchHit?.(item.hit);
    } else {
      onRun(item.cmd);
    }
    onClose();
  }

  if (!open) return null;

  const showEmpty = listItems.length === 0 && !searchLoading;

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
              if (e.key === "Enter" && listItems[0]) {
                activateItem(listItems[0]);
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
          {searchLoading ? (
            <li className="dakinis-cmdk__empty dakinis-cmdk__loading">{t("cmdk.searchLoading")}</li>
          ) : showEmpty ? (
            <li className="dakinis-cmdk__empty">{t("cmdk.noResults")}</li>
          ) : (
            listItems.slice(0, 12).map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={`dakinis-cmdk__item${item.kind === "search" ? " dakinis-cmdk__item--search" : ""}`}
                  role="option"
                  onClick={() => activateItem(item)}
                >
                  <span className="dakinis-cmdk__item-main">
                    <span>{item.label}</span>
                    {item.snippet ? (
                      <span className="dakinis-cmdk__snippet">{item.snippet}</span>
                    ) : null}
                  </span>
                  <span className="dakinis-cmdk__group">{item.group}</span>
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
