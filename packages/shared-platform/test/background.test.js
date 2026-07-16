import assert from "node:assert/strict";
import test from "node:test";
import {
  background,
  enqueue,
  schedule,
  cancel,
  drainMemory,
  _resetMemoryBackground,
} from "../src/background.js";

test("background.enqueue stores memory job and drains", async () => {
  _resetMemoryBackground();
  const { id, backend } = await enqueue("notify.email", { to: "a@b.com" });
  assert.equal(backend, "memory");
  assert.ok(id);
  const seen = [];
  await drainMemory(async (job) => {
    seen.push(job);
  });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].name, "notify.email");
  assert.deepEqual(seen[0].payload, { to: "a@b.com" });
});

test("background.schedule delays until runAt", async () => {
  _resetMemoryBackground();
  await schedule("later", { n: 1 }, Date.now() + 60_000);
  const seen = [];
  await drainMemory(async (job) => seen.push(job));
  assert.equal(seen.length, 0);
});

test("background.cancel removes pending job", async () => {
  _resetMemoryBackground();
  const { id } = await enqueue("x", {});
  const result = await cancel(id);
  assert.equal(result.cancelled, true);
  const seen = [];
  await drainMemory(async (job) => seen.push(job));
  assert.equal(seen.length, 0);
});

test("background facade exports enqueue", () => {
  assert.equal(typeof background.enqueue, "function");
  assert.equal(typeof background.schedule, "function");
  assert.equal(typeof background.cancel, "function");
});
