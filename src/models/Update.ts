import type { Bot } from "../core/Bot";
import type { JsonObject } from "../types";
import { Message } from "./Message";
import { User } from "./User";

export class Update {
  constructor(
    public readonly updateId?: number,
    public readonly message?: Message,
    public readonly raw?: JsonObject,
  ) {}

  get effectiveUser(): User | undefined {
    return this.message?.fromUser;
  }

  get eventTypes(): string[] {
    const eventTypes = new Set<string>();

    if (this.message) {
      eventTypes.add("message");
    }

    if (this.message?.text) {
      eventTypes.add("text");
      if (this.message.text.trim().startsWith("/")) {
        eventTypes.add("command");
      }
    }

    if (this.message?.photoUrl) {
      eventTypes.add("photo");
    }

    if (this.message?.sticker) {
      eventTypes.add("sticker");
    }

    return [...eventTypes];
  }

  hasEventType(eventType: string): boolean {
    return this.eventTypes.includes(eventType);
  }

  static fromApi(data?: JsonObject, bot?: Bot): Update | undefined {
    if (!data) {
      return undefined;
    }

    const updateId =
      typeof data.update_id === "number"
        ? data.update_id
        : typeof data.update_id === "string"
          ? Number.parseInt(data.update_id, 10)
          : undefined;

    return new Update(updateId, Message.fromApi(asJsonObject(data.message), bot), data);
  }
}

function asJsonObject(value: unknown): JsonObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as JsonObject;
}
