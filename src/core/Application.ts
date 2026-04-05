import type { Handler } from "../handlers/BaseHandler";
import type { Update } from "../models/Update";
import type { Bot, PollingOptions } from "./Bot";

export class Application {
  private readonly handlers: Handler[] = [];

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
    await this.bot.startPolling({
      ...options,
      onUpdate: async (update) => {
        await this.processUpdate(update);
      },
    });
  }

  stop(): void {
    this.bot.stopPolling();
  }
}
