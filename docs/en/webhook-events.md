# Zalo Webhook Events

This page documents the webhook event structure that Zalo sends to your bot's webhook URL.

## Overview

When a user interacts with your bot, Zalo sends an HTTP POST request to your webhook URL with a JSON payload.

## Request Details

| Property | Value |
|---|---|
| URL | Your configured webhook URL |
| Method | POST |
| Content-Type | application/json |
| Headers | `X-Bot-Api-Secret-Token: <your-secret-token>` |

> ⚠️ Always verify the `X-Bot-Api-Secret-Token` header before processing the request to ensure it's from Zalo.

## Payload Structure

```json
{
  "ok": true,
  "result": {
    "event_name": "message.text.received",
    "message": {
      "from": { ... },
      "chat": { ... },
      "text": "...",
      "message_id": "...",
      "date": 1750316131602
    }
  }
}
```

## Event Types

| `event_name` | Description |
|---|---|
| `message.text.received` | Text message received |
| `message.image.received` | Image message received |
| `message.sticker.received` | Sticker message received |
| `message.voice.received` | Voice message received |
| `message.unsupported.received` | Unsupported message type (special user groups) |

## Message Fields

### `from` (object)

Information about the sender:

| Field | Type | Description |
|---|---|---|
| `id` | string | User ID |
| `display_name` | string | User's display name |
| `is_bot` | boolean | Whether the sender is a bot |

### `chat` (object)

Information about the conversation:

| Field | Type | Description |
|---|---|---|
| `id` | string | Chat ID |
| `chat_type` | string | `PRIVATE` or `GROUP` |

### Message content fields

| Field | Type | Description |
|---|---|---|
| `text` | string | Text content (for text messages) |
| `photo` | string | Image URL (for image messages) |
| `caption` | string | Caption text (for image messages) |
| `sticker` | string | Sticker ID |
| `voice_url` | string | Audio file URL (for voice messages, `.aac` format) |
| `message_id` | string | Unique message ID |
| `date` | number | Timestamp in milliseconds |

## Message Type Examples

### Text message

```json
{
  "ok": true,
  "result": {
    "event_name": "message.text.received",
    "message": {
      "from": { "id": "user-id", "display_name": "Ted", "is_bot": false },
      "chat": { "id": "chat-id", "chat_type": "PRIVATE" },
      "text": "Xin chào",
      "message_id": "msg-id",
      "date": 1750316131602
    }
  }
}
```

### Image message

```json
{
  "ok": true,
  "result": {
    "event_name": "message.image.received",
    "message": {
      "from": { "id": "user-id", "display_name": "Ted", "is_bot": false },
      "chat": { "id": "chat-id", "chat_type": "PRIVATE" },
      "photo": "https://example.com/image.jpg",
      "caption": "Photo caption",
      "message_id": "msg-id",
      "date": 1750316131602
    }
  }
}
```

### Voice message

```json
{
  "ok": true,
  "result": {
    "event_name": "message.voice.received",
    "message": {
      "from": { "id": "user-id", "display_name": "Ted", "is_bot": false },
      "chat": { "id": "chat-id", "chat_type": "PRIVATE" },
      "voice_url": "https://example.com/audio.aac",
      "message_id": "msg-id",
      "date": 1750316131602
    }
  }
}
```

## Special Notes

- **Unsupported messages**: For certain user groups (children, disabled, illiterate), the system sends `message.unsupported.received` instead of the actual message content to comply with legal regulations.
- **Voice messages**: Only `.aac` format is supported. Voice messages can only be sent in 1-on-1 chats, not groups.
- **Rate limiting**: The `testWebhook()` API is rate-limited per bot per day.

## Debugging

If you're not receiving events:

1. Call `bot.testWebhook()` to diagnose connectivity issues
2. Check that your webhook URL is publicly accessible (not localhost or internal IP)
3. Verify the `X-Bot-Api-Secret-Token` header matches your configured secret
4. Ensure your server responds with `200 OK` quickly

## Next

- See [setWebhook](./set-webhook.md) to configure your webhook URL.
- See [processUpdate](./process-update.md) to handle incoming webhook payloads.
- See [testWebhook](./test-webhook.md) to diagnose webhook issues.

Last updated: September 11, 2026
