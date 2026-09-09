# CommandHandler

This page describes `CommandHandler` in `zalo-bot-js`, a handler used to capture commands with syntax like `/start`.

`CommandHandler` is of the handler-based style and is often used with `Application`.

## How it works

This Handler:

1. read `update.message?.text`
2. separate the first word by space
3. compare with `/${command}`
4. if matched, call callback with `CallbackContext`

## For example

```ts
import { ApplicationBuilder, CommandHandler } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update, ctx) => {
  await update.message?.replyText(`Xin chào ${ctx.args[0] ?? "bạn"}!`);
}));

void app.runPolling();
```

## `CallbackContext`

In the callback, `ctx.args` contains the parameters after command.

Example with text:

```text
/start abc
```

then `ctx.args` would be:

```ts
["abc"]
```

## When should you use it?

- you want to catch the command explicitly with the syntax `/name`
- you are using `Application` instead of `bot.onText()`

## Next

- See [MessageHandler](./message-handler.md) for processing by filter.
- See [CallbackContext](./callback-context.md) to understand received callback data.

Last updated: April 5, 2026
