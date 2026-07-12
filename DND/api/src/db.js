import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { dndHashPassword } from "./password.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveDbPath() {
  if (process.env.TABLETOP_DB_PATH) return process.env.TABLETOP_DB_PATH;
  if (process.env.DND_DB_PATH) return process.env.DND_DB_PATH;
  const dataDir = join(__dirname, "..", "data");
  const legacy = join(dataDir, "dnd.db");
  const preferred = join(dataDir, "tabletop.db");
  return existsSync(legacy) ? legacy : preferred;
}

const DB_PATH = resolveDbPath();

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
if (process.env.TABLETOP_DB_PATH || process.env.DND_DB_PATH) {
  db.pragma("synchronous = FULL");
}

export function dndPersistDb() {
  try {
    db.pragma("wal_checkpoint(TRUNCATE)");
  } catch {
    /* ignore */
  }
}

export function dndGetDbStats() {
  const userCount = db.prepare(`SELECT COUNT(*) AS n FROM users`).get()?.n ?? 0;
  return {
    configuredPath: Boolean(process.env.TABLETOP_DB_PATH || process.env.DND_DB_PATH),
    path: DB_PATH,
    userCount,
  };
}

function dndInitSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      data_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      invite_code TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS campaign_members (
      campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (campaign_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS campaign_notes (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      played_at TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS campaign_items (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'otro',
      quantity INTEGER NOT NULL DEFAULT 1,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS registration_tokens (
      email_norm TEXT NOT NULL,
      token_hash TEXT NOT NULL PRIMARY KEY,
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_registration_tokens_email ON registration_tokens(email_norm);

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      email_norm TEXT NOT NULL,
      token_hash TEXT NOT NULL PRIMARY KEY,
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email_norm);
  `);
}

dndInitSchema();

export function dndNewId() {
  return randomUUID();
}

export function dndGenerateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[randomBytes(1)[0] % chars.length];
  }
  const exists = db.prepare(`SELECT 1 FROM campaigns WHERE invite_code = ?`).get(code);
  return exists ? dndGenerateInviteCode() : code;
}

export function dndRowUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}

export function dndFindUserByEmail(email) {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email.toLowerCase());
}

export function dndFindUserById(id) {
  const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
  return dndRowUser(row);
}

export function dndCreateUser(email, password, displayName) {
  const id = dndNewId();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)`,
  ).run(id, email.toLowerCase(), dndHashPassword(password), displayName || "");
  return id;
}

export function dndUpdateUserPassword(emailNorm, password) {
  const result = db
    .prepare(
      `UPDATE users SET password_hash = ? WHERE email = ?`,
    )
    .run(dndHashPassword(password), emailNorm.toLowerCase());
  return result.changes > 0;
}

export function dndDeleteRegistrationTokensForEmail(emailNorm) {
  db.prepare(`DELETE FROM registration_tokens WHERE email_norm = ?`).run(emailNorm.toLowerCase());
}

export function dndInsertRegistrationToken(emailNorm, tokenHash, expiresAt) {
  db.prepare(
    `INSERT INTO registration_tokens (email_norm, token_hash, expires_at) VALUES (?, ?, ?)`,
  ).run(emailNorm.toLowerCase(), tokenHash, expiresAt);
}

export function dndDeleteRegistrationToken(tokenHash) {
  db.prepare(`DELETE FROM registration_tokens WHERE token_hash = ?`).run(tokenHash);
}

export function dndFindRegistrationToken(tokenHash) {
  return db
    .prepare(`SELECT email_norm, expires_at FROM registration_tokens WHERE token_hash = ?`)
    .get(tokenHash);
}

export function dndConsumeRegistrationToken(tokenHash) {
  const row = db
    .prepare(
      `SELECT email_norm FROM registration_tokens
       WHERE token_hash = ? AND expires_at > datetime('now')`,
    )
    .get(tokenHash);
  if (!row) return null;
  db.prepare(`DELETE FROM registration_tokens WHERE token_hash = ?`).run(tokenHash);
  return row;
}

export function dndDeletePasswordResetTokensForEmail(emailNorm) {
  db.prepare(`DELETE FROM password_reset_tokens WHERE email_norm = ?`).run(emailNorm.toLowerCase());
}

export function dndInsertPasswordResetToken(emailNorm, tokenHash, expiresAt) {
  db.prepare(
    `INSERT INTO password_reset_tokens (email_norm, token_hash, expires_at) VALUES (?, ?, ?)`,
  ).run(emailNorm.toLowerCase(), tokenHash, expiresAt);
}

export function dndDeletePasswordResetToken(tokenHash) {
  db.prepare(`DELETE FROM password_reset_tokens WHERE token_hash = ?`).run(tokenHash);
}

export function dndFindPasswordResetToken(tokenHash) {
  return db
    .prepare(`SELECT email_norm, expires_at FROM password_reset_tokens WHERE token_hash = ?`)
    .get(tokenHash);
}

export function dndConsumePasswordResetToken(tokenHash) {
  const row = db
    .prepare(
      `SELECT email_norm FROM password_reset_tokens
       WHERE token_hash = ? AND expires_at > datetime('now')`,
    )
    .get(tokenHash);
  if (!row) return null;
  db.prepare(`DELETE FROM password_reset_tokens WHERE token_hash = ?`).run(tokenHash);
  return row;
}

export function dndListCharacters(userId) {
  return db
    .prepare(`SELECT * FROM characters WHERE user_id = ? ORDER BY updated_at DESC`)
    .all(userId)
    .map((row) => ({
      ...JSON.parse(row.data_json),
      id: row.id,
    }));
}

export function dndUpsertCharacter(userId, character) {
  const id = character.id || dndNewId();
  const data = { ...character, id };
  const existing = db.prepare(`SELECT user_id FROM characters WHERE id = ?`).get(id);
  if (existing && existing.user_id !== userId) {
    const err = new Error("Personaje de otro usuario");
    err.code = "FORBIDDEN";
    throw err;
  }
  if (existing) {
    db.prepare(
      `UPDATE characters SET data_json = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
    ).run(JSON.stringify(data), id, userId);
  } else {
    db.prepare(`INSERT INTO characters (id, user_id, data_json) VALUES (?, ?, ?)`).run(
      id,
      userId,
      JSON.stringify(data),
    );
  }
  return data;
}

export function dndDeleteCharacter(userId, characterId) {
  const r = db
    .prepare(`DELETE FROM characters WHERE id = ? AND user_id = ?`)
    .run(characterId, userId);
  return r.changes > 0;
}

export function dndSyncCharacters(userId, characters) {
  const existing = new Set(
    db.prepare(`SELECT id FROM characters WHERE user_id = ?`).all(userId).map((r) => r.id),
  );
  const incomingIds = new Set();
  const saved = [];
  for (const char of characters) {
    const data = dndUpsertCharacter(userId, char);
    incomingIds.add(data.id);
    saved.push(data);
  }
  for (const id of existing) {
    if (!incomingIds.has(id)) {
      db.prepare(`DELETE FROM characters WHERE id = ? AND user_id = ?`).run(id, userId);
    }
  }
  dndPersistDb();
  return saved;
}

export function dndIsCampaignMember(campaignId, userId) {
  return Boolean(
    db
      .prepare(`SELECT 1 FROM campaign_members WHERE campaign_id = ? AND user_id = ?`)
      .get(campaignId, userId),
  );
}

export function dndListCampaigns(userId) {
  return db
    .prepare(
      `SELECT c.*, cm.role,
        (SELECT COUNT(*) FROM campaign_members m WHERE m.campaign_id = c.id) AS member_count
       FROM campaigns c
       JOIN campaign_members cm ON cm.campaign_id = c.id
       WHERE cm.user_id = ?
       ORDER BY c.created_at DESC`,
    )
    .all(userId)
    .map((row) => ({
      id: row.id,
      name: row.name,
      inviteCode: row.invite_code,
      role: row.role,
      memberCount: row.member_count,
      createdAt: row.created_at,
    }));
}

export function dndCreateCampaign(userId, name) {
  const id = dndNewId();
  const inviteCode = dndGenerateInviteCode();
  db.prepare(`INSERT INTO campaigns (id, name, owner_id, invite_code) VALUES (?, ?, ?, ?)`).run(
    id,
    name,
    userId,
    inviteCode,
  );
  db.prepare(
    `INSERT INTO campaign_members (campaign_id, user_id, role) VALUES (?, ?, 'owner')`,
  ).run(id, userId);
  dndPersistDb();
  return dndGetCampaign(userId, id);
}

export function dndUpdateCampaignName(userId, campaignId, name) {
  const row = db.prepare(`SELECT owner_id FROM campaigns WHERE id = ?`).get(campaignId);
  if (!row || row.owner_id !== userId) return null;
  const trimmed = String(name ?? "").trim();
  if (trimmed.length < 2) return null;
  db.prepare(`UPDATE campaigns SET name = ? WHERE id = ?`).run(trimmed, campaignId);
  dndPersistDb();
  return dndGetCampaign(userId, campaignId);
}

export function dndGetCampaign(userId, campaignId) {
  if (!dndIsCampaignMember(campaignId, userId)) return null;
  const row = db
    .prepare(
      `SELECT c.*, cm.role,
        (SELECT COUNT(*) FROM campaign_members m WHERE m.campaign_id = c.id) AS member_count
       FROM campaigns c
       JOIN campaign_members cm ON cm.campaign_id = c.id AND cm.user_id = ?
       WHERE c.id = ?`,
    )
    .get(userId, campaignId);
  if (!row) return null;
  const members = db
    .prepare(
      `SELECT u.id, u.display_name, u.email, cm.role, cm.joined_at
       FROM campaign_members cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.campaign_id = ?
       ORDER BY cm.joined_at`,
    )
    .all(campaignId)
    .map((m) => ({
      id: m.id,
      displayName: m.display_name || m.email.split("@")[0],
      role: m.role,
      joinedAt: m.joined_at,
    }));
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    role: row.role,
    memberCount: row.member_count,
    createdAt: row.created_at,
    members,
  };
}

export function dndJoinCampaign(userId, inviteCode) {
  const campaign = db
    .prepare(`SELECT * FROM campaigns WHERE invite_code = ?`)
    .get(String(inviteCode).trim().toUpperCase());
  if (!campaign) return null;
  if (dndIsCampaignMember(campaign.id, userId)) {
    return dndGetCampaign(userId, campaign.id);
  }
  db.prepare(
    `INSERT INTO campaign_members (campaign_id, user_id, role) VALUES (?, ?, 'member')`,
  ).run(campaign.id, userId);
  dndPersistDb();
  return dndGetCampaign(userId, campaign.id);
}

export function dndListCampaignNotes(campaignId) {
  return db
    .prepare(
      `SELECT n.*, u.display_name, u.email
       FROM campaign_notes n
       JOIN users u ON u.id = n.author_id
       WHERE n.campaign_id = ?
       ORDER BY n.played_at DESC, n.created_at DESC`,
    )
    .all(campaignId)
    .map((row) => ({
      id: row.id,
      campaignId: row.campaign_id,
      authorId: row.author_id,
      authorName: row.display_name || row.email.split("@")[0],
      playedAt: row.played_at,
      title: row.title || undefined,
      content: row.content,
      createdAt: row.created_at,
    }));
}

export function dndAddCampaignNote(campaignId, authorId, note) {
  const id = dndNewId();
  db.prepare(
    `INSERT INTO campaign_notes (id, campaign_id, author_id, played_at, title, content)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, campaignId, authorId, note.playedAt, note.title || null, note.content);
  dndPersistDb();
  return dndListCampaignNotes(campaignId).find((n) => n.id === id);
}

export function dndDeleteCampaignNote(campaignId, noteId, userId) {
  const note = db.prepare(`SELECT * FROM campaign_notes WHERE id = ? AND campaign_id = ?`).get(noteId, campaignId);
  if (!note) return false;
  const member = db
    .prepare(`SELECT role FROM campaign_members WHERE campaign_id = ? AND user_id = ?`)
    .get(campaignId, userId);
  if (!member) return false;
  if (note.author_id !== userId && member.role !== "owner") return false;
  db.prepare(`DELETE FROM campaign_notes WHERE id = ?`).run(noteId);
  dndPersistDb();
  return true;
}

export function dndListCampaignItems(campaignId) {
  return db
    .prepare(
      `SELECT i.*, u.display_name, u.email
       FROM campaign_items i
       JOIN users u ON u.id = i.author_id
       WHERE i.campaign_id = ?
       ORDER BY i.created_at DESC`,
    )
    .all(campaignId)
    .map((row) => ({
      id: row.id,
      campaignId: row.campaign_id,
      authorId: row.author_id,
      authorName: row.display_name || row.email.split("@")[0],
      name: row.name,
      category: row.category,
      quantity: row.quantity,
      description: row.description || undefined,
      createdAt: row.created_at,
    }));
}

export function dndAddCampaignItem(campaignId, authorId, item) {
  const id = dndNewId();
  db.prepare(
    `INSERT INTO campaign_items (id, campaign_id, author_id, name, category, quantity, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    campaignId,
    authorId,
    item.name,
    item.category || "otro",
    item.quantity ?? 1,
    item.description || null,
  );
  dndPersistDb();
  return dndListCampaignItems(campaignId).find((i) => i.id === id);
}

export function dndDeleteCampaignItem(campaignId, itemId, userId) {
  const item = db.prepare(`SELECT * FROM campaign_items WHERE id = ? AND campaign_id = ?`).get(itemId, campaignId);
  if (!item) return false;
  const member = db
    .prepare(`SELECT role FROM campaign_members WHERE campaign_id = ? AND user_id = ?`)
    .get(campaignId, userId);
  if (!member) return false;
  if (item.author_id !== userId && member.role !== "owner") return false;
  db.prepare(`DELETE FROM campaign_items WHERE id = ?`).run(itemId);
  dndPersistDb();
  return true;
}

export { db };
