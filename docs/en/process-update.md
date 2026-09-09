# processUpdate

This page describes the `processUpdate()` function in `zalo-bot-js`, used to feed an update into the SDK event pipeline.

It is the core function for webhook-based flows: your HTTP server receives the payload, then passes it to `processUpdate()` so the SDK can parse it and emit the matching listeners.

## Function signature

```ts
processUpdate(update: Update | JsonObject): Promise<void>
```

## What this function does

When called, the SDK will:

1. detect the payload format (webhook or legacy polling)
2. parse the payload into `Update` if needed
3. ignore updates without `message`
4. update `nextUpdateOffset` when `updateId` exists
5. emit listeners for each derived `eventType`
6. run all listeners registered with `onText()`

## Webhook payload format

Zalo sends webhook payloads in this format:

```json
{
  "ok": true,
  "result": {
    "event_name": "message.text.received",
    "message": {
      "from": {
        "id": "user-id",
        "display_name": "User Name",
        "is_bot": false
      },
      "chat": {
        "id": "chat-id",
        "chat_type": "PRIVATE"
      },
      "text": "Hello",
      "message_id": "msg-id",
      "date": 1750316131602
    }
  }
}
```

Supported event types:

| `event_name` | Description |
|---|---|
| `message.text.received` | Text message received |
| `message.image.received` | Image message received |
| `message.sticker.received` | Sticker message received |
| `message.voice.received` | Voice message received |
| `message.unsupported.received` | Unsupported message type |

## Example

```ts
await bot.processUpdate(payload);
```

## Webhook example

```ts
import { createServer } from "node:http";
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });
const WEBHOOK_SECRET = process.env.ZALO_WEBHOOK_SECRET!;

bot.on("text", async (message) => {
  await bot.sendMessage(message.chat.id, "Đã nhận update từ webhook.");
});

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.statusCode = 404;
    res.end("not found");
    return;
  }

  // Verify secret token
  const secretToken = req.headers["x-bot-api-secret-token"];
  if (secretToken !== WEBHOOK_SECRET) {
    res.statusCode = 403;
    res.end("unauthorized");
    return;
  }

  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }

  const payload = JSON.parse(body);
  await bot.processUpdate(payload);

  res.statusCode = 200;
  res.end("ok");
});

server.listen(3000);
```

## Practical notes

- updates without `message` are ignored
- if you use `startPolling()`, the SDK calls `processUpdate()` internally
- always verify `X-Bot-Api-Secret-Token` header before processing
- the SDK handles both old polling format and new webhook format automatically

## Next

- See [setWebhook](./set-webhook.md) to configure webhook delivery.
- See [on](./on.md) and [onText](./on-text.md) to handle parsed updates.

Last updated: September 11, 2026
