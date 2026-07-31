#!/usr/bin/env node
import { loadDotEnv, getConfig } from "../src/config.js";
import { createOpportunityEngine } from "../src/engine.js";

loadDotEnv();
const config = getConfig();

const engine = createOpportunityEngine(config, {
  onEvent(name, payload) {
    if (name === "opportunity.created") {
      console.error(
        `[scout] opportunity.created · ${payload.product} · profit=${payload.profit}€ · ${payload.kind}`,
      );
    }
  },
});

console.error(
  `[scout] run-once · dryRun=${config.dryRun} · minDiscord=${config.minProfitDiscord}€ · watchlist=${config.watchlistPath}`,
);

const summary = await engine.runOnce();
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.errors.length && summary.alerted === 0 ? 1 : 0);
