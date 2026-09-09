# sendMessage

This page describes the `sendMessage()` function in `zalo-bot-js`, used to send a text message to a user or chat through the SDK.

If your bot needs to reply to incoming text, send notifications, or return workflow results, this is one of the most commonly used functions.

## Function signature

```ts
sendMessage(
  chatId: string,
  text: string,
  options?: SendMessageOptions,
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
| `text` | `string` | Yes | Text message content (1–2000 characters) |
| `options.reply_to_message_id` | `string` | No | Message ID to reply to |
| `options.parse_mode` | `ParseMode` | No | Enable rich text formatting: `"markdown"` or `"html"` |
| `options.text_styles` | `TextStyleRun[]` | No | Direct style runs applied to raw text |

## Rich text formatting

Bot supports two ways to send formatted messages:

### Option 1: `parse_mode`

Set `parse_mode` to `"markdown"` or `"html"` and write formatted content directly in `text`. The server parses markup and applies formatting.

**Markdown:**

```ts
await bot.sendMessage(chatId, "**Xin chào** _bạn_, đây là tin nhắn **đậm** và *nghiêng*", {
  parse_mode: "markdown",
});
```

Supported Markdown syntax:

| Syntax | Result |
|---|---|
| `**đậm**`, `__đậm__` | Bold |
| `*nghiêng*`, `_nghiêng_` | Italic |
| `***đậm nghiêng***` | Bold + italic |
| `~~gạch~~` | Strikethrough |
| `` `code` `` | Monospace |
| `{red}…{/red}` | Colored text |
| `{big}…{/big}` | Large text |

**HTML:**

```ts
await bot.sendMessage(chatId, "<b>Xin chào</b> <i>bạn</i>", {
  parse_mode: "html",
});
```

Supported HTML tags: `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<s>`, `<del>`, `<h1>`–`<h6>`, `<ul>`, `<ol>`, `<li>`, `<p>`, `<div>`, `style="..."`.

### Option 2: `text_styles`

Apply style runs directly to raw text. Each run specifies a range and formatting codes.

```ts
await bot.sendMessage(chatId, "Xin chào bạn", {
  text_styles: [
    { start: 0, len: 7, st: ["b", "c_db342e"] }, // bold + red
    { start: 8, len: 4, st: ["i"] },             // italic
  ],
});
```

Supported style codes (`st`):

| Code | Meaning |
|---|---|
| `b` | Bold |
| `i` | Italic |
| `u` | Underline |
| `s` | Strikethrough |
| `f_13`, `f_15`, `f_18`, `f_20` | Font size (small / normal / large / x-large) |
| `c_050a19` | Default color |
| `c_15a85f` | Green |
| `c_f7b503` | Yellow |
| `c_f27806` | Orange |
| `c_db342e` | Red |
| `lst_1` | Bullet list |
| `lst_2` | Numbered list |
| `ind_1`–`ind_5` | Indentation levels |

### Priority

If both `parse_mode` and `text_styles` are provided, `parse_mode` takes precedence and `text_styles` is ignored. They use different coordinate systems and cannot be combined.

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

## Example with markdown

```ts
await bot.sendMessage(chatId, "**Bold** and *italic* text", {
  parse_mode: "markdown",
});
```

## Example with text_styles

```ts
await bot.sendMessage(chatId, "Colored text", {
  text_styles: [
    { start: 0, len: 7, st: ["b", "c_f27806"] }, // bold orange
  ],
});
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
- text length must be between 1 and 2000 characters
- `parse_mode` and `text_styles` are mutually exclusive; `parse_mode` wins if both are set

## Next

- See [replyText](./reply-text.md) for the message helper version.
- See [sendPhoto](./send-photo.md) if you want to send images instead of plain text.

Last updated: September 7, 2026
