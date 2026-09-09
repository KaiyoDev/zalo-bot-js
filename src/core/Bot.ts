import { BASE_URL, DEFAULT_POLL_TIMEOUT_SECONDS, DEFAULT_RETRY_DELAY_MS } from "../constants";
import { InvalidToken, TimedOut } from "../errors";
import { t } from "../i18n/runtime";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";
import { type ParsedCommand, Update } from "../models/Update";
import { User } from "../models/User";
import { WebhookInfo, WebhookResultModel, type WebhookResult, TestWebhookResultModel, type TestWebhookResult } from "../models/WebhookInfo";
import { BaseRequest, type RequestPayload } from "../request/BaseRequest";
import { FetchRequest } from "../request/FetchRequest";
import type { JsonObject, RequestOptions } from "../types";

export interface BotConfig {
  token: string;
  baseUrl?: string;
  request?: BaseRequest;
  pollingRequest?: BaseRequest;
  polling?: boolean | PollingOptions;
  logger?: BotLogger;
  onError?: BotErrorHandler;
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
  command?: ParsedCommand;
}

export interface PollingOptions {
  timeoutSeconds?: number;
  retryDelayMs?: number;
  allowedUpdates?: string[];
  onUpdate?: (update: Update) => Promise<void> | void;
  onError?: BotErrorHandler;
  requestOptions?: RequestOptions;
}

export type ParseMode = "markdown" | "html";

export interface TextStyleRun {
  start: number;
  len: number;
  st: string[];
}

export interface SendMessageOptions {
  reply_to_message_id?: string;
  parse_mode?: ParseMode;
  text_styles?: TextStyleRun[];
  requestOptions?: RequestOptions;
}

export interface SendPhotoOptions extends SendMessageOptions {}

export interface SendStickerOptions extends SendMessageOptions {}

export interface SendPhotosOptions extends SendMessageOptions {
  separator?: string;
}

export interface SendVoiceOptions {
  reply_to_message_id?: string;
  requestOptions?: RequestOptions;
}

export interface EditMessageTextOptions {
  requestOptions?: RequestOptions;
}

export interface DeleteMessageOptions {
  requestOptions?: RequestOptions;
}

export interface PinMessageOptions {
  requestOptions?: RequestOptions;
}

export interface UnpinMessageOptions {
  requestOptions?: RequestOptions;
}

export interface BanUserOptions {
  reason?: string;
  requestOptions?: RequestOptions;
}

export interface UnbanUserOptions {
  requestOptions?: RequestOptions;
}

export interface PromoteAdminOptions {
  role?: string;
  requestOptions?: RequestOptions;
}

export interface DemoteAdminOptions {
  requestOptions?: RequestOptions;
}

export interface SetChatKeyboardOptions {
  requestOptions?: RequestOptions;
}

export interface DeleteChatKeyboardOptions {
  requestOptions?: RequestOptions;
}

export interface GetFileInfoOptions {
  requestOptions?: RequestOptions;
}

export interface GetFileDownloadUrlOptions {
  requestOptions?: RequestOptions;
}

export interface UploadFileOptions {
  requestOptions?: RequestOptions;
}

export interface WebhookOptions {
  dropPendingUpdates?: boolean;
  requestOptions?: RequestOptions;
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

export interface CommandContext {
  command: ParsedCommand;
  update: Update;
}

export type CommandCallback = (
  message: Message,
  context: CommandContext,
) => Promise<void> | void;

export type PollingState = "idle" | "starting" | "running" | "stopping";

export interface BotErrorContext {
  kind: "request_temporary" | "payload_parse" | "listener_user_code";
  source: "polling" | "event_dispatch" | "text_listener" | "command_listener";
  update?: Update;
  event?: BotEvent;
  command?: ParsedCommand;
}

export type BotErrorHandler = (error: unknown, context: BotErrorContext) => Promise<void> | void;

export interface BotLogger {
  error(message: string, error: unknown, context?: BotErrorContext): void;
}

export interface FileInfo {
  fileId: string;
  filePath?: string;
  fileSize?: number;
  raw?: JsonObject;
}

type EventListener = {
  callback: BotEventCallback;
  once: boolean;
};

type TextListener = {
  pattern: RegExp;
  callback: (message: Message, match: RegExpExecArray) => Promise<void> | void;
  once: boolean;
};

type CommandListener = {
  command: string;
  callback: CommandCallback;
};

export class Bot {
  private readonly baseUrl: string;
  private readonly request: [BaseRequest, BaseRequest];
  private initialized = false;
  private botUser?: User;
  private readonly eventListeners = new Map<BotEvent, EventListener[]>();
  private readonly textListeners: TextListener[] = [];
  private readonly commandListeners: CommandListener[] = [];
  private readonly errorHandlers: BotErrorHandler[] = [];
  private readonly logger: BotLogger;
  private pollingState: PollingState = "idle";
  private pollingTask?: Promise<void>;
  private pollingAbortController?: AbortController;
  private nextUpdateOffset?: number;
  private adminId = process.env.ZALO_BOT_ADMIN_ID?.trim() ?? "";

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
    this.logger = config.logger ?? defaultLogger;
    if (config.onError) {
      this.errorHandlers.push(config.onError);
    }

