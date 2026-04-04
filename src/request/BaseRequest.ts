import {
  BadRequest,
  ChatMigrated,
  Conflict,
  Forbidden,
  InvalidToken,
  NetworkError,
  RetryAfter,
  ZaloError,
} from "../errors";
import type { JsonObject, RequestOptions } from "../types";

export interface RequestPayload {
  [key: string]: string | number | boolean | null | undefined;
}

export interface TransportResponse {
  status: number;
  body: string;
}

export abstract class BaseRequest {
  abstract readonly readTimeout?: number;

  abstract initialize(): Promise<void>;

  abstract shutdown(): Promise<void>;

  protected abstract doRequest(
    url: string,
    method: "GET" | "POST",
    data?: RequestPayload,
    options?: RequestOptions,
  ): Promise<TransportResponse>;

  async post(
    url: string,
    data?: RequestPayload,
    options?: RequestOptions,
  ): Promise<JsonObject | JsonObject[] | boolean | undefined> {
    const response = await this.requestWrapper(url, "POST", data, options);
    const json = this.parseJsonPayload(response.body);
    return json.result as JsonObject | JsonObject[] | boolean | undefined;
  }

  protected async requestWrapper(
    url: string,
    method: "GET" | "POST",
    data?: RequestPayload,
    options?: RequestOptions,
  ): Promise<TransportResponse> {
    let response: TransportResponse;

    try {
      response = await this.doRequest(url, method, data, options);
    } catch (error) {
      if (error instanceof ZaloError) {
        throw error;
      }
      throw new NetworkError(`Unknown error in HTTP implementation: ${String(error)}`);
    }

    if (response.status >= 200 && response.status <= 299) {
      return response;
    }

    const payload = this.parseJsonPayload(response.body);
    const description = String(payload.description ?? "Unknown HTTP error");
    const parameters = payload.parameters as JsonObject | undefined;

    if (parameters?.migrate_to_chat_id && typeof parameters.migrate_to_chat_id === "number") {
      throw new ChatMigrated(parameters.migrate_to_chat_id);
    }

    if (parameters?.retry_after && typeof parameters.retry_after === "number") {
      throw new RetryAfter(parameters.retry_after);
    }

    if (response.status === 403) {
      throw new Forbidden(description);
    }

    if (response.status === 401 || response.status === 404) {
      throw new InvalidToken(description);
    }

    if (response.status === 400) {
      throw new BadRequest(description);
    }

    if (response.status === 409) {
      throw new Conflict(description);
    }

    throw new NetworkError(`${description} (${response.status})`);
  }

  protected parseJsonPayload(payload: string): JsonObject {
    try {
      return JSON.parse(payload) as JsonObject;
    } catch (error) {
      throw new ZaloError(`Invalid server response: ${String(error)}`);
    }
  }
}
