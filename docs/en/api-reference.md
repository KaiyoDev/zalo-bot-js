# API Reference

This page is the lookup index for the main functions of `zalo-bot-js`. Each important function is separated into its own page so the documentation stays readable, maintainable, and aligned with a per-API structure.

If you are just getting started, read [Getting started](./getting-started.md) first. If you want to look up each function directly, use the list below.

## Bot information and update group

- [initialize](./initialize.md)
- [shutdown](./shutdown.md)
- [cachedUser](./cached-user.md)
- [getMe](./get-me.md)
- [getUpdates / getUpdate](./get-updates.md)

## Sending group

- [sendMessage](./send-message.md)
- [sendPhoto](./send-photo.md)
- [sendSticker](./send-sticker.md)
- [sendVoice](./send-voice.md)
- [sendChatAction](./send-chat-action.md)

## Webhook group

- [setWebhook](./set-webhook.md)
- [deleteWebhook](./delete-webhook.md)
- [getWebhookInfo](./get-webhook-info.md)
- [testWebhook](./test-webhook.md)

## Event and update handling group

- [on](./on.md)
- [onText](./on-text.md)
- [processUpdate](./process-update.md)

## `Message` helper group

- [replyText](./reply-text.md)
- [replyPhoto](./reply-photo.md)
- [replySticker](./reply-sticker.md)
- [replyAction](./reply-action.md)

## Polling runtime group

- [startPolling / stopPolling / isPolling](./start-polling.md)

## Handler-based API group

- [ApplicationBuilder](./application-builder.md)
- [Application](./application.md)
- [CommandHandler](./command-handler.md)
- [MessageHandler](./message-handler.md)
- [filters](./filters.md)
- [CallbackContext](./callback-context.md)

## Related pages

- [Examples and tests](./examples.md)
- [Architecture](./architecture.md)
- [Integration with n8n](./n8n.md)

## Next

Start with [getMe](./get-me.md) if you want to validate the token, or [sendMessage](./send-message.md) if you want to send the first response from the bot.

Last updated: April 5, 2026
