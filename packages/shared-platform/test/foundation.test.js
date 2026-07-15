import assert from "node:assert/strict";
import test from "node:test";
import { CommandBus, createCommand } from "../src/command-bus.js";
import { CacheService } from "../src/cache-service.js";

test("CommandBus executes registered handler", async () => {
  const bus = new CommandBus();
  bus.register("ping", async (cmd) => ({ pong: cmd.payload?.n ?? 0 }));
  const result = await bus.execute(createCommand("ping", { n: 42 }));
  assert.equal(result.pong, 42);
});

test("CacheService memo returns cached flag", async () => {
  let loads = 0;
  const cache = new CacheService({
    get: async () => null,
    set: async () => {},
    del: async () => {},
  });
  const loader = async () => {
    loads += 1;
    return { ok: true };
  };
  const first = await cache.memo("k1", 60, loader);
  const second = await cache.memo("k1", 60, loader);
  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
  assert.equal(loads, 1);
});

test("CacheService invalidateTag clears tagged keys", async () => {
  const store = new Map();
  const cache = new CacheService({
    get: async (key) => store.get(key) ?? null,
    set: async (key, value) => {
      store.set(key, value);
    },
    del: async (keys) => {
      for (const key of keys) store.delete(key);
    },
  });
  await cache.set("a", "1", 60, { tags: ["user:1"] });
  await cache.set("b", "2", 60, { tags: ["user:2"] });
  await cache.invalidateTag("user:1");
  assert.equal(await cache.get("a"), null);
  assert.equal(await cache.get("b"), "2");
});
