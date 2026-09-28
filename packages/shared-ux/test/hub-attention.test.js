import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deriveHubAttention } from "../src/hub-attention.js";

describe("deriveHubAttention", () => {
  it("prefers dashboard.attention", () => {
    const r = deriveHubAttention({
      attention: [{ id: "1", title: "Stock bajo", severity: "warning", product: "core" }],
      actions: [{ id: "a", title: "ignored", severity: "info" }],
      apps: [{ id: "core", name: "Dakinis One", alertCount: 3 }],
    });
    assert.equal(r.count, 1);
    assert.equal(r.items[0].title, "Stock bajo");
    assert.equal(r.products[0].badge, 3);
  });

  it("falls back to actions", () => {
    const r = deriveHubAttention({
      actions: [{ id: "a", title: "Factura", severity: "critical" }],
      apps: [],
    });
    assert.equal(r.count, 1);
    assert.equal(r.items[0].severity, "critical");
  });
});
