/**
 * In-memory Session Manager (MVP scaffold).
 * Production: meta.studio_sessions + Redis state cache.
 */

/** @type {Map<string, object>} */
const sessions = new Map();
/** @type {Map<string, object>} */
const states = new Map();
/** @type {Map<string, { revision: number, files: Map<string, { content: string, revision: number }> }>} */
const fileStores = new Map();

function demoSeed() {
  if (sessions.size) return;
  const id = "00000000-0000-4000-a000-000000000001";
  sessions.set(id, {
    id,
    name: "dakinis-platform",
    workspaceId: "00000000-0000-4000-b000-000000000001",
    runtimeId: "node-22",
    repoUrl: "https://github.com/dakinissystems/dakinis-systems",
    branch: "main",
    revision: 1,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  states.set(id, {
    openFiles: ["src/App.jsx", "package.json"],
    activeFile: "src/App.jsx",
    cursors: [{ path: "src/App.jsx", line: 1, column: 0, languageId: "javascript" }],
    terminals: [{ id: "term-1", title: "bash", cwd: "/workspace" }],
    activeTerminalId: "term-1",
    gitBranch: "main",
    panelLayout: { tab: "editor" },
    revision: 1,
  });
  const fs = new Map();
  fs.set("src/App.jsx", {
    content: "export default function App() { return <h1>Dakinis Studio</h1> }\n",
    revision: 1,
  });
  fs.set("package.json", {
    content: '{\n  "name": "demo",\n  "private": true\n}\n',
    revision: 1,
  });
  fileStores.set(id, { revision: 1, files: fs });
}

demoSeed();

export function listSessions({ limit = 20, offset = 0 } = {}) {
  const items = [...sessions.values()].sort(
    (a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt),
  );
  return { items: items.slice(offset, offset + limit), total: items.length };
}

/** @param {object} input */
export function createSession(input) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const session = {
    id,
    name: input.name,
    workspaceId: input.workspaceId ?? null,
    runtimeId: input.runtimeId,
    repoUrl: input.repoUrl ?? null,
    branch: input.branch ?? "main",
    revision: 1,
    lastActiveAt: now,
    createdAt: now,
  };
  sessions.set(id, session);
  states.set(id, {
    openFiles: [],
    activeFile: null,
    cursors: [],
    terminals: [],
    activeTerminalId: null,
    gitBranch: session.branch,
    panelLayout: {},
    revision: 1,
  });
  fileStores.set(id, { revision: 1, files: new Map() });
  return session;
}

/** @param {string} id */
export function getSession(id) {
  return sessions.get(id) ?? null;
}

/** @param {string} id */
export function deleteSession(id) {
  sessions.delete(id);
  states.delete(id);
  fileStores.delete(id);
}

/** @param {string} id */
export function getSessionState(id) {
  return states.get(id) ?? null;
}

/** @param {string} id @param {object} state */
export function putSessionState(id, state) {
  const session = sessions.get(id);
  if (!session) return null;
  const current = states.get(id);
  if (current && state.revision != null && state.revision < current.revision) {
    const err = new Error("state_revision_conflict");
    err.status = 409;
    throw err;
  }
  const next = { ...state, revision: (current?.revision ?? 0) + 1 };
  states.set(id, next);
  session.lastActiveAt = new Date().toISOString();
  session.revision += 1;
  return next;
}

/** @param {string} id */
export function switchSession(id) {
  const session = sessions.get(id);
  if (!session) return null;
  session.lastActiveAt = new Date().toISOString();
  return session;
}

/** @param {string} sessionId */
export function getFileTree(sessionId) {
  const store = fileStores.get(sessionId);
  if (!store) return null;
  const children = [...store.files.keys()].map((path) => ({
    name: path.split("/").pop(),
    path,
    type: "file",
    languageId: inferLanguageId(path),
  }));
  return {
    root: { name: "workspace", path: "/", type: "folder", children },
    revision: store.revision,
  };
}

/** @param {string} path */
function inferLanguageId(path) {
  const ext = path.includes(".") ? path.split(".").pop()?.toLowerCase() : "";
  const map = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    go: "go",
    rs: "rust",
    java: "java",
    php: "php",
    cs: "csharp",
    rb: "ruby",
    dart: "dart",
    json: "json",
    md: "markdown",
    sql: "sql",
    sh: "shell",
  };
  return map[ext] ?? "plaintext";
}

/** @param {string} sessionId @param {string} path */
export function readFile(sessionId, path) {
  const store = fileStores.get(sessionId);
  if (!store) return null;
  const file = store.files.get(path);
  if (!file) return null;
  return {
    path,
    revision: file.revision,
    languageId: inferLanguageId(path),
    encoding: "utf-8",
    content: file.content,
  };
}

/** @param {string} sessionId @param {{ baseRevision?: number, ops: object[] }} body */
export function applyFileOps(sessionId, body) {
  const store = fileStores.get(sessionId);
  if (!store) return null;

  if (body.baseRevision != null && body.baseRevision !== store.revision) {
    const err = new Error("revision_conflict");
    err.status = 409;
    err.payload = {
      error: "revision_conflict",
      serverRevision: store.revision,
      conflictingPaths: [],
    };
    throw err;
  }

  const touched = new Set();

  for (const op of body.ops) {
    switch (op.op) {
      case "insert": {
        const prev = store.files.get(op.path)?.content ?? "";
        store.files.set(op.path, {
          content: prev.slice(0, op.offset) + op.text + prev.slice(op.offset),
          revision: (store.files.get(op.path)?.revision ?? 0) + 1,
        });
        touched.add(op.path);
        break;
      }
      case "delete": {
        const prev = store.files.get(op.path)?.content ?? "";
        store.files.set(op.path, {
          content: prev.slice(0, op.start) + prev.slice(op.end),
          revision: (store.files.get(op.path)?.revision ?? 0) + 1,
        });
        touched.add(op.path);
        break;
      }
      case "patch": {
        if (typeof op.patch === "string" && op.patch.startsWith("REPLACE:")) {
          store.files.set(op.path, {
            content: op.patch.slice("REPLACE:".length),
            revision: (store.files.get(op.path)?.revision ?? 0) + 1,
          });
        }
        touched.add(op.path);
        break;
      }
      case "rename":
      case "move": {
        const from = store.files.get(op.from);
        if (from) {
          store.files.set(op.to, { ...from, revision: from.revision + 1 });
          store.files.delete(op.from);
          touched.add(op.to);
        }
        break;
      }
      case "blob":
        store.files.set(op.path, {
          content: `[binary:${op.storageRef}]`,
          revision: (store.files.get(op.path)?.revision ?? 0) + 1,
        });
        touched.add(op.path);
        break;
      default:
        break;
    }
  }

  store.revision += 1;
  const session = sessions.get(sessionId);
  if (session) session.revision += 1;

  return {
    revision: store.revision,
    applied: body.ops.length,
    paths: [...touched],
  };
}
