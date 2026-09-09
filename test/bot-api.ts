import { Bot, ZaloBot, type EventMetadata, type Message } from "../src";
import type { JsonObject, RequestOptions } from "../src/types";
import { BaseRequest, type RequestPayload } from "../src/request/BaseRequest";
import { InvalidToken } from "../src/errors";

class MockRequest extends BaseRequest {
  readonly readTimeout = 0;

  constructor(private readonly responses: Record<string, JsonObject | JsonObject[] | boolean>) {
    super();
  }

  readonly callCount: Record<string, number> = {};

  async initialize(): Promise<void> {}

  async shutdown(): Promise<void> {}

  async post(
    url: string,
    _data?: RequestPayload,
    _options?: RequestOptions,
  ): Promise<JsonObject | JsonObject[] | boolean | undefined> {
    const endpoint = url.split("/").pop() ?? "";
    this.callCount[endpoint] = (this.callCount[endpoint] ?? 0) + 1;
    return this.responses[endpoint];
  }

  protected async doRequest(): Promise<never> {
    throw new Error("MockRequest.doRequest should not be called");
  }
}

class HookRequest extends BaseRequest {
  readonly readTimeout = 0;

  constructor(private readonly responses: Record<string, JsonObject | JsonObject[] | boolean>) {
    super();
  }

  async initialize(): Promise<void> {}

  async shutdown(): Promise<void> {}

  protected async doRequest(
    url: string,
    _method: "GET" | "POST",
    _data?: RequestPayload,
  ): Promise<{ status: number; body: string }> {
    const endpoint = url.split("/").pop() ?? "";
    const result = this.responses[endpoint];
    return {
      status: 200,
      body: JSON.stringify({ result }),
    };
  }
}

class QueueRequest extends BaseRequest {
  readonly readTimeout = 0;
  readonly requests: { endpoint: string; options?: RequestOptions }[] = [];
  private readonly queue = new Map<string, Array<JsonObject | JsonObject[] | boolean | undefined>>();
  private pendingResolver?: () => void;

  enqueue(endpoint: string, value: JsonObject | JsonObject[] | boolean | undefined): void {
    const items = this.queue.get(endpoint) ?? [];
    items.push(value);
    this.queue.set(endpoint, items);
    this.pendingResolver?.();
    this.pendingResolver = undefined;
  }

  async initialize(): Promise<void> {}

  async shutdown(): Promise<void> {}

  async post(
    url: string,
    _data?: RequestPayload,
    options?: RequestOptions,
  ): Promise<JsonObject | JsonObject[] | boolean | undefined> {
    const endpoint = url.split("/").pop() ?? "";
    this.requests.push({ endpoint, options });

    if (options?.signal?.aborted) {
      throw new Error("aborted");
    }

    while (true) {
      const items = this.queue.get(endpoint);
      if (items && items.length > 0) {
        return items.shift();
      }
      await new Promise<void>((resolve) => {
        this.pendingResolver = resolve;
      });
      if (options?.signal?.aborted) {
        throw new Error("aborted");
      }
    }
  }

