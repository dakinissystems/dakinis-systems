import test from "node:test";
import assert from "node:assert/strict";
import { eventClaimsIdentity, workerPublishFallback } from "../src/lib/worker-key.js";

const KEY = "worker-key-not-the-service-key";

function withEnv(extra, fn) {
  const names = [
    "NODE_ENV",
    "RAILWAY_ENVIRONMENT",
    "RAILWAY_PROJECT_ID",
    "DAKINIS_WORKER_KEY",
    "DAKINIS_INTERNAL_SERVICE_KEY",
    "DAKINIS_INTERNAL_API_KEY",
    "DAKINIS_INTERNAL_SERVICE_KEY_PREVIOUS",
    "DAKINIS_INTERNAL_API_KEY_PREVIOUS",
  ];
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

test("en local, sin clave de worker, la publicación sigue", () => {
  withEnv({}, () => {
    assert.equal(workerPublishFallback({ headers: {} }).ok, true);
  });
});

test("en producción, sin clave de worker, no se publica", () => {
  withEnv({ NODE_ENV: "production" }, () => {
    const result = workerPublishFallback({ headers: {} });
    assert.equal(result.status, 503);
    assert.equal(result.body.error, "worker_key_not_configured");
  });
});

test("copiar la clave de servicio no convierte a nadie en worker", () => {
  withEnv(
    { NODE_ENV: "production", DAKINIS_WORKER_KEY: "shared", DAKINIS_INTERNAL_SERVICE_KEY: "shared" },
    () => {
      const result = workerPublishFallback({ headers: { "x-dakinis-worker": "shared" } });
      assert.equal(result.status, 503);
    }
  );
});

test("un evento de worker no puede nombrar a una persona", () => {
  assert.equal(eventClaimsIdentity({ event: "telemetry.action", payload: { action: "open" } }), false);
  assert.equal(eventClaimsIdentity({ userId: "abc" }), true);
  assert.equal(eventClaimsIdentity({ payload: { platformUserId: "abc" } }), true);
});

test("la clave de worker publica y otra no", () => {
  withEnv(
    { NODE_ENV: "production", DAKINIS_WORKER_KEY: KEY, DAKINIS_INTERNAL_SERVICE_KEY: "shared-service" },
    () => {
      assert.equal(workerPublishFallback({ headers: { "x-dakinis-worker": KEY } }).ok, true);
      assert.equal(workerPublishFallback({ headers: { "x-dakinis-worker": "shared-service" } }).status, 401);
    }
  );
});
