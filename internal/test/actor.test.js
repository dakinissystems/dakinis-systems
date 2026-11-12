import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { requireActor } from "../src/lib/actor.js";

const SECRET = "test-secret-at-least-32-characters-long";
const USER = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

function sign(payload, secret = SECRET) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function req(token) {
  return { headers: token ? { "x-dakinis-actor": token } : {} };
}

test("un actor con el mismo sub pasa", () => {
  process.env.JWT_SECRET = SECRET;
  process.env.NODE_ENV = "production";
  process.env.JWT_STRICT_ISS_AUD = "true";
  const token = sign({
    sub: USER,
    iss: "platform-auth",
    aud: "dakinis-platform",
    exp: Math.floor(Date.now() / 1000) + 60,
  });
  assert.equal(requireActor(req(token), USER).ok, true);
});

test("otro sub queda fuera", () => {
  process.env.JWT_SECRET = SECRET;
  process.env.NODE_ENV = "production";
  process.env.JWT_STRICT_ISS_AUD = "true";
  const token = sign({
    sub: "bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    iss: "platform-auth",
    aud: "dakinis-platform",
    exp: Math.floor(Date.now() / 1000) + 60,
  });
  const result = requireActor(req(token), USER);
  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
});

test("sin cabecera no entra en producción", () => {
  process.env.JWT_SECRET = SECRET;
  process.env.NODE_ENV = "production";
  const result = requireActor(req(""), USER);
  assert.equal(result.status, 401);
});

test("sin caducidad no entra", () => {
  process.env.JWT_SECRET = SECRET;
  process.env.NODE_ENV = "production";
  process.env.JWT_STRICT_ISS_AUD = "false";
  const token = sign({ sub: USER, iss: "platform-auth", aud: "dakinis-platform" });
  assert.equal(requireActor(req(token), USER).status, 401);
});

test("el mismo usuario en mayúsculas pasa", () => {
  process.env.JWT_SECRET = SECRET;
  process.env.NODE_ENV = "production";
  process.env.JWT_STRICT_ISS_AUD = "true";
  const token = sign({
    sub: USER.toUpperCase(),
    iss: "platform-auth",
    aud: "dakinis-platform",
    exp: Math.floor(Date.now() / 1000) + 60,
  });
  assert.equal(requireActor(req(token), USER).ok, true);
});

test("una firma ajena no entra", () => {
  process.env.JWT_SECRET = SECRET;
  process.env.NODE_ENV = "production";
  process.env.JWT_STRICT_ISS_AUD = "false";
  const token = sign({ sub: USER, exp: Math.floor(Date.now() / 1000) + 60 }, "other-secret-at-least-32-characters");
  assert.equal(requireActor(req(token), USER).status, 401);
});
