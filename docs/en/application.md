# Application

This page describes `Application` in `zalo-bot-js`, a handler-based dispatcher class used with `ApplicationBuilder`, `CommandHandler`, and `MessageHandler`.

Different from the event listener API on `Bot`, `Application` allows you to add a list of handlers and let the app choose the first suitable handler for each update.

## Role

`Application` holds:

- a `bot`
- list `handlers`
- dispatch logic updates to the first matching handler

## Main functions

### `addHandler(handler): void`

Add a handler to the handler list.

### `processUpdate(update): Promise<void>`

Iterate through the handlers in order, running the first handler with `checkUpdate(update)` and returns `true`.

### `runPolling(options?): Promise<void>`

Run polling through `bot.startPolling()` and move each update into `Application.processUpdate()`.

### `stop(): void`

Stop current polling by calling `bot.stopPolling()`.

## For example

```ts
import { ApplicationBuilder, CommandHandler } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update) => {
  await update.message?.replyText("Xin chào!");
}));

void app.runPolling();
```

## When should you use it?

- want to organize bots using handlers
- want to apply filter and command parser clearly
- want to coordinate updates according to handler order

## Next

- See [ApplicationBuilder](./application-builder.md) to initialize the app.
- See [MessageHandler](./message-handler.md) and [CommandHandler](./command-handler.md) to add specific handlers.

Last updated: April 5, 2026
