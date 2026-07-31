import { createDiscordNotifier } from "../discord-notifier.js";
import { urgencyFromProfit } from "../compare.js";

/**
 * Route opportunity.created to connectors by profit thresholds.
 * @param {object} config from getConfig()
 */
export function createRouter(config) {
  const discord = createDiscordNotifier();

  return {
    /**
     * @param {{
     *   product: string;
     *   buyPrice: number;
     *   sellPrice: number;
     *   profit: number;
     *   roi?: number | null;
     *   brand?: string | null;
     *   category?: string | null;
     *   imageUrl?: string | null;
     *   amazonUrl?: string | null;
     *   wallapopUrl?: string | null;
     *   stock?: string | null;
     *   title?: string;
     * }} opportunity
     */
    async dispatch(opportunity) {
      const profit = Number(opportunity.profit) || 0;
      const channels = [];

      // Threshold ladder (Telegram/WhatsApp stubs for later)
      if (profit >= config.minProfitTelegram) channels.push("telegram");
      if (profit >= config.minProfitDiscord) channels.push("discord");
      if (profit >= config.minProfitWhatsapp) channels.push("whatsapp");

      const unique = [...new Set(channels)];
      const results = {};

      for (const ch of unique) {
        if (ch === "discord") {
          if (config.dryRun) {
            results.discord = { ok: true, dryRun: true };
            continue;
          }
          results.discord = await discord.sendOpportunity({
            ...opportunity,
            urgency: urgencyFromProfit(profit),
            title: opportunity.title || "🔥 Nueva oportunidad",
            footer: "Dakinis Scout",
          });
        } else if (ch === "telegram") {
          results.telegram = { ok: true, skipped: true, reason: "not_implemented" };
        } else if (ch === "whatsapp") {
          results.whatsapp = { ok: true, skipped: true, reason: "not_implemented" };
        }
      }

      if (!unique.includes("discord") && profit > 0) {
        results.discord = {
          ok: true,
          skipped: true,
          reason: `below_threshold_${config.minProfitDiscord}`,
        };
      }

      return { channels: unique, results };
    },
  };
}
