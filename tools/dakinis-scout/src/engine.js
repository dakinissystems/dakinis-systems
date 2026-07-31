import fs from "node:fs";
import path from "node:path";
import { calcProfit, calcRoi, mean, median, percentile, round2 } from "./compare.js";
import { searchWallapop } from "./sources/wallapop.js";
import { createSeenStore } from "./store.js";
import { createRouter } from "./connectors/router.js";

/**
 * Keep listings whose title roughly matches the watch query/product.
 * @param {string} title
 * @param {string} query
 */
function titleMatches(title, query) {
  const t = String(title || "").toLowerCase();
  const tokens = String(query || "")
    .toLowerCase()
    .split(/[^a-z0-9áéíóúüñ+]+/i)
    .map((x) => x.trim())
    .filter((x) => x.length >= 3);
  if (!tokens.length) return true;
  const hits = tokens.filter((tok) => t.includes(tok)).length;
  return hits / tokens.length >= 0.6;
}

/**
 * Drop extreme outliers from price samples (IQR).
 * @param {number[]} values
 */
function trimPrices(values) {
  const xs = values.filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  if (xs.length < 6) return xs;
  const q1 = xs[Math.floor(xs.length * 0.25)];
  const q3 = xs[Math.floor(xs.length * 0.75)];
  const iqr = Math.max(1, q3 - q1);
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  return xs.filter((n) => n >= lo && n <= hi);
}

/**
 * @param {object} config
 * @param {{ onEvent?: (name: string, payload: object) => void }} [hooks]
 */
