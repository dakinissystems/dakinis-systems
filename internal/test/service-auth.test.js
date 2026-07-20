import assert from "node:assert/strict";
import test from "node:test";
import {
  collectServiceKeys,
  isProductionRuntime,
  verifyServiceBearer,
} from "../src/lib/service-auth-keys.js";

test("collectServiceKeys supports CSV and previous", () => {
  assert.deepEqual(collectServiceKeys("a,b", "c"), ["a", "b", "c"]);
  assert.deepEqual(collectServiceKeys("a", "a"), ["a"]);
});

test("verifyServiceBearer fail-open only outside production", () => {
  const prev = process.env.NODE_ENV;
  const railway = process.env.RAILWAY_ENVIRONMENT;
  delete process.env.RAILWAY_ENVIRONMENT;
  process.env.NODE_ENV = "development";
  const open = verifyServiceBearer({ headers: {} }, { primary: "" });
  assert.equal(open.ok, true);
  assert.equal(open.dev, true);

  process.env.NODE_ENV = "production";
  const closed = verifyServiceBearer({ headers: {} }, { primary: "" });
  assert.equal(closed.ok, false);
  assert.equal(closed.status, 503);

  process.env.NODE_ENV = prev;
  if (railway === undefined) delete process.env.RAILWAY_ENVIRONMENT;
  else process.env.RAILWAY_ENVIRONMENT = railway;
});

test("verifyServiceBearer accepts previous key during rotation", () => {
  const req = { headers: { authorization: "Bearer old-key" } };
  const result = verifyServiceBearer(req, {
    primary: "new-key",
    previous: "old-key",
  });
  assert.equal(result.ok, true);
  assert.equal(result.rotated, true);
});

test("isProductionRuntime detects railway", () => {
  const prev = process.env.RAILWAY_ENVIRONMENT;
  process.env.RAILWAY_ENVIRONMENT = "production";
  assert.equal(isProductionRuntime(), true);
  if (prev === undefined) delete process.env.RAILWAY_ENVIRONMENT;
  else process.env.RAILWAY_ENVIRONMENT = prev;
});
