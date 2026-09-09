# sendVoice

This page describes the `sendVoice()` function in `zalo-bot-js`, used to send a voice message (`.aac` audio file) to a user in a 1-on-1 chat.

> ⚠️ **Limitation:** This API only supports sending voice messages to **1-on-1 chats**. It does not support groups. If you pass a group `chat_id`, the request may appear successful but the message will not be delivered.

## Function signature

```ts
sendVoice(
  chatId: string,
  voiceUrl: string,
  options?: SendVoiceOptions,
): Promise<Message>
```

## When to use it

- send an audio/voice message to a user
- reply with an audio file from your server
- deliver voice content in a 1-on-1 conversation

## Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chatId` | `string` | Yes | ID of the recipient (1-on-1 only) |
| `voiceUrl` | `string` | Yes | URL to the audio file (must be `.aac` format) |
| `options.reply_to_message_id` | `string` | No | Message ID to reply to |
| `options.requestOptions` | `RequestOptions` | No | Advanced request options |

## Format requirements

- File format: **.aac** audio only
- No caption or text attached to voice messages
- URL must be publicly accessible

## Return value

Returns `Promise<Message>`.

## Example

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

await bot.sendVoice("user-chat-id", "https://example.com/audio.aac");
```

## Example with reply

```ts
bot.on("text", async (message) => {
  await bot.sendVoice(
    message.chat.id,
    "https://example.com/response.aac",
    {
      reply_to_message_id: message.messageId,
    },
  );
});
```

## Practical notes

- `sendVoice()` only works in 1-on-1 chats
- passing a group `chat_id` may return success but the message won't be delivered
- the audio file must be in `.aac` format
- the `voice_url` must be a valid, publicly accessible HTTPS URL

## Next

- See [sendMessage](./send-message.md) for text messages.
- See [sendPhoto](./send-photo.md) for image messages.
- See [sendSticker](./send-sticker.md) for sticker messages.

Last updated: September 7, 2026
