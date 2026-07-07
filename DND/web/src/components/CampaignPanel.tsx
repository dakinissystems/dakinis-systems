import { useCallback, useEffect, useReducer, useState } from "react";
import { dndApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { CampaignDetail, CampaignItem, CampaignNote, CampaignSummary } from "../types/campaign";
import { useLocale } from "../context/LocaleContext";
import { CampaignDetailView } from "./campaign/CampaignDetailView";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

type CampaignViewState = {
  detail: CampaignDetail | null;
  notes: CampaignNote[];
  items: CampaignItem[];
};

const EMPTY_VIEW: CampaignViewState = { detail: null, notes: [], items: [] };

type ViewAction =
  | { type: "reset" }
  | { type: "set"; detail: CampaignDetail; notes: CampaignNote[]; items: CampaignItem[] };

function viewReducer(state: CampaignViewState, action: ViewAction): CampaignViewState {
  switch (action.type) {
    case "reset":
      return EMPTY_VIEW;
    case "set":
      return { detail: action.detail, notes: action.notes, items: action.items };
    default:
      return state;
  }
}

type Props = {
  onSignIn?: () => void;
};

export function CampaignPanel({ onSignIn }: Props) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, dispatchView] = useReducer(viewReducer, EMPTY_VIEW);
  const { detail, notes, items } = view;
  const [tab, setTab] = useState<"notes" | "items">("notes");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [newCampaignName, setNewCampaignName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [noteDraft, setNoteDraft] = useState({ playedAt: todayIso(), title: "", content: "" });
  const [itemDraft, setItemDraft] = useState({ name: "", category: "otro", quantity: 1, description: "" });

  const fetchCampaignView = useCallback(async (id: string) => {
    const [{ campaign }, { notes: n }, { items: i }] = await Promise.all([
      dndApi.getCampaign(id),
      dndApi.listNotes(id),
      dndApi.listItems(id),
    ]);
    dispatchView({ type: "set", detail: campaign, notes: n, items: i });
  }, []);

  const selectCampaign = useCallback(
    async (id: string | null) => {
      setActiveId(id);
      if (!id) {
        dispatchView({ type: "reset" });
        return;
      }
      await fetchCampaignView(id);
    },
    [fetchCampaignView],
  );

  const reloadCampaigns = useCallback(async () => {
    const { campaigns: list } = await dndApi.listCampaigns();
    setCampaigns(list);
    const pick = activeId && list.some((c) => c.id === activeId) ? activeId : (list[0]?.id ?? null);
    await selectCampaign(pick);
  }, [activeId, selectCampaign]);

  useEffect(() => {
    reloadCampaigns().catch((e) => setError(e.message));
  }, [reloadCampaigns]);

  const createCampaign = async () => {
    if (newCampaignName.trim().length < 2) return;
    setBusy(true);
    setError("");
    try {
      const { campaign } = await dndApi.createCampaign(newCampaignName.trim());
      setNewCampaignName("");
      await reloadCampaigns();
      await selectCampaign(campaign.id);
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
      await selectCampaign(campaign.id);
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
      await fetchCampaignView(activeId);
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
      await fetchCampaignView(activeId);
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
        <p className="panel-hint">{t("campaign.signedOutHint")}</p>
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
          aria-label={t("campaign.newCampaignPlaceholder")}
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
          aria-label={t("campaign.invitePlaceholder")}
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
              onClick={() => void selectCampaign(c.id)}
            >
              {c.name} ({c.memberCount})
            </button>
          ))}
        </div>
      )}

      {detail && (
        <CampaignDetailView
          detail={detail}
          tab={tab}
          notes={notes}
          items={items}
          noteDraft={noteDraft}
          itemDraft={itemDraft}
          busy={busy}
          onTabChange={setTab}
          onNoteDraftChange={setNoteDraft}
          onItemDraftChange={setItemDraft}
          onAddNote={addNote}
          onAddItem={addItem}
          onCopyInvite={copyInvite}
        />
      )}

      {campaigns.length === 0 && <p className="empty-state">{t("campaign.empty")}</p>}
    </section>
  );
}
