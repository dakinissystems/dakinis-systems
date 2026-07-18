import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  filterCommands,
  SEARCH_SCOPES,
  DAKINIS_COMMANDS,
  searchHitGroupLabel,
} from "../command-palette.js";
import { COMMAND_PALETTE_SHORTCUT } from "../hub-nav.js";
import { EMPTY_EXTRA_COMMANDS } from "./constants.js";

const DEFAULT_MIN_SEARCH = 2;
const SEARCH_DEBOUNCE_MS = 280;
const defaultTranslate = (key) => key;

const initialSearchState = { hits: [], loading: false };

function searchReducer(state, action) {
  switch (action.type) {
    case "idle":
      return initialSearchState;
    case "loading":
      return { ...state, loading: true };
    case "done":
      return { hits: action.hits, loading: false };
    default:
      return state;
  }
}

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
  extraCommands = EMPTY_EXTRA_COMMANDS,
  t = defaultTranslate,
  fetchSearchHits,
  onSelectSearchHit,
  minSearchLength = DEFAULT_MIN_SEARCH,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onCancel(e) {
      e.preventDefault();
      onClose();
    }
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="dakinis-cmdk-dialog"
      aria-label={t("cmdk.title")}
    >
      {open ? (
        <>
          <button
            type="button"
            className="dakinis-cmdk-dialog__backdrop"
            aria-label="Close"
            onClick={onClose}
          />
          <CommandPaletteBody
            onClose={onClose}
            onRun={onRun}
            extraCommands={extraCommands}
            t={t}
            fetchSearchHits={fetchSearchHits}
            onSelectSearchHit={onSelectSearchHit}
            minSearchLength={minSearchLength}
          />
        </>
      ) : null}
    </dialog>
  );
}

function CommandPaletteBody({
  onClose,
  onRun,
  extraCommands,
  t = defaultTranslate,
  fetchSearchHits,
  onSelectSearchHit,
  minSearchLength,
}) {
  const inputRef = useRef(null);
  const searchSeq = useRef(0);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [searchState, dispatchSearch] = useReducer(searchReducer, initialSearchState);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands = useMemo(() => filterCommands(query, extraCommands), [query, extraCommands]);

  const trimmed = String(query || "").trim();
  const canFetchSearch = Boolean(fetchSearchHits) && trimmed.length >= minSearchLength;

  useEffect(() => {
    if (!canFetchSearch) {
      dispatchSearch({ type: "idle" });
      return undefined;
    }

    const seq = ++searchSeq.current;
    const controller = new AbortController();
    dispatchSearch({ type: "loading" });

    const timer = setTimeout(() => {
      fetchSearchHits(trimmed, scope, controller.signal)
        .then((hits) => {
          if (seq !== searchSeq.current) return;
          dispatchSearch({ type: "done", hits: Array.isArray(hits) ? hits : [] });
        })
        .catch(() => {
          if (seq !== searchSeq.current) return;
          dispatchSearch({ type: "done", hits: [] });
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [canFetchSearch, trimmed, scope, fetchSearchHits, minSearchLength]);

  const searchHits = canFetchSearch ? searchState.hits : [];
  const searchLoading = canFetchSearch && searchState.loading;

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
  const listItems = [...hits, ...cmds];

  function activateItem(item) {
    if (!item) return;
    if (item.kind === "search") {
      onSelectSearchHit?.(item.hit);
    } else {
      onRun(item.cmd);
    }
    onClose();
  }

  const showEmpty = listItems.length === 0 && !searchLoading;
  const visibleItems = listItems.slice(0, 12);

  return (
    <div className="dakinis-cmdk">
      <div className="dakinis-cmdk__search-row">
        <span className="dakinis-cmdk__kbd" aria-hidden="true">
          ⌘K
        </span>
        <input
          ref={inputRef}
          className="dakinis-cmdk__input"
          placeholder={t("cmdk.placeholder")}
          aria-label={t("cmdk.placeholder")}
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
      <div className="dakinis-cmdk__list" role="listbox" aria-label={t("cmdk.title")}>
        {searchLoading ? (
          <div className="dakinis-cmdk__empty dakinis-cmdk__loading">{t("cmdk.searchLoading")}</div>
        ) : showEmpty ? (
          <div className="dakinis-cmdk__empty">{t("cmdk.noResults")}</div>
        ) : (
          visibleItems.map((item, index) => (
            <button
              key={item.key}
              type="button"
              className={`dakinis-cmdk__item${item.kind === "search" ? " dakinis-cmdk__item--search" : ""}`}
              role="option"
              aria-selected={index === 0}
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
          ))
        )}
      </div>
      <footer className="dakinis-cmdk__footer">
        <span>{t("cmdk.hintNavigate")}</span>
        <span>{t("cmdk.hintAi")}</span>
      </footer>
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
