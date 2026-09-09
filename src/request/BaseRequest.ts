import {
  BadRequest,
  ChatMigrated,
  Conflict,
  Forbidden,
  InvalidToken,
  NetworkError,
  RetryAfter,
  TimedOut,
  ZaloError,
} from "../errors";
import type {
  JsonObject,
  RequestAttemptContext,
  RequestOptions,
  RequestResponseContext,
  RetryErrorKind,
  RetryPolicy,
} from "../types";

export interface RequestPayload {
  [key: string]: string | number | boolean | null | undefined | unknown;
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
    const retryPolicy = resolveRetryPolicy(options?.retryPolicy);
    let attempt = 1;

    while (attempt <= retryPolicy.maxAttempts) {
      const start = Date.now();
      const attemptContext: RequestAttemptContext = {
        url,
        method,
        data: data as Record<string, unknown> | undefined,
        attempt,
      };
      await options?.hooks?.beforeRequest?.(attemptContext);

      let response: TransportResponse | undefined;
      let error: unknown;

      try {
        response = await this.doRequest(url, method, data, options);
        if (response.status >= 200 && response.status <= 299) {
          await this.callAfterResponseHook(options, {
            ...attemptContext,
            durationMs: Date.now() - start,
            responseStatus: response.status,
            responseBody: response.body,
          });
          return response;
        }

        error = this.mapErrorFromResponse(response);
      } catch (caught) {
        error = this.normalizeRequestError(caught);
      }

      await this.callAfterResponseHook(options, {
        ...attemptContext,
        durationMs: Date.now() - start,
        responseStatus: response?.status,
        responseBody: response?.body,
        error,
      });

      if (!this.shouldRetry(error, retryPolicy, options?.signal) || attempt >= retryPolicy.maxAttempts) {
        throw error;
      }

      await sleep(this.computeRetryDelayMs(attempt, retryPolicy), options?.signal);
      attempt += 1;
    }

    throw new NetworkError("Request retry loop exhausted unexpectedly");
  }

  protected parseJsonPayload(payload: string): JsonObject {
    try {
      return JSON.parse(payload) as JsonObject;
    } catch (error) {
      throw new ZaloError(`Invalid server response: ${String(error)}`);
    }
  }

  private mapErrorFromResponse(response: TransportResponse): ZaloError {
    const payload = this.parseJsonPayload(response.body);
    const description = String(payload.description ?? "Unknown HTTP error");
    const parameters = payload.parameters as JsonObject | undefined;

    if (parameters?.migrate_to_chat_id && typeof parameters.migrate_to_chat_id === "number") {
      return new ChatMigrated(parameters.migrate_to_chat_id);
    }

    if (parameters?.retry_after && typeof parameters.retry_after === "number") {
      return new RetryAfter(parameters.retry_after);
    }

    if (response.status === 403) {
      return new Forbidden(description);
    }

    if (response.status === 401 || response.status === 404) {
      return new InvalidToken(description);
    }

    if (response.status === 400) {
      return new BadRequest(description);
    }

    if (response.status === 409) {
      return new Conflict(description);
    }

    return new NetworkError(`${description} (${response.status})`);
  }

  private normalizeRequestError(error: unknown): ZaloError {
    if (error instanceof ZaloError) {
      return error;
    }
    return new NetworkError(`Unknown error in HTTP implementation: ${String(error)}`);
  }

  private shouldRetry(error: unknown, policy: Required<RetryPolicy>, signal?: AbortSignal): boolean {
    if (signal?.aborted) {
      return false;
    }

    const kind = toRetryErrorKind(error);
    return policy.retryOn.includes(kind);
  }

  private computeRetryDelayMs(attempt: number, policy: Required<RetryPolicy>): number {
    const base = policy.baseDelayMs * 2 ** Math.max(attempt - 1, 0);
    const bounded = Math.min(policy.maxDelayMs, base);
    if (policy.jitterRatio <= 0) {
      return bounded;
    }

    const min = Math.max(0, bounded * (1 - policy.jitterRatio));
    const max = bounded * (1 + policy.jitterRatio);
    return Math.floor(min + Math.random() * (max - min));
  }

  private async callAfterResponseHook(
    options: RequestOptions | undefined,
    context: RequestResponseContext,
  ): Promise<void> {
    await options?.hooks?.afterResponse?.(context);
  }
}

function resolveRetryPolicy(policy?: RetryPolicy): Required<RetryPolicy> {
  return {
    maxAttempts: Math.max(1, policy?.maxAttempts ?? 1),
    baseDelayMs: Math.max(0, policy?.baseDelayMs ?? 250),
    maxDelayMs: Math.max(0, policy?.maxDelayMs ?? 3000),
    jitterRatio: Math.max(0, Math.min(1, policy?.jitterRatio ?? 0.2)),
    retryOn: policy?.retryOn ?? ["timed_out", "network_error", "conflict", "retry_after"],
  };
}

function toRetryErrorKind(error: unknown): RetryErrorKind {
  if (error instanceof TimedOut) {
    return "timed_out";
  }
  if (error instanceof RetryAfter) {
    return "retry_after";
  }
  if (error instanceof Conflict) {
    return "conflict";
  }
  if (error instanceof BadRequest) {
    return "bad_request";
  }
  if (error instanceof Forbidden) {
    return "forbidden";
  }
  if (error instanceof InvalidToken) {
    return "invalid_token";
  }
  if (error instanceof NetworkError) {
    return "network_error";
  }
  return "zalo_error";
}

async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0 || signal?.aborted) {
    return;
  }
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbort);
      resolve();
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
