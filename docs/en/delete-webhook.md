# deleteWebhook

This page describes the `deleteWebhook()` function in `zalo-bot-js`, which deletes the bot's current webhook configuration.

This function is useful when you want to switch bots from webhooks to polling or reset deployment configuration.

## Function signature

```ts
deleteWebhook(options?: WebhookOptions): Promise<boolean>
```

## When should you use it?

- Switch from webhooks to polling
- remove old webhooks before reconfiguring
- test or reset bot status

## Return value

The function returns `Promise<boolean>`.

## For example

```ts
await bot.deleteWebhook();
```

## Compatible Alias

The SDK still keeps the alias:

```ts
await bot.deleteWebHook();
```

If starting a new project, `deleteWebhook()` should be preferred.

## Practical note

- after removing the webhook you can switch to `startPolling()`
- should double check with `getWebhookInfo()` if status needs to be confirmed

## Next

- See [setWebhook](./set-webhook.md) to re-register webhooks.
- See [startPolling](./start-polling.md) if you want to run a bot with polling.

Last updated: April 5, 2026
