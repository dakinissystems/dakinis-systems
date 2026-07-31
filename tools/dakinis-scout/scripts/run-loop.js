#!/usr/bin/env node
import { loadDotEnv, getConfig } from "../src/config.js";
import { createOpportunityEngine } from "../src/engine.js";

loadDotEnv();
const config = getConfig();
const engine = createOpportunityEngine(config, {
  onEvent(name, payload) {
    if (name === "opportunity.created") {
      console.error(
        `[scout] opportunity.created · ${payload.product} · profit=${payload.profit}€`,
      );
    }
  },
});

console.error(
  `[scout] loop every ${config.loopSeconds}s · dryRun=${config.dryRun} · minDiscord=${config.minProfitDiscord}€`,
);

async function tick() {
  try {
    const summary = await engine.runOnce();
    console.error(
      `[scout] tick · found=${summary.found} alerted=${summary.alerted} seenSkip=${summary.skippedSeen} errors=${summary.errors.length}`,
    );
  } catch (err) {
    console.error("[scout] tick failed:", err?.message || err);
  }
}

await tick();
setInterval(tick, Math.max(30, config.loopSeconds) * 1000);
