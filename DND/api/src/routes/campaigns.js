import { Router } from "express";
import { dndRequireAuth } from "../auth.js";
import {
  dndAddCampaignItem,
  dndAddCampaignNote,
  dndCreateCampaign,
  dndDeleteCampaignItem,
  dndDeleteCampaignNote,
  dndGetCampaign,
  dndIsCampaignMember,
  dndJoinCampaign,
  dndListCampaignItems,
  dndListCampaignNotes,
  dndListCampaigns,
  dndUpdateCampaignName,
} from "../db.js";

const router = Router();
router.use(dndRequireAuth);

router.get("/", (req, res) => {
  res.json({ campaigns: dndListCampaigns(req.dndUser.id) });
});

router.post("/", (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (name.length < 2) {
    return res.status(400).json({ error: "Nombre de campaña requerido (mín. 2 caracteres)" });
  }
  const campaign = dndCreateCampaign(req.dndUser.id, name);
  res.status(201).json({ campaign });
});

router.post("/join", (req, res) => {
  const inviteCode = String(req.body?.inviteCode ?? "").trim();
  if (!inviteCode) {
    return res.status(400).json({ error: "Código de invitación requerido" });
  }
  const campaign = dndJoinCampaign(req.dndUser.id, inviteCode);
  if (!campaign) {
    return res.status(404).json({ error: "Código de invitación no válido" });
  }
  res.json({ campaign });
});

router.get("/:id", (req, res) => {
  const campaign = dndGetCampaign(req.dndUser.id, req.params.id);
  if (!campaign) return res.status(404).json({ error: "Campaña no encontrada" });
  res.json({ campaign });
});

router.patch("/:id", (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (name.length < 2) {
    return res.status(400).json({ error: "Nombre de campaña requerido (mín. 2 caracteres)" });
  }
  const campaign = dndUpdateCampaignName(req.dndUser.id, req.params.id, name);
  if (!campaign) return res.status(403).json({ error: "Solo el dueño puede renombrar la campaña" });
  res.json({ campaign });
});

router.get("/:id/notes", (req, res) => {
  if (!dndIsCampaignMember(req.params.id, req.dndUser.id)) {
    return res.status(403).json({ error: "No eres miembro de esta campaña" });
  }
  res.json({ notes: dndListCampaignNotes(req.params.id) });
});

router.post("/:id/notes", (req, res) => {
  if (!dndIsCampaignMember(req.params.id, req.dndUser.id)) {
    return res.status(403).json({ error: "No eres miembro de esta campaña" });
  }
  const playedAt = String(req.body?.playedAt ?? "").slice(0, 10);
  const content = String(req.body?.content ?? "").trim();
  if (!playedAt || !content) {
    return res.status(400).json({ error: "Fecha y contenido requeridos" });
  }
  const note = dndAddCampaignNote(req.params.id, req.dndUser.id, {
    playedAt,
    title: req.body?.title ? String(req.body.title).trim() : undefined,
    content,
  });
  res.status(201).json({ note });
});

router.delete("/:id/notes/:noteId", (req, res) => {
  const ok = dndDeleteCampaignNote(req.params.id, req.params.noteId, req.dndUser.id);
  if (!ok) return res.status(403).json({ error: "No puedes eliminar esta nota" });
  res.json({ ok: true });
});

router.get("/:id/items", (req, res) => {
  if (!dndIsCampaignMember(req.params.id, req.dndUser.id)) {
    return res.status(403).json({ error: "No eres miembro de esta campaña" });
  }
  res.json({ items: dndListCampaignItems(req.params.id) });
});

router.post("/:id/items", (req, res) => {
  if (!dndIsCampaignMember(req.params.id, req.dndUser.id)) {
    return res.status(403).json({ error: "No eres miembro de esta campaña" });
  }
  const name = String(req.body?.name ?? "").trim();
  if (!name) return res.status(400).json({ error: "Nombre del objeto requerido" });
  const item = dndAddCampaignItem(req.params.id, req.dndUser.id, {
    name,
    category: String(req.body?.category ?? "otro"),
    quantity: Number(req.body?.quantity) || 1,
    description: req.body?.description ? String(req.body.description) : undefined,
  });
  res.status(201).json({ item });
});

router.delete("/:id/items/:itemId", (req, res) => {
  const ok = dndDeleteCampaignItem(req.params.id, req.params.itemId, req.dndUser.id);
  if (!ok) return res.status(403).json({ error: "No puedes eliminar este objeto" });
  res.json({ ok: true });
});

export default router;
