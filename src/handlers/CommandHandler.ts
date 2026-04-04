import { CallbackContext } from "../core/Context";
import type { Application } from "../core/Application";
import type { Update } from "../models/Update";
import type { Handler, HandlerCallback } from "./BaseHandler";

export class CommandHandler implements Handler {
  constructor(
    private readonly command: string,
    private readonly callback: HandlerCallback,
  ) {}

  checkUpdate(update: Update): boolean {
    const text = update.message?.text?.trim();
    if (!text) {
      return false;
    }

    return text.split(/\s+/)[0] === `/${this.command}`;
  }

  async handleUpdate(update: Update, application: Application): Promise<void> {
    const args = update.message?.text?.trim().split(/\s+/).slice(1) ?? [];
    await this.callback(update, new CallbackContext(application, args));
  }
}
