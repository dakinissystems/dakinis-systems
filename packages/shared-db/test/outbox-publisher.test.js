import assert from "node:assert/strict";
import test from "node:test";
import { OutboxPublisher } from "../src/outbox/publisher.js";

test("OutboxPublisher deduplicates by idempotency_key", async () => {
  const rows = [];
  const query = async (sql, params) => {
    if (sql.includes("INSERT INTO meta.outbox_events")) {
      const key = params[4];
      if (rows.some((r) => r.idempotency_key === key)) {
        return { rows: [] };
      }
      const row = {
        id: `id-${rows.length + 1}`,
        created_at: new Date().toISOString(),
        idempotency_key: key,
      };
      rows.push(row);
      return { rows: [row] };
    }
    if (sql.includes("WHERE idempotency_key")) {
      const key = params[0];
      const hit = rows.find((r) => r.idempotency_key === key);
      return { rows: hit ? [hit] : [] };
    }
    return { rows: [] };
  };

  const publisher = new OutboxPublisher(query);
  const input = {
    aggregateType: "workspace_addon_data",
    aggregateId: "ws:kanban",
    eventType: "workspace.addon_data.saved",
    payload: { revision: 1 },
  };

  const first = await publisher.publish(input);
  const second = await publisher.publish(input);
  assert.equal(first.id, "id-1");
  assert.equal(second.id, "id-1");
  assert.equal(rows.length, 1);
});

test("OutboxPublisher honors custom idempotencyKey", async () => {
  const rows = [];
  const query = async (sql, params) => {
    if (sql.includes("INSERT INTO meta.outbox_events")) {
      const row = {
        id: "custom-1",
        created_at: new Date().toISOString(),
        idempotency_key: params[4],
      };
      rows.push(row);
      return { rows: [row] };
    }
    return { rows: [] };
  };

  const publisher = new OutboxPublisher(query);
  await publisher.publish({
    aggregateType: "stream",
    aggregateId: "s1",
    eventType: "director.started",
    payload: {},
    idempotencyKey: "custom:key:1",
  });
  assert.equal(rows[0].idempotency_key, "custom:key:1");
});

test("toOutboxInput versions domain events as type.v1", async () => {
  const { toOutboxInput } = await import("../src/outbox/domain-events.js");
  const input = toOutboxInput({
    type: "invite.accepted",
    eventVersion: "v1",
    schemaVersion: 1,
    aggregateId: "inv-1",
    aggregateType: "WorkspaceInvite",
    workspaceId: "ws-1",
    actorId: "u-1",
    payload: { role: "member" },
    occurredAt: "2026-07-16T00:00:00.000Z",
  });
  assert.equal(input.eventType, "invite.accepted.v1");
  assert.equal(input.aggregateType, "WorkspaceInvite");
  assert.equal(input.payload._domain.eventVersion, "v1");
  assert.equal(input.payload.role, "member");
});
