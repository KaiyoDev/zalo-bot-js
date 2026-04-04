import type { Bot } from "../core/Bot";
import type { JsonObject } from "../types";
import { Chat } from "./Chat";
import { User } from "./User";

export interface MessageInit {
  bot?: Bot;
  messageId: string;
  date: Date;
  chat: Chat;
  messageType?: string;
  text?: string;
  sticker?: string;
  photoUrl?: string;
  fromUser?: User;
  raw?: JsonObject;
}

export class Message {
  readonly bot?: Bot;
  readonly messageId: string;
  readonly date: Date;
  readonly chat: Chat;
  readonly messageType: string;
  readonly text?: string;
  readonly sticker?: string;
  readonly photoUrl?: string;
  readonly fromUser?: User;
  readonly raw?: JsonObject;

  constructor(init: MessageInit) {
    this.bot = init.bot;
    this.messageId = init.messageId;
    this.date = init.date;
    this.chat = init.chat;
    this.messageType = init.messageType ?? "CHAT_MESSAGE";
    this.text = init.text;
    this.sticker = init.sticker;
    this.photoUrl = init.photoUrl;
    this.fromUser = init.fromUser;
    this.raw = init.raw;
  }

  static fromApi(data?: JsonObject, bot?: Bot): Message | undefined {
    if (!data) {
      return undefined;
    }

    const messageId =
      typeof data.message_id === "string"
        ? data.message_id
        : typeof data.message_id === "number"
          ? String(data.message_id)
          : undefined;
    if (!messageId) {
      return undefined;
    }

    const chat = Chat.fromApi(asJsonObject(data.chat));
    if (!chat) {
      return undefined;
    }

    const timestamp = typeof data.date === "number" ? data.date : Date.now();

    return new Message({
      bot,
      messageId,
      date: new Date(timestamp),
      chat,
      messageType: typeof data.message_type === "string" ? data.message_type : undefined,
      text: typeof data.text === "string" ? data.text : undefined,
      sticker: typeof data.sticker === "string" ? data.sticker : undefined,
      photoUrl: typeof data.photo_url === "string" ? data.photo_url : undefined,
      fromUser: User.fromApi(asJsonObject(data.from)),
      raw: data,
    });
  }

  replyText(text: string): Promise<Message> {
    return this.requireBot().sendMessage(this.chat.id, text);
  }

  replyPhoto(photo: string, caption = ""): Promise<Message> {
    return this.requireBot().sendPhoto(this.chat.id, caption, photo);
  }

  replySticker(sticker: string): Promise<Message> {
    return this.requireBot().sendSticker(this.chat.id, sticker);
  }

  replyAction(action: string): Promise<boolean> {
    return this.requireBot().sendChatAction(this.chat.id, action);
  }

  private requireBot(): Bot {
    if (!this.bot) {
      throw new Error("Message is not bound to a bot instance.");
    }

    return this.bot;
  }
}

function asJsonObject(value: unknown): JsonObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as JsonObject;
}
