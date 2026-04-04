import { Bot, type BotConfig } from "./Bot";
import { Application } from "./Application";

export class ApplicationBuilder {
  private config: Partial<BotConfig> = {};

  token(token: string): this {
    this.config.token = token;
    return this;
  }

  baseUrl(baseUrl: string): this {
    this.config.baseUrl = baseUrl;
    return this;
  }

  build(): Application {
    if (!this.config.token) {
      throw new Error("Token must be set");
    }

    return new Application(new Bot(this.config as BotConfig));
  }
}
