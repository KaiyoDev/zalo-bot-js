import { BASE_URL } from "../constants";
import { InvalidToken } from "../errors";
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
}

export class Bot {
  private readonly baseUrl: string;
  private readonly request: [BaseRequest, BaseRequest];
  private initialized = false;
  private botUser?: User;

  constructor(private readonly config: BotConfig) {
    if (!config.token) {
      throw new InvalidToken(
        "You must pass the token you received from https://bot.zapps.vn/docs/create-bot/",
      );
    }

    const rootUrl = config.baseUrl ?? BASE_URL;
    this.baseUrl = `${rootUrl}/bot${config.token}`;
    this.request = [
      config.pollingRequest ?? new FetchRequest(),
      config.request ?? new FetchRequest(),
    ];
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
        throw new InvalidToken(`The token \`${this.config.token}\` was rejected by the server.`);
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
      throw new InvalidToken("Bot API returned an invalid getMe payload.");
    }

    this.botUser = user;
    return user;
  }

  async getUpdate(
    params: {
      offset?: number;
      limit?: number;
      timeout?: number;
      allowedUpdates?: string[];
    } = {},
    options?: RequestOptions,
  ): Promise<Update | undefined> {
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

    return Update.fromApi(asJsonObject(result), this);
  }

  async sendMessage(
    chatId: string,
    text: string,
    replyToMessageId?: string,
  ): Promise<Message> {
    return this.sendMessageLike("sendMessage", {
      chat_id: chatId,
      text,
      reply_to_message_id: replyToMessageId,
    });
  }

  async sendPhoto(
    chatId: string,
    caption: string,
    photo: string,
    replyToMessageId?: string,
  ): Promise<Message> {
    return this.sendMessageLike("sendPhoto", {
      chat_id: chatId,
      caption,
      photo,
      reply_to_message_id: replyToMessageId,
    });
  }

  async sendSticker(
    chatId: string,
    sticker: string,
    replyToMessageId?: string,
  ): Promise<Message> {
    return this.sendMessageLike("sendSticker", {
      chat_id: chatId,
      sticker,
      reply_to_message_id: replyToMessageId,
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

  get cachedUser(): User | undefined {
    return this.botUser;
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
      throw new Error("Bot API returned an invalid message payload without chat_id context.");
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