    if (config.polling) {
      const pollingOptions =
        typeof config.polling === "object" ? config.polling : undefined;
      queueMicrotask(() => {
        void this.startPolling(pollingOptions).catch((error) => {
          this.reportError(error, {
            kind: "request_temporary",
            source: "polling",
          });
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
    options?: SendMessageOptions,
  ): Promise<Message> {
    return this.sendMessageLike("sendMessage", {
      chat_id: chatId,
      text,
      reply_to_message_id: options?.reply_to_message_id,
      parse_mode: options?.parse_mode,
      text_styles: options?.text_styles,
    }, options?.requestOptions);
  }

  async sendPhoto(
    chatId: string,
    caption: string,
    photo: string,
    options?: SendPhotoOptions,
  ): Promise<Message> {
    return this.sendMessageLike("sendPhoto", {
      chat_id: chatId,
      caption,
      photo,
      reply_to_message_id: options?.reply_to_message_id,
    }, options?.requestOptions);
  }

  async sendSticker(
    chatId: string,
    sticker: string,
    options?: SendStickerOptions,
  ): Promise<Message> {
    return this.sendMessageLike("sendSticker", {
      chat_id: chatId,
      sticker,
      reply_to_message_id: options?.reply_to_message_id,
    }, options?.requestOptions);
  }

  async sendVoice(
    chatId: string,
    voiceUrl: string,
    options?: SendVoiceOptions,
  ): Promise<Message> {
    return this.sendMessageLike("sendVoice", {
      chat_id: chatId,
      voice_url: voiceUrl,
      reply_to_message_id: options?.reply_to_message_id,
    }, options?.requestOptions);
  }

  async sendPhotos(
    chatId: string,
    photos: string[],
    caption = "",
    options: SendPhotosOptions = {},
  ): Promise<Message[]> {
    const sanitizedPhotos = photos.map((photo) => photo.trim()).filter(Boolean);
    if (sanitizedPhotos.length === 0) {
      return [];
    }

    const separator = options.separator ?? " ";
    const replies: Message[] = [];
    for (let index = 0; index < sanitizedPhotos.length; index += 1) {
      const photo = sanitizedPhotos[index];
      const label = `[${index + 1}/${sanitizedPhotos.length}]`;
      const indexedCaption = caption ? `${label}${separator}${caption}` : label;
      const message = await this.sendPhoto(chatId, indexedCaption, photo, {
        reply_to_message_id: options.reply_to_message_id,
        requestOptions: options.requestOptions,
      });
      replies.push(message);
    }
    return replies;
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

  async setWebhook(url: string, secretToken: string, options?: WebhookOptions): Promise<WebhookResult | undefined> {
    const result = await this.post("setWebhook", {
      url,
      secret_token: secretToken,
      drop_pending_updates: options?.dropPendingUpdates,
    }, options?.requestOptions);

    return WebhookResultModel.fromApi(asJsonObject(result));
  }

  async deleteWebhook(options?: WebhookOptions): Promise<boolean> {
    const result = await this.post("deleteWebhook", {
      drop_pending_updates: options?.dropPendingUpdates,
    }, options?.requestOptions);
    return Boolean(result);
  }

  async getWebhookInfo(options?: RequestOptions): Promise<WebhookInfo | undefined> {
    const result = await this.post("getWebhookInfo", undefined, options);
    return WebhookInfo.fromApi(asJsonObject(result));
  }

  async testWebhook(options?: RequestOptions): Promise<TestWebhookResult | undefined> {
    const result = await this.post("testWebhook", undefined, options);
    return TestWebhookResultModel.fromApi(asJsonObject(result));
  }

  async editMessageText(
    chatId: string,
    messageId: string,
    text: string,
    options?: EditMessageTextOptions,
  ): Promise<Message> {
    return this.sendMessageLike("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
    }, options?.requestOptions);
  }

  async deleteMessage(
    chatId: string,
    messageId: string,
    options?: DeleteMessageOptions,
  ): Promise<boolean> {
    const result = await this.post(
      "deleteMessage",
      {
        chat_id: chatId,
        message_id: messageId,
      },
      options?.requestOptions,
    );
    return Boolean(result);
  }

  async pinMessage(
    chatId: string,
    messageId: string,
    options?: PinMessageOptions,
  ): Promise<boolean> {
    const result = await this.post(
      "pinMessage",
      {
        chat_id: chatId,
        message_id: messageId,
      },
      options?.requestOptions,
    );
    return Boolean(result);
  }

  async unpinMessage(
    chatId: string,
    messageId: string,
    options?: UnpinMessageOptions,
  ): Promise<boolean> {
    const result = await this.post(
      "unpinMessage",
      {
        chat_id: chatId,
        message_id: messageId,
      },
      options?.requestOptions,
    );
    return Boolean(result);
  }

  async banChatMember(chatId: string, userId: string, options?: BanUserOptions): Promise<boolean> {
    const result = await this.post(
      "banChatMember",
      {
        chat_id: chatId,
        user_id: userId,
        reason: options?.reason,
      },
      options?.requestOptions,
    );
    return Boolean(result);
  }

  async unbanChatMember(chatId: string, userId: string, options?: UnbanUserOptions): Promise<boolean> {
    const result = await this.post(
      "unbanChatMember",
      {
        chat_id: chatId,
        user_id: userId,
      },
      options?.requestOptions,
    );
    return Boolean(result);
  }

  async promoteChatAdmin(
    chatId: string,
    userId: string,
    options?: PromoteAdminOptions,
  ): Promise<boolean> {
    const result = await this.post(
      "promoteChatAdmin",
      {
        chat_id: chatId,
        user_id: userId,
        role: options?.role,
      },
      options?.requestOptions,
    );
    return Boolean(result);
  }

  async demoteChatAdmin(chatId: string, userId: string, options?: DemoteAdminOptions): Promise<boolean> {
    const result = await this.post(
      "demoteChatAdmin",
      {
        chat_id: chatId,
        user_id: userId,
      },
      options?.requestOptions,
    );
    return Boolean(result);
  }

  async setChatKeyboard(
    chatId: string,
    keyboard: JsonObject,
    options?: SetChatKeyboardOptions,
  ): Promise<boolean> {
    const result = await this.post(
      "setChatKeyboard",
      {
        chat_id: chatId,
        keyboard: JSON.stringify(keyboard),
      },
      options?.requestOptions,
    );
    return Boolean(result);
  }

  async deleteChatKeyboard(chatId: string, options?: DeleteChatKeyboardOptions): Promise<boolean> {
    const result = await this.post(
      "deleteChatKeyboard",
      {
        chat_id: chatId,
      },
      options?.requestOptions,
    );
    return Boolean(result);
  }

  async uploadFile(fileUrl: string, options?: UploadFileOptions): Promise<FileInfo | undefined> {
    const result = await this.post(
      "uploadFile",
      {
        file_url: fileUrl,
      },
      options?.requestOptions,
    );
    return toFileInfo(asJsonObject(result));
  }

  async getFileInfo(fileId: string, options?: GetFileInfoOptions): Promise<FileInfo | undefined> {
    const result = await this.post(
      "getFileInfo",
      {
        file_id: fileId,
      },
      options?.requestOptions,
    );
    return toFileInfo(asJsonObject(result));
  }

  async getFileDownloadUrl(
    fileId: string,
    options?: GetFileDownloadUrlOptions,
  ): Promise<string | undefined> {
    const result = await this.post(
      "getFileDownloadUrl",
      {
        file_id: fileId,
      },
      options?.requestOptions,
    );
    const payload = asJsonObject(result);
    const candidate = payload?.file_url;
    return typeof candidate === "string" ? candidate : undefined;
  }

  on(event: BotEvent, callback: BotEventCallback): this {
    const listeners = this.eventListeners.get(event) ?? [];
    listeners.push({ callback, once: false });
    this.eventListeners.set(event, listeners);
    return this;
  }

  once(event: BotEvent, callback: BotEventCallback): this {
    const listeners = this.eventListeners.get(event) ?? [];
    listeners.push({ callback, once: true });
    this.eventListeners.set(event, listeners);
    return this;
  }

  off(event: BotEvent, callback: BotEventCallback): this {
    const listeners = this.eventListeners.get(event);
    if (!listeners) {
      return this;
    }

    this.eventListeners.set(
      event,
      listeners.filter((listener) => listener.callback !== callback),
    );
    return this;
  }

  onText(
    pattern: RegExp,
    callback: (message: Message, match: RegExpExecArray) => Promise<void> | void,
  ): this {
    this.textListeners.push({ pattern, callback, once: false });
    return this;
  }

  offText(
    pattern: RegExp,
    callback: (message: Message, match: RegExpExecArray) => Promise<void> | void,
  ): this {
    const patternSource = pattern.toString();
    for (let index = this.textListeners.length - 1; index >= 0; index -= 1) {
      const listener = this.textListeners[index];
      if (listener.pattern.toString() === patternSource && listener.callback === callback) {
        this.textListeners.splice(index, 1);
      }
    }
    return this;
  }

  command(command: string, callback: CommandCallback): this {
    const normalized = normalizeCommand(command);
    if (!normalized) {
      throw new Error("Command name must not be empty");
    }

    this.commandListeners.push({
      command: normalized,
      callback,
    });
    return this;
  }

  onError(callback: BotErrorHandler): this {
    this.errorHandlers.push(callback);
    return this;
  }

  async processUpdate(update: Update | JsonObject): Promise<void> {
    const normalizedUpdate = update instanceof Update ? update : Update.fromApi(update, this);
    if (!normalizedUpdate?.message) {
      if (!(update instanceof Update)) {
        await this.reportError(new Error("Unable to parse incoming update payload"), {
          kind: "payload_parse",
          source: "event_dispatch",
        });
      }
      return;
    }

    if (typeof normalizedUpdate.updateId === "number") {
      this.nextUpdateOffset = normalizedUpdate.updateId + 1;
    }

    const metadata: EventMetadata = {
      update: normalizedUpdate,
      command: normalizedUpdate.command,
    };
    for (const eventType of normalizedUpdate.eventTypes) {
      const listeners = [...(this.eventListeners.get(eventType as BotEvent) ?? [])];
      for (const listener of listeners) {
        try {
          await listener.callback(normalizedUpdate.message, metadata);
        } catch (error) {
          await this.reportError(error, {
            kind: "listener_user_code",
            source: "event_dispatch",
            update: normalizedUpdate,
            event: eventType as BotEvent,
            command: normalizedUpdate.command,
          });
        } finally {
          if (listener.once) {
            this.off(eventType as BotEvent, listener.callback);
          }
        }
      }
    }

    if (normalizedUpdate.message.text) {
      for (const listener of [...this.textListeners]) {
        const match = createRegexMatcher(listener.pattern).exec(normalizedUpdate.message.text);
        if (match) {
          try {
            await listener.callback(normalizedUpdate.message, match);
          } catch (error) {
            await this.reportError(error, {
              kind: "listener_user_code",
              source: "text_listener",
              update: normalizedUpdate,
              command: normalizedUpdate.command,
            });
          } finally {
            if (listener.once) {
              this.offText(listener.pattern, listener.callback);
            }
          }
        }
      }
    }

    if (normalizedUpdate.command) {
      for (const listener of this.commandListeners) {
        if (listener.command !== normalizedUpdate.command.name.toLowerCase()) {
          continue;
        }
        try {
          await listener.callback(normalizedUpdate.message, {
            command: normalizedUpdate.command,
            update: normalizedUpdate,
          });
        } catch (error) {
          await this.reportError(error, {
            kind: "listener_user_code",
            source: "command_listener",
            update: normalizedUpdate,
            command: normalizedUpdate.command,
            event: "command",
          });
        }
      }
    }
  }

  startPolling(options: PollingOptions = {}): Promise<void> {
    if (this.pollingTask) {
      return this.pollingTask;
    }

    this.pollingState = "starting";
    this.pollingAbortController = new AbortController();
    this.pollingTask = this.runPolling(options).finally(() => {
      this.pollingState = "idle";
      this.pollingTask = undefined;
      this.pollingAbortController = undefined;
    });

    return this.pollingTask;
  }

  stopPolling(): void {
    if (this.pollingState === "idle") {
      return;
    }
    this.pollingState = "stopping";
    this.pollingAbortController?.abort();
  }

  isPolling(): boolean {
    return this.pollingState !== "idle";
  }

  getPollingState(): PollingState {
    return this.pollingState;
  }

  async setWebHook(
    url: string,
    options?: { secret_token?: string; drop_pending_updates?: boolean; requestOptions?: RequestOptions },
  ): Promise<WebhookResult | undefined> {
    return this.setWebhook(url, options?.secret_token ?? "", {
      dropPendingUpdates: options?.drop_pending_updates,
      requestOptions: options?.requestOptions,
    });
  }

  async deleteWebHook(options?: { drop_pending_updates?: boolean; requestOptions?: RequestOptions }): Promise<boolean> {
    return this.deleteWebhook({
      dropPendingUpdates: options?.drop_pending_updates,
      requestOptions: options?.requestOptions,
    });
  }

  async getWebHookInfo(options?: RequestOptions): Promise<WebhookInfo | undefined> {
    return this.getWebhookInfo(options);
  }

  get cachedUser(): User | undefined {
    return this.botUser;
  }

  getAdminId(): string | undefined {
    return this.adminId || undefined;
  }

  isAdmin(userId?: string): boolean {
    if (!userId || !this.adminId) {
      return false;
    }
    return userId === this.adminId;
  }

  private async reportError(
    error: unknown,
    context: BotErrorContext,
    overrideHandler?: BotErrorHandler,
  ): Promise<void> {
    this.logger.error(t("app.pollingFetchError"), error, context);

    const handlers = [
      ...(overrideHandler ? [overrideHandler] : []),
      ...this.errorHandlers,
    ];
    for (const handler of handlers) {
      try {
        await handler(error, context);
      } catch (handlerError) {
        this.logger.error("Unhandled error from bot onError callback", handlerError, context);
      }
    }
  }

  private async runPolling(options: PollingOptions): Promise<void> {
    const timeoutSeconds = options.timeoutSeconds ?? DEFAULT_POLL_TIMEOUT_SECONDS;
    const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
    const errorHandler = options.onError;

    await this.initialize();
    if (this.pollingState === "stopping") {
      return;
    }
    this.pollingState = "running";

    try {
      while (this.pollingState === "running") {
        try {
          const updates = await this.getUpdates({
            timeout: timeoutSeconds,
            offset: this.nextUpdateOffset,
            allowedUpdates: options.allowedUpdates,
          }, {
            ...options.requestOptions,
            signal: this.pollingAbortController?.signal,
            timeoutProfile: options.requestOptions?.timeoutProfile ?? "long_poll",
          });

          if (updates.length > 0) {
            for (const update of updates) {
              if (options.onUpdate) {
                try {
                  await options.onUpdate(update);
                } catch (error) {
                  await this.reportError(
                    error,
                    {
                      kind: "listener_user_code",
                      source: "polling",
                      update,
                    },
                    errorHandler,
                  );
                }
              }
              await this.processUpdate(update);
              if (this.pollingState !== "running") {
                break;
              }
            }
            continue;
          }
        } catch (error) {
          if (!(error instanceof TimedOut) && this.pollingState === "running") {
            await this.reportError(
              error,
              {
                kind: "request_temporary",
                source: "polling",
              },
              errorHandler,
            );
          }
        }

        if (this.pollingState !== "running") {
          break;
        }
        await sleepWithAbort(retryDelayMs, this.pollingAbortController?.signal);
      }
    } finally {
      await this.shutdown();
    }
  }

  private async sendMessageLike(
    endpoint: string,
    data: RequestPayload,
    options?: RequestOptions,
  ): Promise<Message> {
    const result = await this.post(endpoint, data, options);
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

function normalizeCommand(command: string): string {
  const normalized = command.trim().replace(/^\//, "");
  return normalized.toLowerCase();
}

const defaultLogger: BotLogger = {
  error(message: string, error: unknown): void {
    console.error(message, error);
  },
};

async function sleepWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  if (!signal) {
    await sleep(ms);
    return;
  }
  if (signal.aborted) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
      resolve();
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toFileInfo(value: JsonObject | undefined): FileInfo | undefined {
  if (!value) {
    return undefined;
  }

  const fileId = value.file_id;
  if (typeof fileId !== "string") {
    return undefined;
  }

  return {
    fileId,
    filePath: typeof value.file_path === "string" ? value.file_path : undefined,
    fileSize: typeof value.file_size === "number" ? value.file_size : undefined,
    raw: value,
  };
}
