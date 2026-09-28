import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PRODUCT_CAPABILITIES,
  buildNavFromCapabilities,
  tenantHasCapability,
} from "../src/product-capabilities.js";
import { PERMISSIONS, ROLE_PRESETS, hasPermission } from "../src/permissions.js";
import { evaluatePolicy } from "../src/policy-engine.js";
import { DAKINIS_EVENT_TYPES, createDakinisEvent } from "../src/events.js";
import { UI_STATES, normalizeUiError, uiStateFromError } from "../src/ui-states.js";

describe("product-capabilities", () => {
  it("builds nav for enabled capabilities", () => {
    const nav = buildNavFromCapabilities(["crm", "inventory"]);
    assert.ok(nav.some((n) => n.path === "/app/crm"));
    assert.ok(nav.some((n) => n.path === "/app/inventario"));
    assert.equal(tenantHasCapability(["crm"], "crm"), true);
    assert.equal(tenantHasCapability(["crm"], "whatsapp"), false);
    assert.ok(PRODUCT_CAPABILITIES.hospitality.nav.length >= 1);
  });

  it("resolves capabilities from plan modules + hospitality type", async () => {
    const { resolveTenantCapabilities } = await import("../src/product-capabilities.js");
    const caps = resolveTenantCapabilities({
      business: { modulesEnabled: ["crm", "inventory", "sales"], type: "restaurant" },
    });
    assert.ok(caps.includes("crm"));
    assert.ok(caps.includes("hospitality"));
    assert.ok(caps.includes("inventory"));
  });
});

describe("permissions + policy", () => {
  it("supports capability wildcards and role presets", () => {
    assert.equal(hasPermission(["inventory.*"], PERMISSIONS.inventoryProductRead), true);
    assert.equal(hasPermission(ROLE_PRESETS.waiter, PERMISSIONS.hospitalityOrderCreate), true);
    assert.equal(hasPermission(ROLE_PRESETS.waiter, PERMISSIONS.billingInvoiceManage), false);
    assert.equal(
      evaluatePolicy(
        { permissions: ["sales.*"] },
        "create",
        { type: "order" },
        { permission: PERMISSIONS.salesOrderCreate }
      ),
      "ALLOW"
    );
    assert.equal(
      evaluatePolicy({ permissions: [] }, "create", { type: "invoice" }, { permission: PERMISSIONS.billingInvoiceManage }),
      "DENY"
    );
  });
});

describe("events + ui-states", () => {
  it("creates events and normalizes errors", () => {
    const evt = createDakinisEvent({ type: DAKINIS_EVENT_TYPES.INVENTORY_LOW_STOCK, title: "Stock bajo" });
    assert.equal(evt.type, "inventory.low_stock");
    assert.ok(evt.id);
    const n = normalizeUiError({ status: 403, message: "no" });
    assert.equal(uiStateFromError(n), UI_STATES.permissionDenied);
  });
});
