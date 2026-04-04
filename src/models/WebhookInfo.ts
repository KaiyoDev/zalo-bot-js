import type { JsonObject } from "../types";

export class WebhookInfo {
  constructor(
    public readonly url: string,
    public readonly updatedAt?: string,
    public readonly raw?: JsonObject,
  ) {}

  static fromApi(data?: JsonObject): WebhookInfo | undefined {
    if (!data || typeof data.url !== "string") {
      return undefined;
    }

    return new WebhookInfo(
      data.url,
      typeof data.updated_at === "string" ? data.updated_at : undefined,
      data,
    );
  }
}
