import { BASE_URL, DEFAULT_POLL_TIMEOUT_SECONDS, DEFAULT_RETRY_DELAY_MS } from "../constants";
import { InvalidToken, TimedOut } from "../errors";
import { t } from "../i18n/runtime";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";
import { Update } from "../models/Update";
import { User } from "../models/User";
import { WebhookInfo } from "../models/WebhookInfo";
import { BaseRequest, type RequestPayload } from "../request/BaseRequest";
import { FetchRequest } from "../request/FetchRequest";
import type { JsonObject, RequestOptions } from "../types";

export interface BotConfig {
  token: string;
  baseUrl?: string;
  request?: BaseRequest;
  pollingRequest?: BaseRequest;
  polling?: boolean | PollingOptions;
}

export interface BotConstructorOptions extends Omit<BotConfig, "token"> {}

export interface GetUpdatesParams {
  offset?: number;
  limit?: number;
  timeout?: number;
  allowedUpdates?: string[];
}

export interface EventMetadata {
  match?: RegExpExecArray;
  update: Update;
}

export interface PollingOptions {
  timeoutSeconds?: number;
  retryDelayMs?: number;
  allowedUpdates?: string[];
  onUpdate?: (update: Update) => Promise<void> | void;
}

export type BotEvent =
  | "message"
  | "text"
  | "photo"
  | "sticker"
  | "command";

export type BotEventCallback = (
  message: Message,
  metadata: EventMetadata,
) => Promise<void> | void;

type TextListener = {
  pattern: RegExp;
  callback: (message: Message, match: RegExpExecArray) => Promise<void> | void;
};

export class Bot {
  private readonly baseUrl: string;
  private readonly request: [BaseRequest, BaseRequest];
  private initialized = false;
  private botUser?: User;
  private readonly eventListeners = new Map<BotEvent, BotEventCallback[]>();
  private readonly textListeners: TextListener[] = [];
  private polling = false;
  private pollingTask?: Promise<void>;
  private nextUpdateOffset?: number;

  private readonly config: BotConfig;

