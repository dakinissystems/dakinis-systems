import { useCallback, useEffect, useState } from "react";
import { dndApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { CampaignDetail, CampaignItem, CampaignNote, CampaignSummary } from "../types/campaign";
import { useLocale } from "../context/LocaleContext";
import { formatTabletopDate, itemCategoryLabel } from "../lib/locale-utils";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  onSignIn?: () => void;
};

export function CampaignPanel({ onSignIn }: Props) {
  const { locale, t } = useLocale();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [notes, setNotes] = useState<CampaignNote[]>([]);
  const [items, setItems] = useState<CampaignItem[]>([]);
  const [tab, setTab] = useState<"notes" | "items">("notes");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [newCampaignName, setNewCampaignName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [noteDraft, setNoteDraft] = useState({ playedAt: todayIso(), title: "", content: "" });
  const [itemDraft, setItemDraft] = useState({ name: "", category: "otro", quantity: 1, description: "" });

  const reloadCampaigns = useCallback(async () => {
    const { campaigns: list } = await dndApi.listCampaigns();
    setCampaigns(list);
    if (!activeId && list[0]) setActiveId(list[0].id);
  }, [activeId]);

  const loadCampaign = useCallback(async (id: string) => {
    const [{ campaign }, { notes: n }, { items: i }] = await Promise.all([
      dndApi.getCampaign(id),
      dndApi.listNotes(id),
      dndApi.listItems(id),
    ]);
    setDetail(campaign);
    setNotes(n);
    setItems(i);
  }, []);

  useEffect(() => {
    reloadCampaigns().catch((e) => setError(e.message));
  }, [reloadCampaigns]);

  useEffect(() => {
    if (!activeId) {
      setDetail(null);
      setNotes([]);
      setItems([]);
      return;
    }
    loadCampaign(activeId).catch((e) => setError(e.message));
  }, [activeId, loadCampaign]);

  const createCampaign = async () => {
    if (newCampaignName.trim().length < 2) return;
    setBusy(true);
    setError("");
    try {
      const { campaign } = await dndApi.createCampaign(newCampaignName.trim());
      setNewCampaignName("");
      await reloadCampaigns();
      setActiveId(campaign.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const joinCampaign = async () => {
    if (!inviteCode.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { campaign } = await dndApi.joinCampaign(inviteCode.trim());
      setInviteCode("");
      await reloadCampaigns();
      setActiveId(campaign.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const addNote = async () => {
    if (!activeId || !noteDraft.content.trim()) return;
    setBusy(true);
    try {
      await dndApi.addNote(activeId, {
        playedAt: noteDraft.playedAt,
        title: noteDraft.title.trim() || undefined,
        content: noteDraft.content.trim(),
      });
      setNoteDraft({ playedAt: todayIso(), title: "", content: "" });
      await loadCampaign(activeId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const addItem = async () => {
    if (!activeId || !itemDraft.name.trim()) return;
    setBusy(true);
    try {
      await dndApi.addItem(activeId, itemDraft);
      setItemDraft({ name: "", category: "otro", quantity: 1, description: "" });
      await loadCampaign(activeId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const copyInvite = async () => {
    if (!detail?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(detail.inviteCode);
    } catch {
      /* ignore */
    }
  };

  if (!user) {
    return (
      <section className="panel campaign-panel">
        <h2>{t("campaign.title")}</h2>
        <p className="panel-hint">
          {t("campaign.signedOutHint")}
        </p>
        {onSignIn && (
          <button type="button" className="btn btn-block" onClick={onSignIn}>
            {t("campaign.signInRegister")}
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="panel campaign-panel">
      <h2>{t("campaign.title")}</h2>
      <p className="panel-hint">
        {t("campaign.signedInHint", { name: user?.displayName || user?.email || "-" })}
      </p>

      {error && <p className="form-error">{error}</p>}

      <div className="campaign-create">
        <input
          placeholder={t("campaign.newCampaignPlaceholder")}
          value={newCampaignName}
          onChange={(e) => setNewCampaignName(e.target.value)}
        />
        <button type="button" className="btn btn-secondary" onClick={createCampaign} disabled={busy}>
          {t("campaign.create")}
        </button>
      </div>

      <div className="campaign-join">
        <input
          placeholder={t("campaign.invitePlaceholder")}
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          maxLength={8}
        />
        <button type="button" className="btn" onClick={joinCampaign} disabled={busy}>
          {t("campaign.join")}
        </button>
      </div>

      {campaigns.length > 0 && (
        <div className="chip-row campaign-picker">
          {campaigns.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip-btn ${activeId === c.id ? "chip-btn--on" : ""}`}
              onClick={() => setActiveId(c.id)}
            >
              {c.name} ({c.memberCount})
            </button>
          ))}
        </div>
      )}

      {detail && (
        <>
          <div className="campaign-invite-bar">
            <div>
              <strong>{t("campaign.inviteForFriends")}</strong>{" "}
              <span className="campaign-code">{detail.inviteCode}</span>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copyInvite}>
              {t("campaign.copy")}
            </button>
          </div>
          <p className="muted campaign-members">
            {detail.members.map((m) => m.displayName).join(" · ")}
          </p>

          <div className="segmented">
            <button
              type="button"
              className={`segmented__btn ${tab === "notes" ? "segmented__btn--on" : ""}`}
              onClick={() => setTab("notes")}
            >
              {t("campaign.notesTab")}
            </button>
            <button
              type="button"
              className={`segmented__btn ${tab === "items" ? "segmented__btn--on" : ""}`}
              onClick={() => setTab("items")}
            >
              {t("campaign.itemsTab")}
            </button>
          </div>

          {tab === "notes" && (
            <div className="campaign-tab">
              <div className="campaign-form">
                <label className="form-field">
                  <span>{t("campaign.playedDate")}</span>
                  <input
                    type="date"
                    value={noteDraft.playedAt}
                    onChange={(e) => setNoteDraft((d) => ({ ...d, playedAt: e.target.value }))}
                  />
                </label>
                <label className="form-field">
                  <span>{t("campaign.optionalTitle")}</span>
                  <input
                    value={noteDraft.title}
                    onChange={(e) => setNoteDraft((d) => ({ ...d, title: e.target.value }))}
                  />
                </label>
                <label className="form-field">
                  <span>{t("campaign.whatHappened")}</span>
                  <textarea
                    rows={3}
                    value={noteDraft.content}
                    onChange={(e) => setNoteDraft((d) => ({ ...d, content: e.target.value }))}
                  />
                </label>
                <button type="button" className="btn btn-block" onClick={addNote} disabled={busy}>
                  {t("campaign.addSharedNote")}
                </button>
              </div>
              <ul className="session-notes__list">
                {notes.map((n) => (
                  <li key={n.id} className="session-note-card">
                    <time className="session-note-card__date">{formatTabletopDate(n.playedAt, locale)}</time>
                    {n.title && <strong className="session-note-card__title">{n.title}</strong>}
                    <p className="session-note-card__body">{n.content}</p>
                    <span className="muted">— {n.authorName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "items" && (
            <div className="campaign-tab">
              <div className="campaign-form">
                <label className="form-field">
                  <span>{t("campaign.itemName")}</span>
                  <input
                    value={itemDraft.name}
                    onChange={(e) => setItemDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder={t("campaign.itemPlaceholder")}
                  />
                </label>
                <div className="form-row form-row--2">
                  <label className="form-field">
                    <span>{t("campaign.quantity")}</span>
                    <input
                      type="number"
                      min={1}
                      value={itemDraft.quantity}
                      onChange={(e) => setItemDraft((d) => ({ ...d, quantity: +e.target.value || 1 }))}
                    />
                  </label>
                  <label className="form-field">
                    <span>{t("campaign.category")}</span>
                    <select
                      value={itemDraft.category}
                      onChange={(e) => setItemDraft((d) => ({ ...d, category: e.target.value }))}
                    >
                      <option value="otro">{itemCategoryLabel("otro", t)}</option>
                      <option value="arma">{itemCategoryLabel("arma", t)}</option>
                      <option value="armadura">{itemCategoryLabel("armadura", t)}</option>
                      <option value="curacion">{itemCategoryLabel("curacion", t)}</option>
                      <option value="magia">{itemCategoryLabel("magia", t)}</option>
                      <option value="supervivencia">{itemCategoryLabel("supervivencia", t)}</option>
                    </select>
                  </label>
                </div>
                <label className="form-field">
                  <span>{t("campaign.description")}</span>
                  <input
                    value={itemDraft.description}
                    onChange={(e) => setItemDraft((d) => ({ ...d, description: e.target.value }))}
                  />
                </label>
                <button type="button" className="btn btn-block" onClick={addItem} disabled={busy}>
                  {t("campaign.addToLoot")}
                </button>
              </div>
              <ul className="campaign-items-list">
                {items.map((item) => (
                  <li key={item.id} className="campaign-item-card">
                    <strong>
                      {item.name}
                      {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                    </strong>
                    <span className="muted">{itemCategoryLabel(item.category, t)}</span>
                    {item.description && <p>{item.description}</p>}
                    <span className="muted">{t("campaign.addedBy", { name: item.authorName })}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {campaigns.length === 0 && (
        <p className="empty-state">{t("campaign.empty")}</p>
      )}
    </section>
  );
}
