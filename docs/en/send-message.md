# sendMessage

This page describes the `sendMessage()` function in `zalo-bot-js`, used to send a text message to a user or chat through the SDK.

If your bot needs to reply to incoming text, send notifications, or return workflow results, this is one of the most commonly used functions.

## Function signature

```ts
sendMessage(
  chatId: string,
  text: string,
  options?: { reply_to_message_id?: string },
): Promise<Message>
```

## When to use it

- reply to an incoming message
- send proactive notifications to a `chat_id`
- return results from bot logic or workflows
- send content from webhook, polling, or internal services

## Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chatId` | `string` | Yes | ID of the target user or chat |
| `text` | `string` | Yes | Text message content |
| `options.reply_to_message_id` | `string` | No | Message ID to reply to |

## Return value

The function returns `Promise<Message>`.

## Minimal example

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

async function main() {
  const chatId = process.env.ZALO_CHAT_ID!;
  const message = await bot.sendMessage(chatId, "Hello!");

  console.log(message.messageId);
}

void main();
```

## Example in polling

```ts
bot.on("text", async (message) => {
  if (!message.text) {
    return;
  }

  await bot.sendMessage(message.chat.id, `You said: ${message.text}`);
});
```

## Example with reply options

```ts
bot.on("text", async (message) => {
  await bot.sendMessage(
    message.chat.id,
    "I received your request.",
    {
      reply_to_message_id: message.messageId,
    },
  );
});
```

## Relationship with `replyText()`

If you already have a `Message`, you can also use `message.replyText()`. Internally, that helper calls `sendMessage()` with the current `chat.id`.

## Practical notes

- `sendMessage()` is the SDK-level API that developers should call directly
- it returns a parsed `Message` model instead of exposing raw transport results

## Next

- See [replyText](./reply-text.md) for the message helper version.
- See [sendPhoto](./send-photo.md) if you want to send images instead of plain text.

Last updated: April 5, 2026
