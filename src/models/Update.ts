import type { Bot } from "../core/Bot";
import type { JsonObject } from "../types";
import { Message } from "./Message";
import { User } from "./User";

export class Update {
  constructor(
    public readonly message?: Message,
    public readonly raw?: JsonObject,
  ) {}

  get effectiveUser(): User | undefined {
    return this.message?.fromUser;
  }

  static fromApi(data?: JsonObject, bot?: Bot): Update | undefined {
    if (!data) {
      return undefined;
    }

    return new Update(Message.fromApi(asJsonObject(data.message), bot), data);
  }
}

function asJsonObject(value: unknown): JsonObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as JsonObject;
}
