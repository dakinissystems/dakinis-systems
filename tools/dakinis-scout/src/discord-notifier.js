/**
 * Discord webhook notifier for Dakinis Scout.
 * Reads DISCORD_WEBHOOK_URL from env — never hardcode secrets.
 */

const DEFAULT_USERNAME = "Dakinis Scout";

/** @typedef {"green"|"yellow"|"red"|"blue"|"purple"} Urgency */

const COLORS = {
  green: 0x00c853,
  yellow: 0xf9a825,
  red: 0xe53935,
  blue: 0x1e88e5,
  purple: 0x8e24aa,
};

/**
 * @param {number | string | null | undefined} n
 * @param {string} [currency]
 */
export function formatMoney(n, currency = "€") {
  if (n == null || n === "" || Number.isNaN(Number(n))) return "—";
  const v = Number(n);
  return `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

/**
 * @param {number | null | undefined} roi
 */
export function formatRoi(roi) {
  if (roi == null || Number.isNaN(Number(roi))) return "—";
  return `${Number(roi).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`;
}

/**
 * @param {number | null | undefined} stars 0–5
 */
export function formatStars(stars) {
  if (stars == null || Number.isNaN(Number(stars))) return null;
  const n = Math.max(0, Math.min(5, Math.round(Number(stars))));
  return "⭐".repeat(n) + "☆".repeat(5 - n);
}

/**
 * Resolve webhook URL by category or default.
 * @param {string} [category]
 * @param {Record<string, string>} [env]
 */
export function resolveWebhookUrl(category, env = process.env) {
  if (category) {
    const key = `DISCORD_WEBHOOK_URL_${String(category).toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
    if (env[key]) return String(env[key]).trim();
  }
  return String(env.DISCORD_WEBHOOK_URL || env.DISCORD_WEBHOOK || "").trim();
}

/**
 * @param {{
 *   product: string;
 *   buyPrice?: number | null;
 *   sellPrice?: number | null;
 *   profit?: number | null;
 *   roi?: number | null;
 *   brand?: string | null;
 *   category?: string | null;
 *   stars?: number | null;
 *   stock?: string | number | null;
 *   imageUrl?: string | null;
 *   amazonUrl?: string | null;
 *   wallapopUrl?: string | null;
 *   ebayUrl?: string | null;
 *   urgency?: Urgency;
 *   title?: string;
 *   detectedAt?: string | Date | null;
 *   footer?: string | null;
 * }} opportunity
 */
export function buildOpportunityEmbed(opportunity) {
  const {
    product,
    buyPrice,
    sellPrice,
    profit,
    roi,
    brand,
    category,
    stars,
    stock,
    imageUrl,
    amazonUrl,
    wallapopUrl,
    ebayUrl,
    urgency = "green",
    title = "🔥 Nueva oportunidad",
    detectedAt = new Date(),
    footer = "Dakinis Scout",
  } = opportunity;

  const fields = [
    { name: "💶 Compra", value: formatMoney(buyPrice), inline: true },
    { name: "💰 Venta media", value: formatMoney(sellPrice), inline: true },
    { name: "📈 Beneficio", value: formatMoney(profit), inline: true },
    { name: "📊 ROI", value: formatRoi(roi), inline: true },
  ];

  if (brand) fields.push({ name: "🏷️ Marca", value: String(brand), inline: true });
  if (category) fields.push({ name: "📂 Categoría", value: String(category), inline: true });
  if (stock != null && stock !== "") {
    fields.push({ name: "📦 Stock", value: String(stock), inline: true });
  }

  const starLine = formatStars(stars);
  const links = [
    amazonUrl ? `[Comprar en Amazon](${amazonUrl})` : null,
    wallapopUrl ? `[Ver Wallapop](${wallapopUrl})` : null,
    ebayUrl ? `[Ver eBay](${ebayUrl})` : null,
  ].filter(Boolean);

  const descriptionParts = [
    `**${product}**`,
    starLine,
    links.length ? links.join(" · ") : null,
  ].filter(Boolean);

  /** @type {Record<string, unknown>} */
  const embed = {
    title,
    description: descriptionParts.join("\n"),
    color: COLORS[urgency] ?? COLORS.green,
    fields,
    timestamp:
      detectedAt instanceof Date
        ? detectedAt.toISOString()
        : detectedAt
          ? new Date(detectedAt).toISOString()
          : new Date().toISOString(),
    footer: footer ? { text: footer } : undefined,
  };

  if (imageUrl) {
    embed.thumbnail = { url: imageUrl };
  }

  return embed;
}

/**
 * @param {string} webhookUrl
 * @param {Record<string, unknown>} payload
 * @param {{ timeoutMs?: number }} [opts]
 */
export async function postWebhook(webhookUrl, payload, opts = {}) {
  if (!webhookUrl) {
    return { ok: false, error: "webhook_url_missing" };
  }

  const timeoutMs = opts.timeoutMs ?? 10_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        status: res.status,
        error: text.slice(0, 500) || `http_${res.status}`,
      };
    }

    return { ok: true, status: res.status };
  } catch (err) {
    return {
      ok: false,
      error: err?.name === "AbortError" ? "timeout" : err?.message || "fetch_failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Create a notifier bound to env / options.
 * @param {{
 *   webhookUrl?: string;
 *   username?: string;
 *   avatarUrl?: string;
 *   env?: NodeJS.ProcessEnv;
 * }} [options]
 */
export function createDiscordNotifier(options = {}) {
  const env = options.env || process.env;
  const username = options.username || env.DISCORD_WEBHOOK_USERNAME || DEFAULT_USERNAME;
  const avatarUrl = options.avatarUrl || env.DISCORD_AVATAR_URL || undefined;

  return {
    /**
     * Send a rich opportunity embed.
     * @param {Parameters<typeof buildOpportunityEmbed>[0]} opportunity
     * @param {{ webhookUrl?: string; content?: string }} [sendOpts]
     */
    async sendOpportunity(opportunity, sendOpts = {}) {
      const webhookUrl =
        sendOpts.webhookUrl ||
        resolveWebhookUrl(opportunity.category || undefined, env) ||
        options.webhookUrl ||
        resolveWebhookUrl(undefined, env);

      if (!webhookUrl) {
        return {
          ok: false,
          error: "DISCORD_WEBHOOK_URL not set",
          hint: "Copy .env.example → .env and set DISCORD_WEBHOOK_URL",
        };
      }

      const embed = buildOpportunityEmbed(opportunity);
      /** @type {Record<string, unknown>} */
      const payload = {
        username,
        embeds: [embed],
      };
      if (avatarUrl) payload.avatar_url = avatarUrl;
      if (sendOpts.content) payload.content = sendOpts.content;

      return postWebhook(webhookUrl, payload);
    },

    /**
     * Plain text / custom embed payload.
     * @param {{ content?: string; embeds?: unknown[]; username?: string }} message
     * @param {{ category?: string; webhookUrl?: string }} [sendOpts]
     */
    async send(message, sendOpts = {}) {
      const webhookUrl =
        sendOpts.webhookUrl ||
        resolveWebhookUrl(sendOpts.category, env) ||
        options.webhookUrl ||
        resolveWebhookUrl(undefined, env);

      if (!webhookUrl) {
        return { ok: false, error: "DISCORD_WEBHOOK_URL not set" };
      }

      return postWebhook(webhookUrl, {
        username: message.username || username,
        avatar_url: avatarUrl,
        ...message,
      });
    },
  };
}

/** Default singleton using process.env */
export const discordNotifier = createDiscordNotifier();
