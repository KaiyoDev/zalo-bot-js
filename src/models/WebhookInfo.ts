import type { JsonObject } from "../types";

export interface WebhookVerificationResult {
  ok: boolean;
  url: string;
  outcome: string;
  hint?: string;
}

export interface WebhookResult {
  url: string;
  updatedAt?: number;
  verification?: WebhookVerificationResult;
  raw?: JsonObject;
}

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

export class WebhookResultModel {
  constructor(
    public readonly url: string,
    public readonly updatedAt?: number,
    public readonly verification?: WebhookVerificationResult,
    public readonly raw?: JsonObject,
  ) {}

  static fromApi(data?: JsonObject): WebhookResultModel | undefined {
    if (!data || typeof data.url !== "string") {
      return undefined;
    }

    const verificationRaw = data.verification as JsonObject | undefined;
    const verification: WebhookVerificationResult | undefined = verificationRaw
      ? {
          ok: typeof verificationRaw.ok === "boolean" ? verificationRaw.ok : false,
          url: typeof verificationRaw.url === "string" ? verificationRaw.url : data.url,
          outcome: typeof verificationRaw.outcome === "string" ? verificationRaw.outcome : "",
          hint: typeof verificationRaw.hint === "string" ? verificationRaw.hint : undefined,
        }
      : undefined;

    return new WebhookResultModel(
      data.url,
      typeof data.updated_at === "number" ? data.updated_at : undefined,
      verification,
      data,
    );
  }
}
