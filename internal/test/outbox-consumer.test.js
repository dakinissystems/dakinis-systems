import assert from "node:assert/strict";
import test from "node:test";
import { mapOutboxEventToPlatformEvent } from "../src/events/outbox-consumer.js";

test("mapOutboxEventToPlatformEvent versions invite and director", () => {
  assert.equal(mapOutboxEventToPlatformEvent("invite.accepted.v1"), "workspace.member.accepted");
  assert.equal(mapOutboxEventToPlatformEvent("invite.created.v1"), "invite.created");
  assert.equal(mapOutboxEventToPlatformEvent("director.started.v1"), "stream.director.started");
  assert.equal(mapOutboxEventToPlatformEvent("director.completed.v1"), "stream.director.ended");
});
