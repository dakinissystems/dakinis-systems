import test from "node:test";
import assert from "node:assert/strict";
import { akoenetMemberFallback } from "../src/lib/akoenet-member-key.js";

const KEY = "akoenet-member-key-not-the-service-key";

function withEnv(extra, fn) {
  const names = [
    "NODE_ENV",
    "RAILWAY_ENVIRONMENT",
    "RAILWAY_PROJECT_ID",
    "AKOENET_MEMBER_KEY",
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

test("en local, sin clave de miembro, el respaldo sigue", () => {
  withEnv({}, () => {
    assert.equal(akoenetMemberFallback({ headers: {} }).ok, true);
  });
});

test("en producción, sin clave de miembro, no se nombra a nadie", () => {
  withEnv({ NODE_ENV: "production" }, () => {
    const result = akoenetMemberFallback({ headers: {} });
    assert.equal(result.status, 503);
    assert.equal(result.body.error, "akoenet_member_key_not_configured");
  });
});

test("copiar la clave de servicio no separa las identidades", () => {
  withEnv(
    { NODE_ENV: "production", AKOENET_MEMBER_KEY: "shared", DAKINIS_INTERNAL_SERVICE_KEY: "shared" },
    () => {
      const result = akoenetMemberFallback({ headers: { "x-dakinis-akoenet-member": "shared" } });
      assert.equal(result.status, 503);
    }
  );
});

test("la clave de AkoeNet permite el respaldo y otra no", () => {
  withEnv(
    { NODE_ENV: "production", AKOENET_MEMBER_KEY: KEY, DAKINIS_INTERNAL_SERVICE_KEY: "shared-service" },
    () => {
      assert.equal(
        akoenetMemberFallback({ headers: { "x-dakinis-akoenet-member": KEY } }).ok,
        true
      );
      assert.equal(
        akoenetMemberFallback({ headers: { "x-dakinis-akoenet-member": "shared-service" } }).status,
        401
      );
    }
  );
});
