import { useCallback, useEffect, useMemo, useState } from "react";
import {
  dakinisWorkspaceAddonField,
  dakinisWorkspaceAddonsByCategory,
} from "../../shared-brand/src/workspace-addons.js";
import { dakinisHubT } from "../../shared-ux/src/hub-i18n.js";

/**
 * Admin UI — toggles workspace addons (Internal API via BFF in dakinis-hub).
 * @param {{
 *   locale?: "es"|"en";
 *   workspaceId?: string | null;
 *   initialItems?: object[];
 *   fetchAddons?: (workspaceId: string) => Promise<{ items: object[] }>;
 *   saveAddon?: (workspaceId: string, key: string, body: object) => Promise<void>;
 *   enableAll?: (workspaceId: string) => Promise<void>;
 * }} props
 */
export default function HubWorkspaceAdminPage({
  locale = "es",
  workspaceId = null,
  initialItems = [],
  fetchAddons = null,
  saveAddon = null,
  enableAll = null,
}) {
  const t = useCallback((key) => dakinisHubT(key, locale), [locale]);
  const [items, setItems] = useState(initialItems);
  const [busyKey, setBusyKey] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!workspaceId || !fetchAddons) return;
    let cancelled = false;
    fetchAddons(workspaceId)
      .then((data) => {
        if (!cancelled && Array.isArray(data?.items)) setItems(data.items);
      })
      .catch(() => {
        if (!cancelled) setMessage(t("hub.workspace.adminError"));
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, fetchAddons, t]);

  const groups = useMemo(() => {
    if (items.length) {
      /** @type {Record<string, object[]>} */
      const byCat = {};
      for (const addon of items) {
        const cat = addon.category || "system";
        if (!byCat[cat]) byCat[cat] = [];
        byCat[cat].push(addon);
      }
      return Object.entries(byCat).map(([category, catItems]) => ({
        category,
        label: t(`hub.workspace.adminCategory.${category}`) || category,
        items: catItems,
      }));
    }
    const staticGroups = dakinisWorkspaceAddonsByCategory(locale);
    return Object.entries(staticGroups).map(([category, catItems]) => ({
      category,
      label: t(`hub.workspace.adminCategory.${category}`) || category,
      items: catItems.map((tile) => ({
        key: tile.id,
        id: tile.id,
        category,
        phase: tile.phase,
        enabled: tile.status === "active",
        pinned: false,
        i18n: {
          name: { [locale]: tile.label },
          description: { [locale]: tile.description },
        },
      })),
    }));
  }, [items, locale, t]);

  async function toggle(addon) {
    const key = addon.key || addon.id;
    if (!workspaceId || !saveAddon) {
      setItems((prev) =>
        prev.map((a) => (a.key === key || a.id === key ? { ...a, enabled: !a.enabled } : a))
      );
      return;
    }
    setBusyKey(key);
    setMessage("");
    try {
      const next = !addon.enabled;
      await saveAddon(workspaceId, key, { enabled: next, pinned: addon.pinned, config: addon.config || {} });
      setItems((prev) =>
        prev.map((a) => (a.key === key || a.id === key ? { ...a, enabled: next } : a))
      );
      setMessage(t("hub.workspace.adminSaved"));
    } catch {
      setMessage(t("hub.workspace.adminError"));
    } finally {
      setBusyKey(null);
    }
  }

  async function onEnableAll() {
    if (!workspaceId || !enableAll) {
      setItems((prev) => prev.map((a) => ({ ...a, enabled: true })));
      setMessage(t("hub.workspace.adminSaved"));
      return;
    }
    setBulkBusy(true);
    setMessage("");
    try {
      await enableAll(workspaceId);
      if (fetchAddons) {
        const data = await fetchAddons(workspaceId);
        if (Array.isArray(data?.items)) setItems(data.items);
      } else {
        setItems((prev) => prev.map((a) => ({ ...a, enabled: true })));
      }
      setMessage(t("hub.workspace.adminSaved"));
    } catch {
      setMessage(t("hub.workspace.adminError"));
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div className="dakinis-hub-admin-addons">
      <style>{`
        .dakinis-hub-admin-addons { display: flex; flex-direction: column; gap: 1.25rem; }
        .dakinis-hub-admin-addons__head { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between; }
        .dakinis-hub-admin-addons__title { margin: 0; font-size: 1.15rem; font-weight: 600; }
        .dakinis-hub-admin-addons__cat { margin: 0 0 0.5rem; font-size: 0.95rem; font-weight: 600; }
        .dakinis-hub-admin-addons__grid { display: grid; gap: 0.65rem; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); }
        .dakinis-hub-admin-addons__row {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem;
          padding: 0.75rem 0.85rem; border-radius: 10px; border: 1px solid var(--dakinis-border, #334155);
          background: var(--dakinis-surface, #1e293b);
        }
        .dakinis-hub-admin-addons__name { font-weight: 600; font-size: 0.92rem; }
        .dakinis-hub-admin-addons__desc { margin: 0.2rem 0 0; font-size: 0.78rem; color: var(--dakinis-muted, #94a3b8); }
        .dakinis-hub-admin-addons__meta { font-size: 0.72rem; color: var(--dakinis-muted, #94a3b8); margin-top: 0.25rem; }
        .dakinis-hub-admin-addons__btn {
          border: 1px solid var(--dakinis-border, #475569); background: transparent; color: inherit;
          border-radius: 8px; padding: 0.35rem 0.65rem; font-size: 0.78rem; cursor: pointer; white-space: nowrap;
        }
        .dakinis-hub-admin-addons__btn.is-on { background: #7c3aed; border-color: #7c3aed; color: #fff; }
        .dakinis-hub-admin-addons__btn:disabled { opacity: 0.6; cursor: wait; }
        .dakinis-hub-admin-addons__msg { font-size: 0.82rem; color: var(--dakinis-muted, #94a3b8); margin: 0; }
      `}</style>
      <div className="dakinis-hub-admin-addons__head">
        <div>
          <h1 className="dakinis-hub-admin-addons__title">{t("hub.workspace.adminTitle")}</h1>
          <p className="dakinis-hub-admin-addons__msg">{t("hub.workspace.adminLead")}</p>
        </div>
        <button
          type="button"
          className="dakinis-hub-admin-addons__btn"
          disabled={bulkBusy}
          onClick={onEnableAll}
        >
          {bulkBusy ? t("hub.workspace.adminSaving") : t("hub.workspace.adminEnableAll")}
        </button>
      </div>
      {message ? <p className="dakinis-hub-admin-addons__msg">{message}</p> : null}
      {groups.map(({ category, label, items: catItems }) => (
        <section key={category}>
          <h2 className="dakinis-hub-admin-addons__cat">{label}</h2>
          <div className="dakinis-hub-admin-addons__grid">
            {catItems.map((addon) => {
              const key = addon.key || addon.id;
              const name = dakinisWorkspaceAddonField(addon, "name", locale);
              const desc = dakinisWorkspaceAddonField(addon, "description", locale);
              return (
                <div key={key} className="dakinis-hub-admin-addons__row">
                  <div>
                    <div className="dakinis-hub-admin-addons__name">{name}</div>
                    <p className="dakinis-hub-admin-addons__desc">{desc}</p>
                    <div className="dakinis-hub-admin-addons__meta">
                      {addon.phase}
                      {addon.pinned ? ` · ${t("hub.workspace.adminPinned")}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`dakinis-hub-admin-addons__btn ${addon.enabled ? "is-on" : ""}`}
                    disabled={busyKey === key}
                    onClick={() => toggle(addon)}
                  >
                    {busyKey === key
                      ? t("hub.workspace.adminSaving")
                      : addon.enabled
                        ? t("hub.workspace.adminOn")
                        : t("hub.workspace.adminOff")}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
