import type { Bot } from "../core/Bot";
import type { JsonObject } from "../types";
import { Message } from "./Message";
import { User } from "./User";

export interface ParsedCommand {
  name: string;
  argsRaw: string;
  args: string[];
}

export interface WebhookEventResult {
  eventName: string;
  message?: JsonObject;
}

export interface WebhookPayload {
  ok: boolean;
  result: WebhookEventResult;
}

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
      if (this.command) {
        eventTypes.add("command");
      }
    }

    if (this.message?.photoUrl) {
      eventTypes.add("photo");
    }

    if (this.message?.sticker) {
      eventTypes.add("sticker");
    }

    if (this.message?.voiceUrl) {
      eventTypes.add("voice");
    }

    return [...eventTypes];
  }

  hasEventType(eventType: string): boolean {
    return this.eventTypes.includes(eventType);
  }

  get command(): ParsedCommand | undefined {
    return parseCommand(this.message?.text);
  }

  static fromApi(data?: JsonObject, bot?: Bot): Update | undefined {
    if (!data) {
      return undefined;
    }

    // Handle new Zalo webhook format: { ok: true, result: { event_name, message } }
    const rawData = data as Record<string, unknown>;
    if (rawData.ok === true && rawData.result && typeof rawData.result === "object") {
      const result = rawData.result as Record<string, unknown>;
      const messageData = result.message as JsonObject | undefined;
      if (messageData) {
        return new Update(undefined, Message.fromApi(messageData, bot), data);
      }
    }

    // Handle legacy polling format: { update_id, message }
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

export function parseCommand(text: string | undefined): ParsedCommand | undefined {
  if (!text) {
    return undefined;
  }

  const normalized = text.trim();
  if (!normalized.startsWith("/") || normalized.length <= 1) {
    return undefined;
  }

  const body = normalized.slice(1);
  const [rawName, ...rest] = body.split(/\s+/);
  const name = rawName.trim();
  if (!name) {
    return undefined;
  }

  const argsRaw = rest.join(" ").trim();
  return {
    name,
    argsRaw,
    args: argsRaw ? argsRaw.split(/\s+/) : [],
  };
}
