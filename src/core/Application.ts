import { DEFAULT_POLL_TIMEOUT_SECONDS, DEFAULT_RETRY_DELAY_MS } from "../constants";
import { TimedOut } from "../errors";
import type { Handler } from "../handlers/BaseHandler";
import type { Update } from "../models/Update";
import type { Bot } from "./Bot";

export interface PollingOptions {
  timeoutSeconds?: number;
  retryDelayMs?: number;
}

export class Application {
  private readonly handlers: Handler[] = [];
  private running = false;

  constructor(public readonly bot: Bot) {}

  addHandler(handler: Handler): void {
    this.handlers.push(handler);
  }

  async processUpdate(update: Update): Promise<void> {
    for (const handler of this.handlers) {
      if (handler.checkUpdate(update)) {
        await handler.handleUpdate(update, this);
        break;
      }
    }
  }

  async runPolling(options: PollingOptions = {}): Promise<void> {
    const timeoutSeconds = options.timeoutSeconds ?? DEFAULT_POLL_TIMEOUT_SECONDS;
    const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

    await this.bot.initialize();
    this.running = true;

    try {
      while (this.running) {
        try {
          const update = await this.bot.getUpdate({ timeout: timeoutSeconds });
          if (update) {
            await this.processUpdate(update);
            continue;
          }
        } catch (error) {
          // Long polling timeouts are expected when there are no updates.
          if (!(error instanceof TimedOut)) {
            console.error("Error while fetching updates:", error);
          }
        }

        await sleep(retryDelayMs);
      }
    } finally {
      await this.bot.shutdown();
    }
  }

  stop(): void {
    this.running = false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
