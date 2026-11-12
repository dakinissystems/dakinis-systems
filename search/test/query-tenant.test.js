import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { tenantForSearch } from "../src/lib/query-tenant.js";

const SECRET = "test-secret-at-least-32-characters-long";

function sign(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function withEnv(extra, fn) {
  const names = ["NODE_ENV", "RAILWAY_ENVIRONMENT", "RAILWAY_PROJECT_ID", "JWT_SECRET", "DAKINIS_JWT_SECRET", "JWT_STRICT_ISS_AUD"];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  for (const name of names) delete process.env[name];
  Object.assign(process.env, extra);
  try {
    return fn();
  } finally {
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
}

test("en local, sin secreto, la query conserva el tenant", () => {
  withEnv({}, () => {
    assert.equal(tenantForSearch({ headers: {} }, "acme").tenant, "acme");
  });
});

test("en producción, sin JWT, la consulta no elige tenant", () => {
  withEnv({ NODE_ENV: "production", JWT_SECRET: SECRET }, () => {
    const result = tenantForSearch({ headers: {} }, "acme");
    assert.equal(result.ok, true);
    assert.equal(result.tenant, null);
  });
});

test("el tenant sale del JWT y otro pedido queda fuera", () => {
  withEnv({ NODE_ENV: "production", JWT_SECRET: SECRET, JWT_STRICT_ISS_AUD: "true" }, () => {
    const token = sign({
      sub: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      tenant: "acme",
      iss: "platform-auth",
      aud: "dakinis-platform",
      exp: Math.floor(Date.now() / 1000) + 60,
    });
    const req = { headers: { "x-dakinis-actor": token } };
    assert.equal(tenantForSearch(req, "acme").tenant, "acme");
    assert.equal(tenantForSearch(req, "other").status, 403);
  });
});
