/**
 * AkoeNet Assistant worker — consumes dakinis.ai (BullMQ).
 * Jobs from background.enqueue("akoenet.assistant.ask", …) or platform events.
 *
 * Railway: second service, same Dockerfile as Internal API.
 * startCommand: npm run worker:assistant
 */
import { processAssistantAiAsk } from "./services/assistant-ai.js";
import { logAssistantUsage } from "./services/akoenet-assistant.js";

console.log("[internal:worker:assistant] starting");
console.log(`  bus: ${process.env.DAKINIS_EVENT_BUS || "unset"}`);
console.log(`  redis: ${process.env.REDIS_URL ? "configured" : "missing REDIS_URL"}`);

if (!String(process.env.REDIS_URL || "").trim()) {
  console.warn("[internal:worker:assistant] Set REDIS_URL. Exiting.");
  process.exit(0);
}

/**
 * @param {unknown} raw
 */
function extractAskCommand(raw) {
  const data = raw && typeof raw === "object" ? raw : {};
  // background.enqueue shape: { name, payload }
  if (data.name === "akoenet.assistant.ask" && data.payload && typeof data.payload === "object") {
    return data.payload;
  }
  // publishBullMqEvent / DomainEvent envelope
  if (data.event === "akoenet.assistant.ask" || data.type === "akoenet.assistant.ask") {
    return data.payload && typeof data.payload === "object" ? data.payload : data;
  }
  if (data.payload && typeof data.payload === "object" && data.payload.action === "ai.ask") {
    return data.payload;
  }
  if (data.action === "ai.ask") return data;
  return null;
}

async function start() {
  const { createPlatformWorker } = await import("@dakinis/shared-ai/bullmq-bus");
  const worker = await createPlatformWorker("ai", async (event) => {
    const command = extractAskCommand(event);
    if (!command) {
      console.log("[internal:worker:assistant] skip unrecognized job", JSON.stringify(event)?.slice(0, 200));
      return;
    }
    console.log(
      `[internal:worker:assistant] ai.ask server=${command.serverId} channel=${command.channelId || ""}`,
    );
    const result = await processAssistantAiAsk(command);
    await logAssistantUsage({
      serverId: command.serverId,
      moduleKey: "assistant",
      userId: command.userId,
      tokensInput: result.tokensInput ?? null,
      tokensOutput: result.tokensOutput ?? null,
      endpoint: "ai.ask.worker",
      metadata: {
        status: result.status,
        channelId: command.channelId,
        messageId: result.messageId,
        provider: result.provider,
      },
    }).catch(() => {});
    console.log(`[internal:worker:assistant] done status=${result.status} messageId=${result.messageId || ""}`);
  });

  process.on("SIGTERM", async () => {
    await worker.close();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error("[internal:worker:assistant] fatal", err);
  process.exit(1);
});
