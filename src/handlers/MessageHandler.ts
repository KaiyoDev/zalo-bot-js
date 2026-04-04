import { CallbackContext } from "../core/Context";
import type { Application } from "../core/Application";
import type { Filter } from "../filters";
import type { Update } from "../models/Update";
import type { Handler, HandlerCallback } from "./BaseHandler";

export class MessageHandler implements Handler {
  constructor(
    private readonly filter: Filter,
    private readonly callback: HandlerCallback,
  ) {}

  checkUpdate(update: Update): boolean {
    return Boolean(update.message && this.filter(update));
  }

  async handleUpdate(update: Update, application: Application): Promise<void> {
    await this.callback(update, new CallbackContext(application));
  }
}
