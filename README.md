# zalo-bot-js

TypeScript SDK for the Zalo Bot API, ported from the reference package in `python_zalo_bot`.

## Current architecture

- `src/request`: HTTP transport and API error mapping
- `src/models`: `User`, `Chat`, `Message`, `Update`, `WebhookInfo`
- `src/core`: `Bot`, `Application`, `ApplicationBuilder`, `CallbackContext`
- `src/handlers`: command and message handlers
- `src/filters`: composable update filters
- `examples`: polling and webhook usage

## Scope of this first port

Included:
- Bot token validation through `getMe`
- Long polling with `Application.runPolling()`
- Sending text, photo, sticker, and chat action messages
- Webhook registration helpers
- Filter-based message routing

Not included yet:
- Multipart media upload abstractions
- Worker queue and updater patterns from the Python package
- Framework-specific webhook server integrations inside the SDK core

## Quick example

```ts
import {
  ApplicationBuilder,
  CommandHandler,
  MessageHandler,
  filters,
} from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update) => {
  await update.message?.replyText("Hello from zalo-bot-js");
}));

app.addHandler(
  new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (update) => {
    await update.message?.replyText(`Echo: ${update.message?.text ?? ""}`);
  }),
);

void app.runPolling();
```

## Development

- `npm run build`: compile TypeScript into `dist/`
- `npm run check`: type-check without emitting files
- `npm run test:hello-bot`: polling bot test, reply `/start` va `hello`
- `npm run test:token`: load `ZALO_BOT_TOKEN` from `.env` and call `getMe()`
- `npm test`: currently aliases `npm run check`

Create `.env` from `.env.example` before running the token check.