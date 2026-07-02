import { Router } from "express";
import { dndRequireAuth, dndSignToken } from "../auth.js";
import { dndVerifyPassword } from "../password.js";
import {
  dndCreateUser,
  dndFindUserByEmail,
  dndFindUserById,
} from "../db.js";

const router = Router();

router.post("/register", (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  const displayName = String(req.body?.displayName ?? req.body?.name ?? "").trim();
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "Email y contraseña (mín. 6) requeridos" });
  }
  if (dndFindUserByEmail(email)) {
    return res.status(409).json({ error: "Email ya registrado" });
  }
  const id = dndCreateUser(email, password, displayName);
  const user = dndFindUserById(id);
  const token = dndSignToken(user);
  res.status(201).json({ user, token });
});

router.post("/login", (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña requeridos" });
  }
  const row = dndFindUserByEmail(email);
  if (!row || !dndVerifyPassword(password, row.password_hash)) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }
  const user = dndFindUserById(row.id);
  const token = dndSignToken(user);
  res.json({ user, token });
});

router.get("/me", dndRequireAuth, (req, res) => {
  const token = dndSignToken(req.dndUser);
  res.json({ user: req.dndUser, token });
});

export default router;
