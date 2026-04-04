import type { JsonObject } from "../types";

export class Chat {
  constructor(
    public readonly id: string,
    public readonly type?: string,
    public readonly raw?: JsonObject,
  ) {}

  static fromApi(data?: JsonObject): Chat | undefined {
    if (!data || typeof data.id !== "string") {
      return undefined;
    }

    return new Chat(
      data.id,
      typeof data.chat_type === "string" ? data.chat_type : undefined,
      data,
    );
  }
}
