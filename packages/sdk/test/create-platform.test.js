import assert from "node:assert/strict";
import test from "node:test";
import { createDakinisPlatform } from "../src/create-platform.js";
import { createEventsModule } from "@dakinis/sdk-events";
import { createMetricsModule } from "@dakinis/sdk-metrics";

test("createDakinisPlatform lazy-loads modules", () => {
  const platform = createDakinisPlatform({ baseUrl: "http://localhost/internal" });
  assert.ok(platform.auth);
  assert.ok(platform.workspace);
  assert.ok(platform.billing);
  assert.ok(platform.events);
  assert.ok(platform.metrics);
  assert.equal(typeof platform.workspace.acceptInvite, "function");
  assert.equal(typeof platform.command.execute, "function");
  assert.equal(typeof platform.query.execute, "function");
  assert.ok(platform.context);
});

test("events module on/once/off/emitLocal", () => {
  const events = createEventsModule({ baseUrl: "http://localhost/internal" });
  let count = 0;
  let onceCount = 0;
  events.on("invite.accepted", () => {
    count += 1;
  });
  events.once("invite.accepted", () => {
    onceCount += 1;
  });
  events.emitLocal({ type: "invite.accepted", payload: {} });
  events.emitLocal({ type: "invite.accepted", payload: {} });
  assert.equal(count, 2);
  assert.equal(onceCount, 1);
});

test("metrics module records snapshot", () => {
  const metrics = createMetricsModule();
  metrics.record({ ok: true, latencyMs: 10, cached: false });
  metrics.record({ ok: false, latencyMs: 50, cached: true });
  const snap = metrics.snapshot();
  assert.equal(snap.calls, 2);
  assert.equal(snap.errors, 1);
  assert.equal(snap.cacheHits, 1);
  assert.equal(snap.cacheMisses, 1);
  assert.ok(snap.latencyMs.avg > 0);
});
