# zalo-bot-js

![zalo-bot-js](image/zalo-bot-js.png)

TypeScript SDK for the Zalo Bot API with a practical node-style API: events, regex text handlers, long polling, webhook helpers, and CommonJS-friendly usage.

[Docs public](https://kaiyodev.github.io/zalo-bot-js) | [Tiếng Việt](docs/vi/index.md) | [English docs](docs/en/index.md)

## Features

- `new Bot(token, { polling: true })` or `new Bot({ token, polling: true })`
- `bot.on("message" | "text" | "photo" | "sticker" | "command", callback)`
- `bot.onText(regexp, callback)` for regex-based text handlers
- `bot.startPolling()`, `bot.stopPolling()`, `bot.isPolling()`
- `bot.processUpdate(update)` for webhook flows
- `bot.sendMessage()`, `bot.sendPhoto()`, `bot.sendSticker()`, `bot.sendChatAction()`
- `bot.setWebHook()`, `bot.deleteWebHook()`, `bot.getWebHookInfo()`
- `bot.getMe()` and `bot.getUpdates()`

## Installation

```bash
npm i zalo-bot-js
```

## Environment

```env
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_BOT_LANG=vi
```

`ZALO_BOT_LANG` currently supports `vi` and `en`.

## Quick Start

### CommonJS

```js
const { ZaloBot } = require("zalo-bot-js");
require("dotenv").config();

const bot = new ZaloBot(process.env.ZALO_BOT_TOKEN, {
  polling: true,
});

bot.on("message", async (msg) => {
  console.log("Received message:", msg.text ?? msg.messageId);
});

bot.onText(/\/start (.+)/, async (msg, match) => {
  await bot.sendMessage(msg.chat.id, `Ban vua gui: ${match[1]}`);
});
```

### TypeScript / ESM-style import

```ts
import "dotenv/config";
import { Bot } from "zalo-bot-js";

const bot = new Bot(process.env.ZALO_BOT_TOKEN!, {
  polling: true,
});

bot.on("text", async (msg) => {
  if (msg.text && !msg.text.startsWith("/")) {
    await bot.sendMessage(msg.chat.id, `Ban vua noi: ${msg.text}`);
  }
});

bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  const payload = match[1]?.trim() ?? "ban";
  await bot.sendMessage(msg.chat.id, `Xin chao ${payload}!`);
});
```

## Webhook Example

```ts
import "dotenv/config";
import express from "express";
import { Bot } from "zalo-bot-js";

const app = express();
const secretToken = process.env.ZALO_WEBHOOK_SECRET!;
const bot = new Bot(process.env.ZALO_BOT_TOKEN!, {
  polling: false,
});

app.use(express.json());

bot.on("message", async (msg) => {
  await bot.sendMessage(msg.chat.id, "Xin chao!");
});

app.post("/webhook", async (req, res) => {
  if (req.headers["x-bot-api-secret-token"] !== secretToken) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  await bot.processUpdate(req.body);
  res.sendStatus(200);
});

await bot.setWebHook(process.env.ZALO_WEBHOOK_URL!, {
  secret_token: secretToken,
});
```

## Available API

### Events

- `bot.on(event, callback)`
- `bot.onText(regexp, callback)`

Supported event names today:

- `message`
- `text`
- `photo`
- `sticker`
- `command`

### Sending

- `bot.sendMessage(chatId, text, [options])`
- `bot.sendPhoto(chatId, caption, photo, [options])`
- `bot.sendSticker(chatId, sticker, [options])`
- `bot.sendChatAction(chatId, action, [options])`

### Polling and Webhook

- `bot.startPolling([options])`
- `bot.stopPolling()`
- `bot.isPolling()`
- `bot.processUpdate(update)`
- `bot.setWebHook(url, [options])`
- `bot.deleteWebHook()`
- `bot.getWebHookInfo()`

### Bot Information

- `bot.getMe([options])`
- `bot.getUpdates([options])`

## Project Structure

- `src/request`: transport and API error mapping
- `src/models`: `User`, `Chat`, `Message`, `Update`, `WebhookInfo`
- `src/core`: `Bot`, `Application`, `ApplicationBuilder`, `CallbackContext`
- `src/handlers`: legacy handler-based API
- `src/filters`: composable filters
- `examples`: example integrations
- `test`: local scripts and focused verification

## Development

```bash
npm run check
npm run build
npm test
```

Useful local scripts:

- `npm run test:token`
- `npm run test:hello-bot`
- `npm run test:event-debug`
- `npm run test:bot-api`

## Notes

- The SDK currently focuses on the practical bot core first.
- Multipart media upload is still incomplete.
- Sending multiple images in a single native album-style Zalo message is not implemented.
- `Application` and handler/filter APIs are still exported for backward compatibility.

## License

MIT License. See `package.json` for the current project license metadata.