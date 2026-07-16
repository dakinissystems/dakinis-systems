import assert from "node:assert/strict";
import test from "node:test";
import {
  CommandBus,
  createCommand,
  validationMiddleware,
  permissionsMiddleware,
  createPlatformContext,
  registerCachedQuery,
} from "../src/index.js";
import { CacheService } from "../src/cache-service.js";

test("CommandBus executes registered handler", async () => {
  const bus = new CommandBus();
  bus.register("ping", async (cmd) => ({ pong: cmd.payload?.n ?? 0 }));
  const result = await bus.execute(createCommand("ping", { n: 42 }));
  assert.equal(result.pong, 42);
});

test("CommandBus runs middleware chain", async () => {
  const bus = new CommandBus();
  const order = [];
  bus.register(
    "do",
    async () => {
      order.push("handler");
      return { ok: true };
    },
    {
      middleware: [
        async (_cmd, _ctx, next) => {
          order.push("m1");
          return next();
        },
        async (_cmd, _ctx, next) => {
          order.push("m2");
          return next();
        },
      ],
    }
  );
  await bus.execute(createCommand("do"));
  assert.deepEqual(order, ["m1", "m2", "handler"]);
});

test("validationMiddleware rejects invalid commands", async () => {
  const bus = new CommandBus();
  bus.register(
    "save",
    async () => ({ ok: true }),
    {
      middleware: [
        validationMiddleware((cmd) => {
          if (!cmd.payload?.id) throw new Error("id_required");
        }),
      ],
    }
  );
  await assert.rejects(() => bus.execute(createCommand("save", {})), /id_required/);
});

test("permissionsMiddleware blocks unauthorized commands", async () => {
  const bus = new CommandBus();
  bus.register(
    "delete",
    async () => ({ ok: true }),
    {
      middleware: [
        permissionsMiddleware((_cmd, ctx) => ctx?.can?.("workspace:delete") === true),
      ],
    }
  );
  const ctx = createPlatformContext({ permissions: ["workspace:read"] });
  await assert.rejects(
    () => bus.execute(createCommand("delete", {}), ctx),
    /permission_denied/
  );
});

test("registerCachedQuery caches query results", async () => {
  const queryBus = (await import("../src/query-bus.js")).QueryBus;
  const bus = new queryBus();
  const cache = new CacheService({
    get: async () => null,
    set: async () => {},
    del: async () => {},
  });
  let loads = 0;
  const register = registerCachedQuery(bus, cache, {
    queryType: "test.cached",
    ttlSec: 60,
  });
  register(async () => {
    loads += 1;
    return { value: 1 };
  });
  const q = { type: "test.cached", params: { id: "x" } };
  await bus.execute(q);
  await bus.execute(q);
  assert.equal(loads, 1);
});

test("CacheService memo returns cached flag", async () => {
  let loads = 0;
  const cache = new CacheService();
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
  const cache = new CacheService();
  await cache.set("a", "1", 60, { tags: ["user:1"] });
  await cache.set("b", "2", 60, { tags: ["user:2"] });
  await cache.invalidateTag("user:1");
  assert.equal(await cache.get("a"), null);
  assert.equal(await cache.get("b"), "2");
});

test("CacheService invalidateTags clears multiple tags", async () => {
  const cache = new CacheService();
  await cache.set("a", "1", 60, { tags: ["t1"] });
  await cache.set("b", "2", 60, { tags: ["t2"] });
  await cache.invalidateTags(["t1", "t2"]);
  assert.equal(await cache.get("a"), null);
  assert.equal(await cache.get("b"), null);
});

test("createMappedQuery validates required params", async () => {
  const { createMappedQuery, platformQueries } = await import("../src/query-map.js");
  assert.ok(platformQueries.has("hub.dashboard.aggregated"));
  const q = createMappedQuery("hub.dashboard.aggregated", { userId: "u1" });
  assert.equal(q.type, "hub.dashboard.aggregated");
  assert.equal(q.params.userId, "u1");
  assert.throws(
    () => createMappedQuery("hub.dashboard.aggregated", {}),
    /query_param_required/
  );
  assert.throws(() => createMappedQuery("unknown.query", {}), /query_unknown/);
});

test("platformQueries.assertRegistered detects missing handlers", async () => {
  const { QueryBus } = await import("../src/query-bus.js");
  const { platformQueries } = await import("../src/query-map.js");
  const bus = new QueryBus();
  assert.throws(() => platformQueries.assertRegistered(bus), /query_handlers_missing/);
  for (const type of platformQueries.types) {
    bus.register(type, async () => ({}));
  }
  platformQueries.assertRegistered(bus);
});