  protected async doRequest(): Promise<never> {
    throw new Error("QueueRequest.doRequest should not be called");
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

  const sendPhotoResult = {
    message_id: "m-photo",
    date: Date.now(),
    chat: {
      id: "chat-1",
      type: "direct",
    },
    photo_url: "https://example.com/photo.jpg",
    text: "[1/2] Album fallback from SDK",
  } satisfies JsonObject;

  const editMessageResult = {
    message_id: "m-edit",
    date: Date.now(),
    chat: {
      id: "chat-1",
      type: "direct",
    },
    text: "edited",
  } satisfies JsonObject;

  const webhookInfoResult = {
    url: "https://example.com/webhook",
    has_custom_certificate: false,
    pending_update_count: 0,
  } satisfies JsonObject;

  const request = new MockRequest({
    getMe: getMeResult,
    sendMessage: sendMessageResult,
    sendPhoto: sendPhotoResult,
    editMessageText: editMessageResult,
    deleteMessage: true,
    pinMessage: true,
    unpinMessage: true,
    banChatMember: true,
    unbanChatMember: true,
    promoteChatAdmin: true,
    demoteChatAdmin: true,
    setChatKeyboard: true,
    deleteChatKeyboard: true,
    uploadFile: {
      file_id: "file-1",
      file_path: "/files/1",
      file_size: 123,
    },
    getFileInfo: {
      file_id: "file-1",
      file_path: "/files/1",
      file_size: 123,
    },
    getFileDownloadUrl: {
      file_url: "https://example.com/files/1",
    },
    setWebhook: {
      url: "https://example.com/webhook",
      updated_at: 1749538250568,
      verification: {
        ok: true,
        url: "https://example.com/webhook",
        outcome: "webhook.ok",
        hint: "Your endpoint responded successfully.",
      },
    },
    deleteWebhook: true,
    getWebhookInfo: webhookInfoResult,
  });

  const pollingRequest = new MockRequest({
    getUpdates: [updatePayload],
  });

  const bot = new Bot("test-token", {
    request,
    pollingRequest,
    logger: {
      error: (..._args: unknown[]) => {
        // silence test output
      },
    } as { error: (message: string, error: unknown, context?: unknown) => void },
  });

  const seenEvents: string[] = [];
  const regexMatches: string[] = [];
  const commandEvents: string[] = [];
  const onErrorKinds: string[] = [];

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

  bot.command("start", (_message, ctx) => {
    commandEvents.push(`${ctx.command.name}:${ctx.command.argsRaw}:${ctx.command.args.join(",")}`);
  });

  bot.command("help", (_message, ctx) => {
    commandEvents.push(`${ctx.command.name}:${ctx.command.argsRaw}:${ctx.command.args.join(",")}`);
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

  if (commandEvents[0] !== "start:demo:demo") {
    throw new Error(`Unexpected command ctx for /start: ${commandEvents[0] ?? ""}`);
  }

  await bot.processUpdate({
    update_id: 102,
    message: {
      message_id: "m-3",
      date: Date.now(),
      message_type: "CHAT_MESSAGE",
      text: "   /HELP   ",
      chat: {
        id: "chat-1",
        type: "direct",
      },
      from: {
        id: "user-1",
        display_name: "Demo User",
      },
    },
  });

  if (commandEvents[1] !== "HELP::") {
    throw new Error(`Expected case-insensitive /help parse but got: ${commandEvents[1] ?? ""}`);
  }

  const transientErrors: string[] = [];
  const textPattern = /ping/;
  const removableText = (_message: Message, _match: RegExpExecArray) => {
    regexMatches.push("removed-text-listener-triggered");
  };
  bot.onText(textPattern, removableText);
  bot.offText(textPattern, removableText);

  const removableListener = (_message: Message, _metadata: EventMetadata) => {
    transientErrors.push("removed-event-listener-triggered");
  };
  bot.on("message", removableListener);
  bot.off("message", removableListener);

  let onceCount = 0;
  bot.once("message", () => {
    onceCount += 1;
  });

  bot.on("text", () => {
    throw new Error("listener boom");
  });

  bot.onError((_error, context) => {
    onErrorKinds.push(`${context.kind}:${context.source}`);
  });

  await bot.processUpdate({
    update_id: 103,
    message: {
      message_id: "m-4",
      date: Date.now(),
      message_type: "CHAT_MESSAGE",
      text: "ping /start",
      chat: {
        id: "chat-1",
        type: "direct",
      },
      from: {
        id: "user-1",
        display_name: "Demo User",
      },
    },
  });

  await bot.processUpdate({
    update_id: 104,
    message: {
      message_id: "m-5",
      date: Date.now(),
      message_type: "CHAT_MESSAGE",
      text: "pong",
      chat: {
        id: "chat-1",
        type: "direct",
      },
      from: {
        id: "user-1",
        display_name: "Demo User",
      },
    },
  });

  if (onceCount !== 1) {
    throw new Error(`Expected once listener called once but got ${onceCount}`);
  }

  if (transientErrors.length > 0 || regexMatches.includes("removed-text-listener-triggered")) {
    throw new Error("off/offText listeners should not fire");
  }

  if (!onErrorKinds.includes("listener_user_code:event_dispatch")) {
    throw new Error(`Expected listener error to be reported. Seen: ${onErrorKinds.join("|")}`);
  }

  await bot.processUpdate({
    invalid: true,
  });
  if (!onErrorKinds.includes("payload_parse:event_dispatch")) {
    throw new Error(`Expected payload parse error to be reported. Seen: ${onErrorKinds.join("|")}`);
  }

  const webhookSet = await bot.setWebHook("https://example.com/webhook", {
    secret_token: "secret",
  });
  const webhookDeleted = await bot.deleteWebHook();
  const webhookInfo = await bot.getWebHookInfo();

  if (!webhookSet?.url || !webhookDeleted || webhookInfo?.url !== "https://example.com/webhook") {
    throw new Error("Webhook helpers failed");
  }

  const sent = await bot.sendMessage("chat-1", "ok");
  if (sent.text !== "ok") {
    throw new Error("sendMessage did not return parsed message");
  }

  const sentPhotos = await bot.sendPhotos(
    "chat-1",
    ["https://example.com/photo-1.jpg", "https://example.com/photo-2.jpg"],
    "Album fallback from SDK",
  );
  if (sentPhotos.length !== 2) {
    throw new Error(`Expected 2 sent photos but got ${sentPhotos.length}`);
  }
  if ((request.callCount.sendPhoto ?? 0) !== 2) {
    throw new Error(`Expected sendPhoto to be called 2 times but got ${request.callCount.sendPhoto ?? 0}`);
  }

  const edited = await bot.editMessageText("chat-1", "m-2", "edited");
  if (edited.text !== "edited") {
    throw new Error("editMessageText did not return edited payload");
  }

  const deleted = await bot.deleteMessage("chat-1", "m-2");
  const pinned = await bot.pinMessage("chat-1", "m-2");
  const unpinned = await bot.unpinMessage("chat-1", "m-2");
  const banned = await bot.banChatMember("chat-1", "user-2", { reason: "spam" });
  const unbanned = await bot.unbanChatMember("chat-1", "user-2");
  const promoted = await bot.promoteChatAdmin("chat-1", "user-2", { role: "moderator" });
  const demoted = await bot.demoteChatAdmin("chat-1", "user-2");
  const keyboardSet = await bot.setChatKeyboard("chat-1", { buttons: ["A"] });
  const keyboardDeleted = await bot.deleteChatKeyboard("chat-1");
  const uploadedFile = await bot.uploadFile("https://example.com/files/1.jpg");
  const fileInfo = await bot.getFileInfo("file-1");
  const fileUrl = await bot.getFileDownloadUrl("file-1");
  if (
    !deleted ||
    !pinned ||
    !unpinned ||
    !banned ||
    !unbanned ||
    !promoted ||
    !demoted ||
    !keyboardSet ||
    !keyboardDeleted ||
    uploadedFile?.fileId !== "file-1" ||
    fileInfo?.filePath !== "/files/1" ||
    fileUrl !== "https://example.com/files/1"
  ) {
    throw new Error("Extended typed API endpoint checks failed");
  }

  const hookEvents: string[] = [];
  await bot.sendMessage("chat-1", "hooked", {
    requestOptions: {
      timeoutProfile: "short",
      retryPolicy: {
        maxAttempts: 2,
        baseDelayMs: 1,
        maxDelayMs: 5,
      },
      hooks: {
        beforeRequest: (context) => {
          hookEvents.push(`before:${context.method}:${context.attempt}`);
        },
        afterResponse: (context) => {
          hookEvents.push(`after:${context.method}:${context.attempt}:${context.responseStatus ?? 0}`);
        },
      },
    },
  });

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

  const pollingQueueRequest = new QueueRequest();
  pollingQueueRequest.enqueue("getMe", getMeResult);
  const pollingErrorKinds: string[] = [];

  const pollingBot = new Bot("test-token", {
    request: pollingQueueRequest,
    pollingRequest: pollingQueueRequest,
    logger: {
      error: () => {
        // silence test output
      },
    },
  });
  pollingBot.onError((_error, context) => {
    pollingErrorKinds.push(`${context.kind}:${context.source}`);
  });

  pollingQueueRequest.enqueue("sendMessage", sendMessageResult);
  const hookTransport = new HookRequest({
    sendMessage: sendMessageResult,
  });
  const hookBot = new Bot("test-token", {
    request: hookTransport,
    pollingRequest: hookTransport,
    logger: {
      error: () => {
        // silence test output
      },
    },
  });
  await hookBot.sendMessage("chat-1", "hooked", {
    requestOptions: {
      timeoutProfile: "short",
      hooks: {
        beforeRequest: (context) => {
          hookEvents.push(`beforePolling:${context.method}:${context.attempt}`);
        },
        afterResponse: (context) => {
          hookEvents.push(`afterPolling:${context.method}:${context.attempt}:${context.responseStatus ?? 0}`);
        },
      },
    },
  });
  if (!hookEvents.some((entry) => entry.startsWith("beforePolling")) || !hookEvents.some((entry) => entry.startsWith("afterPolling"))) {
    throw new Error(`Expected request hooks to run on transport path, got events: ${hookEvents.join("|")}`);
  }

  const pollingTask = pollingBot.startPolling({
    timeoutSeconds: 30,
    retryDelayMs: 1,
  });

  if (pollingBot.getPollingState() === "idle") {
    throw new Error("Polling state should leave idle right after startPolling");
  }

  await sleep(20);
  pollingBot.stopPolling();
  await pollingTask;

  if (pollingBot.getPollingState() !== "idle") {
    throw new Error(`Expected polling state idle but got ${pollingBot.getPollingState()}`);
  }

  const pollingCall = pollingQueueRequest.requests.find((requestEntry) => requestEntry.endpoint === "getUpdates");
  if (!pollingCall?.options?.signal) {
    throw new Error("Expected polling getUpdates call to include AbortSignal");
  }

  pollingBot.on("text", () => {
    throw new Error("polling listener boom");
  });
  pollingQueueRequest.enqueue("getUpdates", [
    {
      update_id: 999,
      message: {
        message_id: "m-9",
        date: Date.now(),
        message_type: "CHAT_MESSAGE",
        text: "/start hi",
        chat: {
          id: "chat-1",
          type: "direct",
        },
        from: {
          id: "user-1",
          display_name: "Demo User",
        },
      },
    },
  ]);
  const pollingTaskWithError = pollingBot.startPolling({
    timeoutSeconds: 1,
    retryDelayMs: 1,
  });
  await sleep(20);
  pollingBot.stopPolling();
  await pollingTaskWithError;

  if (!pollingErrorKinds.some((kind) => kind.startsWith("listener_user_code:"))) {
    throw new Error(`Expected polling listener errors to be reported. Seen: ${pollingErrorKinds.join("|")}`);
  }

  console.log("bot api ok");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
