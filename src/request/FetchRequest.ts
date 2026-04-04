import { TimedOut, NetworkError } from "../errors";
import type { RequestOptions } from "../types";
import { BaseRequest, type RequestPayload, type TransportResponse } from "./BaseRequest";

export interface FetchRequestConfig {
  readTimeout?: number;
}

export class FetchRequest extends BaseRequest {
  readonly readTimeout?: number;

  constructor(private readonly config: FetchRequestConfig = {}) {
    super();
    this.readTimeout = config.readTimeout ?? 5000;
  }

  async initialize(): Promise<void> {}

  async shutdown(): Promise<void> {}

  protected async doRequest(
    url: string,
    method: "GET" | "POST",
    data?: RequestPayload,
    options?: RequestOptions,
  ): Promise<TransportResponse> {
    const timeoutMs = this.resolveTimeout(options);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "zalo-bot-js",
        },
        body: method === "POST" ? JSON.stringify(this.compactPayload(data)) : undefined,
        signal: controller.signal,
      });

      return {
        status: response.status,
        body: await response.text(),
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimedOut();
      }
      throw new NetworkError(`fetch.${error instanceof Error ? error.message : String(error)}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private resolveTimeout(options?: RequestOptions): number {
    const readTimeoutSeconds = options?.readTimeout;

    if (typeof readTimeoutSeconds === "number" && Number.isFinite(readTimeoutSeconds)) {
      return Math.max(readTimeoutSeconds, 0) * 1000;
    }

    return this.readTimeout ?? 5000;
  }

  private compactPayload(data?: RequestPayload): Record<string, string | number | boolean> {
    if (!data) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined && value !== null),
    ) as Record<string, string | number | boolean>;
  }
}