export function createOpportunityEngine(config, hooks = {}) {
  const seenPath = path.join(config.dataDir, "seen.json");
  const seen = createSeenStore(seenPath);
  const router = createRouter(config);

  function emit(name, payload) {
    if (typeof hooks.onEvent === "function") hooks.onEvent(name, payload);
  }

  function loadWatchlist() {
    const raw = fs.readFileSync(config.watchlistPath, "utf8");
    const data = JSON.parse(raw);
    const items = Array.isArray(data) ? data : data.items || [];
    return items.filter((i) => i && i.enabled !== false);
  }

  /**
   * @param {object} watch
   * @param {{ items: Array<{ id: string; title: string; price: number; url?: string|null; imageUrl?: string|null; city?: string|null; reserved?: boolean }> }} wallapopResult
   */
  function buildOpportunities(watch, wallapopResult) {
    const fees = Number(watch.feesEur ?? config.feesEur) || 0;
    const minProfit = Number(watch.minProfit ?? config.minProfitDiscord) || 0;
    const query = watch.wallapopQuery || watch.product;
    const items = (wallapopResult.items || []).filter((i) => titleMatches(i.title, query));
    const prices = trimPrices(items.map((i) => i.price));
    const sellMedian = median(prices);
    const sellMean = mean(prices);
    // Conservative resale estimate (p40) — what you can sell reasonably fast
    const sellQuick = percentile(prices, 0.4);
    const opportunities = [];
    const minSamples = Number(watch.minSamples ?? 4) || 4;

    const buyPrice = watch.buyPrice != null ? Number(watch.buyPrice) : null;
    const targetSell =
      watch.targetSellPrice != null ? Number(watch.targetSellPrice) : sellMedian;

    // Strategy A: Amazon/fixed buy → Wallapop quick-sell estimate
    if (buyPrice != null && sellQuick != null && prices.length >= minSamples) {
      const profit = calcProfit(buyPrice, sellQuick, fees);
      const roi = calcRoi(buyPrice, sellQuick, fees);
      if (profit != null && profit >= minProfit) {
        const matched = items.filter((i) => prices.includes(i.price));
        const top = matched.slice().sort((a, b) => b.price - a.price)[0] || items[0];
        opportunities.push({
          key: `flip:${watch.id}:p40`,
          kind: "amazon_to_wallapop",
          product: watch.product,
          brand: watch.brand || null,
          category: watch.category || null,
          buyPrice,
          sellPrice: sellQuick,
          sellMean,
          profit,
          roi,
          imageUrl: top?.imageUrl || watch.imageUrl || null,
          amazonUrl: watch.amazonUrl || null,
          wallapopUrl: top?.url || null,
          stock: `${items.length} anuncios Wallapop (n=${prices.length}, mediana ${sellMedian}€)`,
          title: "🔥 Oportunidad detectada",
          meta: { watchId: watch.id, sampleSize: prices.length, sellMedian },
        });
      }
    }

    // Strategy B: underpriced Wallapop listings vs target/market
    if (targetSell != null && Number.isFinite(targetSell)) {
      for (const listing of items) {
        if (listing.reserved) continue;
        const profit = calcProfit(listing.price, targetSell, fees);
        const roi = calcRoi(listing.price, targetSell, fees);
        if (profit == null || profit < minProfit) continue;
        if (listing.price > targetSell * 0.92) continue;

        opportunities.push({
          key: `deal:${watch.id}:${listing.id}`,
          kind: "wallapop_undervalued",
          product: listing.title || watch.product,
          brand: watch.brand || null,
          category: watch.category || null,
          buyPrice: listing.price,
          sellPrice: round2(targetSell),
          profit,
          roi,
          imageUrl: listing.imageUrl || null,
          amazonUrl: watch.amazonUrl || null,
          wallapopUrl: listing.url,
          stock: listing.city ? `Wallapop · ${listing.city}` : "Wallapop",
          title: "🟡 Precio bajo mercado",
          meta: {
            watchId: watch.id,
            listingId: listing.id,
            market: targetSell,
            sellMedian,
          },
        });
      }
    }

    return opportunities;
  }

  async function scanWatchItem(watch) {
    const query = watch.wallapopQuery || watch.product;
    const result = await searchWallapop({
      keywords: query,
      latitude: config.wallapop.latitude,
      longitude: config.wallapop.longitude,
      orderBy: config.wallapop.orderBy,
      limit: config.wallapop.limit,
    });

    if (!result.ok) {
      return { watchId: watch.id, ok: false, error: result.error, opportunities: [] };
    }

    const opportunities = buildOpportunities(watch, result);
    return {
      watchId: watch.id,
      ok: true,
      query,
      listings: result.items.length,
      opportunities,
    };
  }

  async function runOnce() {
    const watchlist = loadWatchlist();
    const summary = {
      startedAt: new Date().toISOString(),
      watched: watchlist.length,
      scanned: 0,
      found: 0,
      alerted: 0,
      skippedSeen: 0,
      skippedThreshold: 0,
      errors: [],
      alerts: [],
    };

    emit("scan.started", { watched: watchlist.length });

    /** @type {object[]} */
    const all = [];

    for (const watch of watchlist) {
      summary.scanned += 1;
      try {
        const scan = await scanWatchItem(watch);
        if (!scan.ok) {
          summary.errors.push({ watchId: watch.id, error: scan.error });
          continue;
        }
        all.push(...scan.opportunities);
      } catch (err) {
        summary.errors.push({ watchId: watch.id, error: err?.message || String(err) });
      }
    }

    all.sort((a, b) => (b.profit || 0) - (a.profit || 0));
    summary.found = all.length;

    let sent = 0;
    for (const opp of all) {
      if (sent >= config.maxAlertsPerRun) break;
      if (seen.has(opp.key)) {
        summary.skippedSeen += 1;
        continue;
      }

      emit("opportunity.created", opp);

      const routed = await router.dispatch(opp);
      const discord = routed.results.discord;

      if (discord?.skipped && String(discord.reason || "").startsWith("below_threshold")) {
        summary.skippedThreshold += 1;
        continue;
      }

      const delivered =
        discord && discord.ok && !discord.skipped && (config.dryRun ? discord.dryRun === true : true);

      if (delivered) {
        if (!config.dryRun) {
          seen.mark(opp.key, { profit: opp.profit, kind: opp.kind });
        }
        summary.alerted += 1;
        sent += 1;
        summary.alerts.push({
          key: opp.key,
          product: opp.product,
          profit: opp.profit,
          channels: routed.channels,
          discord,
        });
      } else if (discord && !discord.ok) {
        summary.errors.push({ key: opp.key, error: discord.error || "discord_failed" });
      }
    }

    summary.finishedAt = new Date().toISOString();
    emit("scan.finished", summary);
    return summary;
  }

  return { runOnce, loadWatchlist, seen };
}
