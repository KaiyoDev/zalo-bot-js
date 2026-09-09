# MessageHandler

This page describes `MessageHandler` in `zalo-bot-js`, a handler used to process updates based on `filters`.

This is the right choice when you want to handle updates by content type such as text, photo, or sticker in the `Application` flow.

## How it works

`MessageHandler` receives:

- a `filter`
- a `callback`

The handler runs when:

- `update.message` exists
- `filter(update)` returns `true`

## Example

```ts
import { ApplicationBuilder, MessageHandler, filters } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new MessageHandler(filters.TEXT, async (update) => {
  await update.message?.replyText("I received a text message.");
}));

void app.runPolling();
```

## Next

- See [filters](./filters.md) for the built-in filters.
- See [Application](./application.md) to understand handler dispatching.

Last updated: April 5, 2026
