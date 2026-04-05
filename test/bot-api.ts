import { Bot, ZaloBot } from "../src";
import type { JsonObject, RequestOptions } from "../src/types";
import { BaseRequest, type RequestPayload } from "../src/request/BaseRequest";
import { InvalidToken } from "../src/errors";

class MockRequest extends BaseRequest {
  readonly readTimeout = 0;

  constructor(private readonly responses: Record<string, JsonObject | JsonObject[] | boolean>) {
    super();
  }

  async initialize(): Promise<void> {}

  async shutdown(): Promise<void> {}

  async post(
    url: string,
    _data?: RequestPayload,
    _options?: RequestOptions,
  ): Promise<JsonObject | JsonObject[] | boolean | undefined> {
    const endpoint = url.split("/").pop() ?? "";
    return this.responses[endpoint];
  }

  protected async doRequest(): Promise<never> {
    throw new Error("MockRequest.doRequest should not be called");
  }
}

async function main() {
  const getMeResult = {
    id: "bot-1",
    display_name: "Test Bot",
    account_name: "test-bot",
    account_type: "official",
  } satisfies JsonObject;

  const updatePayload = {
    update_id: 101,
    message: {
      message_id: "m-1",
      date: Date.now(),
      message_type: "CHAT_MESSAGE",
      text: "/start demo",
      chat: {
        id: "chat-1",
        type: "direct",
      },
      from: {
        id: "user-1",
        display_name: "Demo User",
      },
    },
  } satisfies JsonObject;

  const sendMessageResult = {
    message_id: "m-2",
    date: Date.now(),
    chat: {
      id: "chat-1",
      type: "direct",
    },
    text: "ok",
  } satisfies JsonObject;

  const webhookInfoResult = {
    url: "https://example.com/webhook",
    has_custom_certificate: false,
    pending_update_count: 0,
  } satisfies JsonObject;

  const request = new MockRequest({
    getMe: getMeResult,
    sendMessage: sendMessageResult,
    setWebhook: true,
    deleteWebhook: true,
    getWebhookInfo: webhookInfoResult,
  });

  const pollingRequest = new MockRequest({
    getUpdates: [updatePayload],
  });

  const bot = new Bot("test-token", {
    request,
    pollingRequest,
  });

  const seenEvents: string[] = [];
  const regexMatches: string[] = [];

  bot.on("message", (message, metadata) => {
    if (!metadata.update.hasEventType("message")) {
      throw new Error("message event metadata missing");
    }
    seenEvents.push(`message:${message.messageId}`);
  });

  bot.on("text", (message) => {
    seenEvents.push(`text:${message.text}`);
  });

  bot.on("command", (message) => {
    seenEvents.push(`command:${message.text}`);
  });

  bot.onText(/\/start (.+)/, (_message, match) => {
    regexMatches.push(match[1]);
  });

  await bot.initialize();

  const updates = await bot.getUpdates({ timeout: 1 });
  if (updates.length !== 1) {
    throw new Error(`Expected 1 update but received ${updates.length}`);
  }

  await bot.processUpdate(updatePayload);

  if (seenEvents.join("|") !== "message:m-1|text:/start demo|command:/start demo") {
    throw new Error(`Unexpected event dispatch order: ${seenEvents.join("|")}`);
  }

  if (regexMatches[0] !== "demo") {
    throw new Error(`Expected regex payload 'demo' but received '${regexMatches[0] ?? ""}'`);
  }

  const webhookSet = await bot.setWebHook("https://example.com/webhook", {
    secret_token: "secret",
  });
  const webhookDeleted = await bot.deleteWebHook();
  const webhookInfo = await bot.getWebHookInfo();

  if (!webhookSet || !webhookDeleted || webhookInfo?.url !== "https://example.com/webhook") {
    throw new Error("Webhook helpers failed");
  }

  const sent = await bot.sendMessage("chat-1", "ok");
  if (sent.text !== "ok") {
    throw new Error("sendMessage did not return parsed message");
  }

  if (bot.isPolling()) {
    throw new Error("Bot should not be polling in local API test");
  }

  await bot.shutdown();

  let invalidTokenRaised = false;
  try {
    new Bot({ token: "" });
  } catch (error) {
    invalidTokenRaised = error instanceof InvalidToken;
  }

  if (!invalidTokenRaised) {
    throw new Error("Expected InvalidToken for empty token");
  }

  const aliasBot = new ZaloBot("test-token", {
    request,
    pollingRequest,
  });
  if (!(aliasBot instanceof Bot)) {
    throw new Error("Expected ZaloBot export to alias Bot");
  }

  console.log("bot api ok");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