  constructor(token: string, options?: BotConstructorOptions);
  constructor(config: BotConfig);
  constructor(tokenOrConfig: string | BotConfig, options: BotConstructorOptions = {}) {
    const config =
      typeof tokenOrConfig === "string"
        ? { ...options, token: tokenOrConfig }
        : tokenOrConfig;

    this.config = config;

    if (!config.token) {
      throw new InvalidToken(t("error.invalidTokenInput"));
    }

    const rootUrl = config.baseUrl ?? BASE_URL;
    this.baseUrl = `${rootUrl}/bot${config.token}`;
    this.request = [
      config.pollingRequest ?? new FetchRequest(),
      config.request ?? new FetchRequest(),
    ];

    if (config.polling) {
      const pollingOptions =
        typeof config.polling === "object" ? config.polling : undefined;
      queueMicrotask(() => {
        void this.startPolling(pollingOptions).catch((error) => {
          console.error(t("app.pollingFetchError"), error);
        });
      });
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await Promise.all(this.request.map((transport) => transport.initialize()));

    try {
      await this.getMe();
    } catch (error) {
      if (error instanceof InvalidToken) {
        throw new InvalidToken(t("error.rejectedToken", { token: this.config.token }));
      }
      throw error;
    }

    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await Promise.all(this.request.map((transport) => transport.shutdown()));
    this.initialized = false;
  }

  async getMe(options?: RequestOptions): Promise<User> {
    const result = await this.post("getMe", {}, options);
    const user = User.fromApi(asJsonObject(result));

    if (!user) {
      throw new InvalidToken(t("error.invalidGetMePayload"));
    }

    this.botUser = user;
    return user;
  }

  async getUpdate(
    params: GetUpdatesParams = {},
    options?: RequestOptions,
  ): Promise<Update | undefined> {
    const updates = await this.getUpdates(params, options);
    return updates[0];
  }

  async getUpdates(
    params: GetUpdatesParams = {},
    options?: RequestOptions,
  ): Promise<Update[]> {
    const result = await this.post(
      "getUpdates",
      {
        timeout: params.timeout,
        offset: params.offset,
        limit: params.limit,
        allowed_updates: params.allowedUpdates?.join(","),
      },
      {
        ...options,
        // Long polling must wait slightly longer than the API timeout parameter.
        readTimeout: (params.timeout ?? 0) + 5,
      },
    );

    const payloads = asJsonObjectArray(result);
    return payloads.map((payload) => Update.fromApi(payload, this)).filter(isDefined);
  }

  async sendMessage(
    chatId: string,
    text: string,
    options?: { reply_to_message_id?: string },
  ): Promise<Message> {
    return this.sendMessageLike("sendMessage", {
      chat_id: chatId,
      text,
      reply_to_message_id: options?.reply_to_message_id,
    });
  }

  async sendPhoto(
    chatId: string,
    caption: string,
    photo: string,
    options?: { reply_to_message_id?: string },
  ): Promise<Message> {
    return this.sendMessageLike("sendPhoto", {
      chat_id: chatId,
      caption,
      photo,
      reply_to_message_id: options?.reply_to_message_id,
    });
  }

  async sendSticker(
    chatId: string,
    sticker: string,
    options?: { reply_to_message_id?: string },
  ): Promise<Message> {
    return this.sendMessageLike("sendSticker", {
      chat_id: chatId,
      sticker,
      reply_to_message_id: options?.reply_to_message_id,
    });
  }

  async sendChatAction(chatId: string, action: string, options?: RequestOptions): Promise<boolean> {
    const result = await this.post(
      "sendChatAction",
      {
        chat_id: chatId,
        action,
      },
      options,
    );

    return Boolean(result);
  }

  async setWebhook(url: string, secretToken: string): Promise<boolean> {
    const result = await this.post("setWebhook", {
      url,
      secret_token: secretToken,
    });

    return Boolean(result);
  }

  async deleteWebhook(): Promise<boolean> {
    const result = await this.post("deleteWebhook");
    return Boolean(result);
  }

  async getWebhookInfo(): Promise<WebhookInfo | undefined> {
    const result = await this.post("getWebhookInfo");
    return WebhookInfo.fromApi(asJsonObject(result));
  }

  on(event: BotEvent, callback: BotEventCallback): this {
    const listeners = this.eventListeners.get(event) ?? [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);
    return this;
  }

  onText(
    pattern: RegExp,
    callback: (message: Message, match: RegExpExecArray) => Promise<void> | void,
  ): this {
    this.textListeners.push({ pattern, callback });
    return this;
  }

  async processUpdate(update: Update | JsonObject): Promise<void> {
    const normalizedUpdate = update instanceof Update ? update : Update.fromApi(update, this);
    if (!normalizedUpdate?.message) {
      return;
    }

    if (typeof normalizedUpdate.updateId === "number") {
      this.nextUpdateOffset = normalizedUpdate.updateId + 1;
    }

    const metadata: EventMetadata = { update: normalizedUpdate };
    for (const eventType of normalizedUpdate.eventTypes) {
      const listeners = this.eventListeners.get(eventType as BotEvent) ?? [];
      for (const listener of listeners) {
        await listener(normalizedUpdate.message, metadata);
      }
    }

    if (normalizedUpdate.message.text) {
      for (const listener of this.textListeners) {
        const match = createRegexMatcher(listener.pattern).exec(normalizedUpdate.message.text);
        if (match) {
          await listener.callback(normalizedUpdate.message, match);
        }
      }
    }
  }

  startPolling(options: PollingOptions = {}): Promise<void> {
    if (this.pollingTask) {
      return this.pollingTask;
    }

    this.pollingTask = this.runPolling(options).finally(() => {
      this.polling = false;
      this.pollingTask = undefined;
    });

    return this.pollingTask;
  }

  stopPolling(): void {
    this.polling = false;
  }

  isPolling(): boolean {
    return this.polling;
  }

  async setWebHook(url: string, options?: { secret_token?: string }): Promise<boolean> {
    return this.setWebhook(url, options?.secret_token ?? "");
  }

  async deleteWebHook(): Promise<boolean> {
    return this.deleteWebhook();
  }

  async getWebHookInfo(): Promise<WebhookInfo | undefined> {
    return this.getWebhookInfo();
  }

  get cachedUser(): User | undefined {
    return this.botUser;
  }

  private async runPolling(options: PollingOptions): Promise<void> {
    const timeoutSeconds = options.timeoutSeconds ?? DEFAULT_POLL_TIMEOUT_SECONDS;
    const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

    await this.initialize();
    this.polling = true;

    try {
      while (this.polling) {
        try {
          const updates = await this.getUpdates({
            timeout: timeoutSeconds,
            offset: this.nextUpdateOffset,
            allowedUpdates: options.allowedUpdates,
          });

          if (updates.length > 0) {
            for (const update of updates) {
              if (options.onUpdate) {
                await options.onUpdate(update);
              }
              await this.processUpdate(update);
            }
            continue;
          }
        } catch (error) {
          if (!(error instanceof TimedOut)) {
            console.error(t("app.pollingFetchError"), error);
          }
        }

        await sleep(retryDelayMs);
      }
    } finally {
      await this.shutdown();
    }
  }

  private async sendMessageLike(endpoint: string, data: RequestPayload): Promise<Message> {
    const result = await this.post(endpoint, data);
    const rawResult = asJsonObject(result);
    const message = Message.fromApi(rawResult, this);

    if (!message) {
      return this.buildMessageFallback(data, rawResult);
    }

    return message;
  }

  private buildMessageFallback(data: RequestPayload, result?: JsonObject): Message {
    const chatId = typeof data.chat_id === "string" ? data.chat_id : undefined;
    if (!chatId) {
      throw new Error(t("error.invalidMessageWithoutChatContext"));
    }

    const messageIdValue = result?.message_id;
    const timestampValue = result?.date;

    return new Message({
      bot: this,
      messageId:
        typeof messageIdValue === "string"
          ? messageIdValue
          : typeof messageIdValue === "number"
            ? String(messageIdValue)
            : `local-${Date.now()}`,
      date:
        typeof timestampValue === "number"
          ? new Date(timestampValue)
          : new Date(),
      chat: new Chat(chatId, "direct"),
      messageType: "CHAT_MESSAGE",
      text: typeof data.text === "string" ? data.text : undefined,
      sticker: typeof data.sticker === "string" ? data.sticker : undefined,
      photoUrl: typeof data.photo === "string" ? data.photo : undefined,
      raw: result,
    });
  }

  private async post(
    endpoint: string,
    data?: RequestPayload,
    options?: RequestOptions,
  ): Promise<JsonObject | JsonObject[] | boolean | undefined> {
    const request = endpoint === "getUpdates" ? this.request[0] : this.request[1];
    return request.post(`${this.baseUrl}/${endpoint}`, compactPayload(data), options);
  }
}

function compactPayload(data?: RequestPayload): RequestPayload {
  if (!data) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null),
  );
}

function asJsonObject(
  value: JsonObject | JsonObject[] | boolean | undefined,
): JsonObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value;
}

function asJsonObjectArray(
  value: JsonObject | JsonObject[] | boolean | undefined,
): JsonObject[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is JsonObject => Boolean(item) && typeof item === "object");
  }

  const singleValue = asJsonObject(value);
  return singleValue ? [singleValue] : [];
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function createRegexMatcher(pattern: RegExp): RegExp {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return new RegExp(pattern.source, flags);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
