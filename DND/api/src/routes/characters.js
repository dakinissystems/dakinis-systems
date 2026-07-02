import { Router } from "express";
import { dndRequireAuth } from "../auth.js";
import {
  dndDeleteCharacter,
  dndListCharacters,
  dndSyncCharacters,
  dndUpsertCharacter,
} from "../db.js";

const router = Router();
router.use(dndRequireAuth);

router.get("/", (req, res) => {
  res.json({ characters: dndListCharacters(req.dndUser.id) });
});

router.put("/sync", (req, res) => {
  const characters = Array.isArray(req.body?.characters) ? req.body.characters : [];
  const saved = dndSyncCharacters(req.dndUser.id, characters);
  res.json({ characters: saved });
});

router.post("/", (req, res) => {
  const char = req.body?.character;
  if (!char || typeof char !== "object") {
    return res.status(400).json({ error: "Personaje requerido" });
  }
  const saved = dndUpsertCharacter(req.dndUser.id, char);
  res.status(201).json({ character: saved });
});

router.delete("/:id", (req, res) => {
  const ok = dndDeleteCharacter(req.dndUser.id, req.params.id);
  if (!ok) return res.status(404).json({ error: "Personaje no encontrado" });
  res.json({ ok: true });
});

export default router;
