import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeF1WidgetCoverage } from "../src/hub-f1-coverage.js";

describe("computeF1WidgetCoverage", () => {
  it("requires ≥2 non-hub products with real widget values", () => {
    const empty = computeF1WidgetCoverage({});
    assert.equal(empty.f1Ready, false);

    const one = computeF1WidgetCoverage({
      "core-sales-today": { value: "120 €" },
    });
    assert.equal(one.f1Ready, false);
    assert.deepEqual(one.productsWithData, ["core"]);

    const two = computeF1WidgetCoverage({
      "core-sales-today": { value: "120 €" },
      "stream-posts-week": { value: "3" },
      "hub-notifications-unread": { value: "2" },
    });
    assert.equal(two.f1Ready, true);
    assert.ok(two.productsWithData.includes("core"));
    assert.ok(two.productsWithData.includes("streamautomator"));
  });
});
