import type { Bot } from "./Bot";
import type { Application } from "./Application";

export class CallbackContext {
  readonly bot: Bot;
  readonly args: string[];

  constructor(
    public readonly application: Application,
    args: string[] = [],
  ) {
    this.bot = application.bot;
    this.args = args;
  }
}
